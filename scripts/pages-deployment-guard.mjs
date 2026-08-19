import { readFile } from 'node:fs/promises'

const ci = await readFile('.github/workflows/ci.yml', 'utf8')
const failures = []
const requireText = (value, label) => { if (!ci.includes(value)) failures.push(`${label}: fehlt: ${value}`) }

for (const [value, label] of [
  ["github.event_name == 'push' && github.ref == 'refs/heads/agent/supabase-auth-foundation'", 'Staging-Deploy muss auf den exakten Release-Branch begrenzt bleiben'],
  ['uses: actions/configure-pages@v5', 'Offizielle Pages-Konfiguration fehlt'],
  ['uses: actions/upload-pages-artifact@v4', 'Offizieller Pages-Artifact-Upload fehlt'],
  ['uses: actions/deploy-pages@v4', 'Offizieller Pages-Deploy fehlt'],
  ['symmedis/ci-quality', 'Maschinenlesbarer Quality-Status fehlt'],
  ['state:"pending",context:"symmedis/ci-quality"', 'Quality-Status muss vor den Checks pending werden'],
  ['symmedis/live-staging', 'Maschinenlesbarer Live-Staging-Status fehlt'],
  ['Verify exact live staging release', 'Exakter Live-Build-Smoke fehlt'],
  ['LIVE_EXPECTED_BUILD="$GITHUB_SHA"', 'Live-Browser-Smoke muss den exakten Build prüfen'],
]) requireText(value, label)

const stagingEnvironment = /environment:\s*\n(?:\s*#[^\n]*\n)*\s*name:\s*symmedis-staging-pages\s*\n/
if (!stagingEnvironment.test(ci)) failures.push('Pages-Deploy muss das dedizierte Environment symmedis-staging-pages tatsächlich verwenden.')
if (/^\s+name:\s*github-pages\s*$/m.test(ci)) failures.push('Der Staging-Deploy darf nicht wieder das potenziell produktionsgeschützte github-pages-Environment verwenden.')

const deployBlock = ci.match(/\n  deploy:\n[\s\S]*$/)?.[0] || ''
if (!deployBlock.includes("if: github.event_name == 'push' && github.ref == 'refs/heads/agent/supabase-auth-foundation'")) {
  failures.push('Der Deploy-Job selbst muss auf den exakten Staging-Branch begrenzt bleiben.')
}
if (!deployBlock.includes('pages: write') || !deployBlock.includes('id-token: write') || !deployBlock.includes('statuses: write')) {
  failures.push('Pages-Deploy benötigt weiterhin pages:write, id-token:write und statuses:write.')
}

if (failures.length) {
  console.error('\nSYMMEDIS Pages Deployment Guard: FEHLGESCHLAGEN\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('SYMMEDIS Pages Deployment Guard: OK')
console.log('✓ Staging-Deploy ist auf den exakten Release-Branch begrenzt')
console.log('✓ Staging nutzt ein eigenes Deployment-Environment statt des produktionsnahen github-pages-Environment')
console.log('✓ Quality-, Pages- und Live-Staging-Ergebnisse bleiben maschinenlesbar am Commit')
console.log('✓ Offizieller Pages-Artifact-/Deploypfad und exakter Live-Browser-Smoke bleiben Pflicht')
