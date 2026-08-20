import { readdir, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { join, relative } from 'node:path'

const root = process.argv[2] || 'dist'

const budgets = {
  largestJsRaw: Number(process.env.SYMMEDIS_MAX_JS_CHUNK_RAW_KB || 560) * 1024,
  largestJsGzip: Number(process.env.SYMMEDIS_MAX_JS_CHUNK_GZIP_KB || 180) * 1024,
  totalJsGzip: Number(process.env.SYMMEDIS_MAX_TOTAL_JS_GZIP_KB || 320) * 1024,
  totalCssGzip: Number(process.env.SYMMEDIS_MAX_TOTAL_CSS_GZIP_KB || 22) * 1024,
  totalCodeGzip: Number(process.env.SYMMEDIS_MAX_TOTAL_CODE_GZIP_KB || 350) * 1024,
}

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await filesUnder(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`
}

let rootStat
try {
  rootStat = await stat(root)
} catch {
  throw new Error(`Performance-Budget: Build-Verzeichnis fehlt: ${root}`)
}
if (!rootStat.isDirectory()) throw new Error(`Performance-Budget: Kein Verzeichnis: ${root}`)

const assetFiles = (await filesUnder(root)).filter((file) => /\.(?:js|css)$/i.test(file))
if (!assetFiles.length) throw new Error(`Performance-Budget: Keine JS/CSS-Artefakte in ${root} gefunden.`)

const assets = []
for (const file of assetFiles) {
  const bytes = await readFile(file)
  assets.push({
    file: relative(root, file),
    type: file.endsWith('.css') ? 'css' : 'js',
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
  })
}

const js = assets.filter((asset) => asset.type === 'js')
const css = assets.filter((asset) => asset.type === 'css')
const largestJs = [...js].sort((a, b) => b.raw - a.raw)[0]
const totalJsGzip = js.reduce((sum, asset) => sum + asset.gzip, 0)
const totalCssGzip = css.reduce((sum, asset) => sum + asset.gzip, 0)
const totalCodeGzip = totalJsGzip + totalCssGzip

console.log('SYMMEDIS Performance Budget')
console.log(`- größter JS-Chunk: ${largestJs?.file || '–'} · raw ${kb(largestJs?.raw || 0)} · gzip ${kb(largestJs?.gzip || 0)}`)
console.log(`- JS gesamt gzip: ${kb(totalJsGzip)}`)
console.log(`- CSS gesamt gzip: ${kb(totalCssGzip)}`)
console.log(`- Code gesamt gzip: ${kb(totalCodeGzip)}`)

const failures = []
if (!largestJs) failures.push('Kein JavaScript-Bundle gefunden.')
if (largestJs?.raw > budgets.largestJsRaw) failures.push(`Größter JS-Chunk raw ${kb(largestJs.raw)} > Budget ${kb(budgets.largestJsRaw)}.`)
if (largestJs?.gzip > budgets.largestJsGzip) failures.push(`Größter JS-Chunk gzip ${kb(largestJs.gzip)} > Budget ${kb(budgets.largestJsGzip)}.`)
if (totalJsGzip > budgets.totalJsGzip) failures.push(`JS gesamt gzip ${kb(totalJsGzip)} > Budget ${kb(budgets.totalJsGzip)}.`)
if (totalCssGzip > budgets.totalCssGzip) failures.push(`CSS gesamt gzip ${kb(totalCssGzip)} > Budget ${kb(budgets.totalCssGzip)}.`)
if (totalCodeGzip > budgets.totalCodeGzip) failures.push(`Code gesamt gzip ${kb(totalCodeGzip)} > Budget ${kb(budgets.totalCodeGzip)}.`)

if (failures.length) {
  console.error('\nPerformance-Budget verletzt:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('✓ Performance-Budget eingehalten')
