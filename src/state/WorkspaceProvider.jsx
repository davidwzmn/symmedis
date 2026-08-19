import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  beobachtung: 'observation', ursache: 'cause', auswirkung: 'impact', empfehlung: 'recommendation',
  beleg: 'evidence', prioritaet: 'priority', freigabe: 'approval_status', sichtbarKunde: 'customer_visible',
  internNotiz: 'internal_note', kommentar: 'comment',
}

function analysePatchFuerDb(patch) {
  return Object.fromEntries(Object.entries(patch).filter(([key]) => ANALYSE_DB_KEYS[key]).map(([key, value]) => [ANALYSE_DB_KEYS[key], value]))
}

export function WorkspaceProvider({ children }) {
  const { session, accessToken, echteAuthentifizierung, authBereit } = useSession()
  const [kunden, setKunden] = useState(() => (echteAuthentifizierung ? [] : createWorkspace()))
  const [gelesen, setGelesen] = useState(() => new Set())
  const [workspaceBereit, setWorkspaceBereit] = useState(!echteAuthentifizierung)
  const [workspaceFehler, setWorkspaceFehler] = useState(null)
  const [workspaceAktionsfehler, setWorkspaceAktionsfehler] = useState(null)
  const [workspaceFuerUser, setWorkspaceFuerUser] = useState(echteAuthentifizierung ? null : 'demo')
  const workspaceUserRef = useRef(echteAuthentifizierung ? null : 'demo')
  const workspaceRequestRef = useRef(0)

  const ladeWorkspace = useCallback(async () => {
    const requestId = workspaceRequestRef.current + 1
    workspaceRequestRef.current = requestId
    setWorkspaceAktionsfehler(null)

    if (!echteAuthentifizierung) {
      workspaceUserRef.current = 'demo'
      setKunden(createWorkspace())
      setWorkspaceBereit(true)
      setWorkspaceFehler(null)
      setWorkspaceFuerUser('demo')
      return
    }
    if (!session || !accessToken) {
      workspaceUserRef.current = null
      setKunden([])
      setWorkspaceBereit(authBereit)
      setWorkspaceFehler(null)
      setWorkspaceFuerUser(null)
      return
    }

    const zielUser = session.userId
    const backgroundRefresh = workspaceUserRef.current === zielUser
    if (!backgroundRefresh) {
      setKunden([])
      setWorkspaceBereit(false)
      setWorkspaceFuerUser(null)
    }
    setWorkspaceFehler(null)

    try {
      const data = await fetchWorkspace(accessToken)
      if (requestId !== workspaceRequestRef.current) return
      setKunden(data)
      workspaceUserRef.current = zielUser
      setWorkspaceFuerUser(zielUser)
    } catch (error) {
      if (requestId !== workspaceRequestRef.current) return
      const message = error instanceof Error ? error.message : 'Workspace konnte nicht geladen werden.'
      if (backgroundRefresh) {
        setWorkspaceFehler(null)
        setWorkspaceAktionsfehler(`Aktualisierung fehlgeschlagen. Der letzte bestätigte Stand bleibt sichtbar. ${message}`)
      } else {
        setKunden([])
        setWorkspaceFehler(message)
        setWorkspaceFuerUser(zielUser)
      }
    } finally {
      if (requestId === workspaceRequestRef.current) setWorkspaceBereit(true)
    }
  }, [accessToken, authBereit, echteAuthentifizierung, session])

  useEffect(() => { ladeWorkspace() }, [ladeWorkspace])

  const meldePersistenzfehler = useCallback((error) => {
    setWorkspaceAktionsfehler(error instanceof Error ? error.message : 'Änderung konnte nicht gespeichert werden.')
  }, [])
  const aktionsfehlerLeeren = useCallback(() => setWorkspaceAktionsfehler(null), [])
  const getKunde = useCallback((id) => kunden.find((k) => k.id === id) ?? null, [kunden])
  const patchKunde = useCallback((kundeId, updater) => {
    setKunden((liste) => liste.map((k) => (k.id === kundeId ? updater(k) : k)))
  }, [])

  const setAufgabeStatus = useCallback(async (kundeId, aufgabeId, status) => {
    const kunde = getKunde(kundeId)
    const vorher = kunde?.aufgaben.find((a) => a.id === aufgabeId)?.status
    patchKunde(kundeId, (entry) => ({ ...entry, aufgaben: entry.aufgaben.map((a) => (a.id === aufgabeId ? { ...a, status } : a)) }))

    if (echteAuthentifizierung && accessToken) {
      try {
        await persistTaskStatus(accessToken, aufgabeId, status)
      } catch (error) {
        if (vorher) patchKunde(kundeId, (entry) => ({ ...entry, aufgaben: entry.aufgaben.map((a) => (a.id === aufgabeId ? { ...a, status: vorher } : a)) }))
        throw error
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, patchKunde])

  const setAnalyseFeld = useCallback(async (kundeId, kategorieId, patch) => {
    const kunde = getKunde(kundeId)
    const eintrag = kunde?.analyse.find((item) => item.kategorieId === kategorieId)
    if (!kunde || !eintrag) return false

    const vorher = Object.fromEntries(Object.keys(patch).map((key) => [key, eintrag[key]]))
    patchKunde(kundeId, (entry) => ({ ...entry, analyse: entry.analyse.map((item) => item.kategorieId === kategorieId ? { ...item, ...patch } : item) }))

    if (echteAuthentifizierung && accessToken && kunde.projectId) {
      try {
        await persistAnalysisPatch(accessToken, kunde.projectId, kategorieId, analysePatchFuerDb(patch))
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, analyse: entry.analyse.map((item) => item.kategorieId === kategorieId ? { ...item, ...vorher } : item) }))
        meldePersistenzfehler(error)
        return false
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, meldePersistenzfehler, patchKunde])

  const setFreigabe = useCallback(async (kundeId, kategorieId, freigabe) => {
    const kunde = getKunde(kundeId)
    const eintrag = kunde?.analyse.find((item) => item.kategorieId === kategorieId)
    if (!kunde || !eintrag) return false

    const vorher = { freigabe: eintrag.freigabe, sichtbarKunde: eintrag.sichtbarKunde }
    const patch = { freigabe, sichtbarKunde: freigabe === 'kunde' }
    patchKunde(kundeId, (entry) => ({ ...entry, analyse: entry.analyse.map((item) => item.kategorieId === kategorieId ? { ...item, ...patch } : item) }))

    if (echteAuthentifizierung && accessToken && kunde.projectId) {
      try {
        await persistAnalysisPatch(accessToken, kunde.projectId, kategorieId, analysePatchFuerDb(patch))
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, analyse: entry.analyse.map((item) => item.kategorieId === kategorieId ? { ...item, ...vorher } : item) }))
        meldePersistenzfehler(error)
        return false
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, meldePersistenzfehler, patchKunde])

  const freigebenAlle = useCallback(async (kundeId) => {
    const kunde = getKunde(kundeId)
    if (!kunde) return 0
    const aenderungen = kunde.analyse.filter((item) => item.freigabe === 'intern' || item.freigabe === 'bearbeitet')
    if (!aenderungen.length) return 0
    const vorher = new Map(aenderungen.map((item) => [item.kategorieId, { freigabe: item.freigabe, sichtbarKunde: item.sichtbarKunde }]))

    patchKunde(kundeId, (entry) => ({
      ...entry,
      analyse: entry.analyse.map((item) => aenderungen.some((change) => change.kategorieId === item.kategorieId) ? { ...item, freigabe: 'kunde', sichtbarKunde: true } : item),
    }))

    if (echteAuthentifizierung && accessToken && kunde.projectId) {
      try {
        await Promise.all(aenderungen.map((item) => persistAnalysisPatch(accessToken, kunde.projectId, item.kategorieId, { approval_status: 'kunde', customer_visible: true })))
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, analyse: entry.analyse.map((item) => vorher.has(item.kategorieId) ? { ...item, ...vorher.get(item.kategorieId) } : item) }))
        meldePersistenzfehler(error)
        return 0
      }
    }
    return aenderungen.length
  }, [accessToken, echteAuthentifizierung, getKunde, meldePersistenzfehler, patchKunde])

  const addNachricht = useCallback(async (kundeId, nachricht) => {
    const kunde = getKunde(kundeId)
    const local = { id: naechsteId('msg'), zeit: jetztIso(), ...nachricht }
    patchKunde(kundeId, (entry) => ({ ...entry, chat: [...entry.chat, local] }))

    if (echteAuthentifizierung && accessToken && kunde?.projectId && session?.userId) {
      try {
        await persistMessage(accessToken, kunde.projectId, session.userId, nachricht)
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, chat: entry.chat.filter((item) => item.id !== local.id) }))
        throw error
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, patchKunde, session?.userId])

  const addNotiz = useCallback(async (kundeId, text, autor) => {
    const kunde = getKunde(kundeId)
    const local = { id: naechsteId('note'), autor, zeit: jetztIso(), text }
    patchKunde(kundeId, (entry) => ({ ...entry, notizenIntern: [local, ...entry.notizenIntern] }))

    if (echteAuthentifizierung && accessToken && kunde?.projectId && session?.userId) {
      try {
        await persistInternalNote(accessToken, kunde.projectId, session.userId, text, autor)
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, notizenIntern: entry.notizenIntern.filter((item) => item.id !== local.id) }))
        meldePersistenzfehler(error)
        return false
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, meldePersistenzfehler, patchKunde, session?.userId])

  const addDokument = useCallback(async (kundeId, dokument, file = null) => {
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
  }, [accessToken, echteAuthentifizierung, getKunde, ladeWorkspace, meldePersistenzfehler, patchKunde])

  const addAktivitaet = useCallback(async (kundeId, eintrag) => {
    const kunde = getKunde(kundeId)
    const local = { id: naechsteId('akt'), zeit: jetztIso(), ...eintrag }
    patchKunde(kundeId, (entry) => ({ ...entry, aktivitaet: [local, ...entry.aktivitaet] }))

    if (echteAuthentifizierung && accessToken && kunde?.projectId) {
      try {
        await persistActivity(accessToken, kunde.projectId, local)
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, aktivitaet: entry.aktivitaet.filter((item) => item.id !== local.id) }))
        meldePersistenzfehler(error)
        return false
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, meldePersistenzfehler, patchKunde])

  const setBremseStatus = useCallback(async (kundeId, bremseId, status) => {
    const kunde = getKunde(kundeId)
    const vorher = kunde?.bremsen.find((b) => b.id === bremseId)?.status
    if (!kunde || vorher === undefined) return false

    patchKunde(kundeId, (entry) => ({ ...entry, bremsen: entry.bremsen.map((b) => (b.id === bremseId ? { ...b, status } : b)) }))
    if (echteAuthentifizierung && accessToken) {
      try {
        await persistBlockerStatus(accessToken, bremseId, status)
      } catch (error) {
        patchKunde(kundeId, (entry) => ({ ...entry, bremsen: entry.bremsen.map((b) => (b.id === bremseId ? { ...b, status: vorher } : b)) }))
        meldePersistenzfehler(error)
        return false
      }
    }
    return true
  }, [accessToken, echteAuthentifizierung, getKunde, meldePersistenzfehler, patchKunde])

  const benachrichtigungen = useMemo(() => {
    const liste = []
    for (const kunde of kunden) {
      const ueberfaellig = kunde.aufgaben.filter((a) => a.status !== 'erledigt' && a.faellig && tageBis(a.faellig) < 0)
      if (ueberfaellig.length > 0) liste.push({ id: `n-${kunde.id}-faellig`, kundeId: kunde.id, tone: 'urgent', titel: `${ueberfaellig.length} überfällige Aufgabe${ueberfaellig.length > 1 ? 'n' : ''}`, text: `${kunde.unternehmen} · ${ueberfaellig[0].titel}`, zeit: ueberfaellig[0].faellig })
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
    workspaceBereit, workspaceFehler, workspaceAktionsfehler, aktionsfehlerLeeren,
    workspaceFuerUser, neuLaden: ladeWorkspace, echteDaten: echteAuthentifizierung,
  }), [
    kunden, getKunde, kennzahlen, benachrichtigungen, markiereGelesen, alleGelesen,
    setAufgabeStatus, setAnalyseFeld, setFreigabe, freigebenAlle, addNachricht, addNotiz,
    addDokument, addAktivitaet, setBremseStatus, workspaceBereit, workspaceFehler,
    workspaceAktionsfehler, aktionsfehlerLeeren, workspaceFuerUser, ladeWorkspace, echteAuthentifizierung,
  ])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
