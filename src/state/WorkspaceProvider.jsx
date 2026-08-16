import { useCallback, useEffect, useMemo, useState } from 'react'
import { WorkspaceContext } from './WorkspaceContext.js'
import { createWorkspace, TEAM_MAP } from '../data/workspace.js'
import { HEUTE, tageBis } from '../lib/format.js'
import { useSession } from '../hooks/useSession.js'
import {
  fetchWorkspace,
  persistActivity,
  persistAnalysisPatch,
  persistBlockerStatus,
  persistDocument,
  persistInternalNote,
  persistMessage,
  persistTaskStatus,
} from '../lib/workspaceApi.js'

let laufendeId = 0
const naechsteId = (prefix) => `${prefix}-${(laufendeId += 1)}`

function jetztIso() {
  return new Date().toISOString()
}

const ANALYSE_DB_KEYS = {
  beobachtung: 'observation',
  ursache: 'cause',
  auswirkung: 'impact',
  empfehlung: 'recommendation',
  beleg: 'evidence',
  prioritaet: 'priority',
  freigabe: 'approval_status',
  sichtbarKunde: 'customer_visible',
  internNotiz: 'internal_note',
  kommentar: 'comment',
}

function analysePatchFuerDb(patch) {
  return Object.fromEntries(
    Object.entries(patch)
      .filter(([key]) => ANALYSE_DB_KEYS[key])
      .map(([key, value]) => [ANALYSE_DB_KEYS[key], value]),
  )
}

export function WorkspaceProvider({ children }) {
  const { session, accessToken, echteAuthentifizierung, authBereit } = useSession()
  const [kunden, setKunden] = useState(() => (echteAuthentifizierung ? [] : createWorkspace()))
  const [gelesen, setGelesen] = useState(() => new Set())
  const [workspaceBereit, setWorkspaceBereit] = useState(!echteAuthentifizierung)
  const [workspaceFehler, setWorkspaceFehler] = useState(null)

  const ladeWorkspace = useCallback(async () => {
    if (!echteAuthentifizierung) {
      setKunden(createWorkspace())
      setWorkspaceBereit(true)
      setWorkspaceFehler(null)
      return
    }
    if (!session || !accessToken) {
      setKunden([])
      setWorkspaceBereit(authBereit)
      setWorkspaceFehler(null)
      return
    }

    setWorkspaceBereit(false)
    setWorkspaceFehler(null)
    try {
      const data = await fetchWorkspace(accessToken)
      setKunden(data)
    } catch (error) {
      setKunden([])
      setWorkspaceFehler(error instanceof Error ? error.message : 'Workspace konnte nicht geladen werden.')
    } finally {
      setWorkspaceBereit(true)
    }
  }, [accessToken, authBereit, echteAuthentifizierung, session])

  useEffect(() => {
    ladeWorkspace()
  }, [ladeWorkspace])

  const meldePersistenzfehler = useCallback((error) => {
    setWorkspaceFehler(error instanceof Error ? error.message : 'Änderung konnte nicht gespeichert werden.')
  }, [])

  const persistiere = useCallback((promise) => {
    if (!promise) return
    Promise.resolve(promise).catch(meldePersistenzfehler)
  }, [meldePersistenzfehler])

  const getKunde = useCallback((id) => kunden.find((k) => k.id === id) ?? null, [kunden])

  const patchKunde = useCallback((kundeId, updater) => {
    setKunden((liste) => liste.map((k) => (k.id === kundeId ? updater(k) : k)))
  }, [])

  const setAufgabeStatus = useCallback(
    (kundeId, aufgabeId, status) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        aufgaben: kunde.aufgaben.map((a) => (a.id === aufgabeId ? { ...a, status } : a)),
      }))
      if (echteAuthentifizierung && accessToken) persistiere(persistTaskStatus(accessToken, aufgabeId, status))
    },
    [accessToken, echteAuthentifizierung, patchKunde, persistiere],
  )

  const setAnalyseFeld = useCallback(
    (kundeId, kategorieId, patch) => {
      const kunde = getKunde(kundeId)
      patchKunde(kundeId, (entry) => ({
        ...entry,
        analyse: entry.analyse.map((item) => item.kategorieId === kategorieId ? { ...item, ...patch } : item),
      }))
      if (echteAuthentifizierung && accessToken && kunde?.projectId) {
        persistiere(persistAnalysisPatch(accessToken, kunde.projectId, kategorieId, analysePatchFuerDb(patch)))
      }
    },
    [accessToken, echteAuthentifizierung, getKunde, patchKunde, persistiere],
  )

  const setFreigabe = useCallback(
    (kundeId, kategorieId, freigabe) => {
      setAnalyseFeld(kundeId, kategorieId, { freigabe, sichtbarKunde: freigabe === 'kunde' })
    },
    [setAnalyseFeld],
  )

  const freigebenAlle = useCallback(
    (kundeId) => {
      const kunde = getKunde(kundeId)
      if (!kunde) return 0
      const aenderungen = kunde.analyse.filter((item) => item.freigabe === 'intern' || item.freigabe === 'bearbeitet')
      patchKunde(kundeId, (entry) => ({
        ...entry,
        analyse: entry.analyse.map((item) => aenderungen.some((change) => change.kategorieId === item.kategorieId)
          ? { ...item, freigabe: 'kunde', sichtbarKunde: true }
          : item),
      }))
      if (echteAuthentifizierung && accessToken && kunde.projectId) {
        aenderungen.forEach((item) => persistiere(persistAnalysisPatch(accessToken, kunde.projectId, item.kategorieId, {
          approval_status: 'kunde', customer_visible: true,
        })))
      }
      return aenderungen.length
    },
    [accessToken, echteAuthentifizierung, getKunde, patchKunde, persistiere],
  )

  const addNachricht = useCallback(
    (kundeId, nachricht) => {
      const kunde = getKunde(kundeId)
      const local = { id: naechsteId('msg'), zeit: jetztIso(), ...nachricht }
      patchKunde(kundeId, (entry) => ({ ...entry, chat: [...entry.chat, local] }))
      if (echteAuthentifizierung && accessToken && kunde?.projectId && session?.userId) {
        persistiere(persistMessage(accessToken, kunde.projectId, session.userId, nachricht))
      }
    },
    [accessToken, echteAuthentifizierung, getKunde, patchKunde, persistiere, session?.userId],
  )

  const addNotiz = useCallback(
    (kundeId, text, autor) => {
      const kunde = getKunde(kundeId)
      const local = { id: naechsteId('note'), autor, zeit: jetztIso(), text }
      patchKunde(kundeId, (entry) => ({ ...entry, notizenIntern: [local, ...entry.notizenIntern] }))
      if (echteAuthentifizierung && accessToken && kunde?.projectId && session?.userId) {
        persistiere(persistInternalNote(accessToken, kunde.projectId, session.userId, text, autor))
      }
    },
    [accessToken, echteAuthentifizierung, getKunde, patchKunde, persistiere, session?.userId],
  )

  const addDokument = useCallback(
    async (kundeId, dokument, file = null) => {
      const kunde = getKunde(kundeId)
      if (echteAuthentifizierung && accessToken && kunde?.projectId && file) {
        try {
          await persistDocument(accessToken, kunde.id, kunde.projectId, file, dokument)
          await ladeWorkspace()
          return true
        } catch (error) {
          meldePersistenzfehler(error)
          throw error
        }
      }

      patchKunde(kundeId, (entry) => ({
        ...entry,
        dokumente: [{ id: naechsteId('doc'), version: 1, status: 'neu', hochgeladen: jetztIso().slice(0, 10), ...dokument }, ...entry.dokumente],
        aktivitaet: [{ id: naechsteId('akt'), titel: `Dokument hochgeladen: ${dokument.name}`, actor: dokument.von === 'kunde' ? entry.ansprechpartner.name : 'SYMMEDIS', tone: 'info', zeit: jetztIso() }, ...entry.aktivitaet],
      }))
      return true
    },
    [accessToken, echteAuthentifizierung, getKunde, ladeWorkspace, meldePersistenzfehler, patchKunde],
  )

  const addAktivitaet = useCallback(
    (kundeId, eintrag) => {
      const kunde = getKunde(kundeId)
      const local = { id: naechsteId('akt'), zeit: jetztIso(), ...eintrag }
      patchKunde(kundeId, (entry) => ({ ...entry, aktivitaet: [local, ...entry.aktivitaet] }))
      if (echteAuthentifizierung && accessToken && kunde?.projectId) persistiere(persistActivity(accessToken, kunde.projectId, local))
    },
    [accessToken, echteAuthentifizierung, getKunde, patchKunde, persistiere],
  )

  const setBremseStatus = useCallback(
    (kundeId, bremseId, status) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        bremsen: kunde.bremsen.map((b) => (b.id === bremseId ? { ...b, status } : b)),
      }))
      if (echteAuthentifizierung && accessToken) persistiere(persistBlockerStatus(accessToken, bremseId, status))
    },
    [accessToken, echteAuthentifizierung, patchKunde, persistiere],
  )

  const benachrichtigungen = useMemo(() => {
    const liste = []
    for (const kunde of kunden) {
      const ueberfaellig = kunde.aufgaben.filter((a) => a.status !== 'erledigt' && a.faellig && tageBis(a.faellig) < 0)
      if (ueberfaellig.length > 0) {
        liste.push({ id: `n-${kunde.id}-faellig`, kundeId: kunde.id, tone: 'urgent', titel: `${ueberfaellig.length} überfällige Aufgabe${ueberfaellig.length > 1 ? 'n' : ''}`, text: `${kunde.unternehmen} · ${ueberfaellig[0].titel}`, zeit: ueberfaellig[0].faellig })
      }
      const offeneFreigaben = kunde.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern').length
      if (offeneFreigaben > 0) liste.push({ id: `n-${kunde.id}-freigabe`, kundeId: kunde.id, tone: 'warn', titel: `${offeneFreigaben} Analysepunkte warten auf Freigabe`, text: kunde.unternehmen, zeit: kunde.ergebnis })
      const neueDokumente = kunde.dokumente.filter((d) => d.status === 'neu').length
      if (neueDokumente > 0) liste.push({ id: `n-${kunde.id}-doks`, kundeId: kunde.id, tone: 'info', titel: `${neueDokumente} neue Dokumente`, text: kunde.unternehmen, zeit: kunde.dokumente[0]?.hochgeladen })
    }
    return liste.map((n) => ({ ...n, gelesen: gelesen.has(n.id) }))
  }, [kunden, gelesen])

  const markiereGelesen = useCallback((id) => setGelesen((menge) => new Set(menge).add(id)), [])
  const alleGelesen = useCallback(() => setGelesen((menge) => {
    const neu = new Set(menge)
    benachrichtigungen.forEach((item) => neu.add(item.id))
    return neu
  }), [benachrichtigungen])

  const kennzahlen = useMemo(() => {
    const aktive = kunden.filter((k) => k.status !== 'abgeschlossen')
    const alleAufgaben = kunden.flatMap((k) => k.aufgaben)
    return {
      aktiveKunden: aktive.length,
      laufendeAnalysen: kunden.filter((k) => k.status === 'analyse' || k.status === 'pruefung').length,
      offeneFreigaben: kunden.reduce((sum, k) => sum + k.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern').length, 0),
      neueDokumente: kunden.reduce((sum, k) => sum + k.dokumente.filter((d) => d.status === 'neu').length, 0),
      offeneAufgaben: alleAufgaben.filter((a) => a.status !== 'erledigt').length,
      ueberfaellig: alleAufgaben.filter((a) => a.status !== 'erledigt' && a.faellig && tageBis(a.faellig) < 0).length,
      berichteInArbeit: kunden.reduce((sum, k) => sum + k.berichte.filter((b) => b.stand === 'entwurf').length, 0),
      termine: kunden.flatMap((k) => k.termine.map((t) => ({ ...t, kundeId: k.id, unternehmen: k.unternehmen }))).filter((t) => new Date(t.datum) >= HEUTE).sort((a, b) => new Date(a.datum) - new Date(b.datum)),
      teamAuslastung: Math.round(Object.values(TEAM_MAP).reduce((s, m) => s + m.auslastung, 0) / Object.keys(TEAM_MAP).length),
    }
  }, [kunden])

  const value = useMemo(() => ({
    kunden, getKunde, kennzahlen, benachrichtigungen, markiereGelesen, alleGelesen,
    setAufgabeStatus, setAnalyseFeld, setFreigabe, freigebenAlle, addNachricht, addNotiz,
    addDokument, addAktivitaet, setBremseStatus,
    workspaceBereit, workspaceFehler, neuLaden: ladeWorkspace, echteDaten: echteAuthentifizierung,
  }), [
    kunden, getKunde, kennzahlen, benachrichtigungen, markiereGelesen, alleGelesen,
    setAufgabeStatus, setAnalyseFeld, setFreigabe, freigebenAlle, addNachricht, addNotiz,
    addDokument, addAktivitaet, setBremseStatus, workspaceBereit, workspaceFehler, ladeWorkspace, echteAuthentifizierung,
  ])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
