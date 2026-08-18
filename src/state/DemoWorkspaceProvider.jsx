import { useCallback, useMemo, useState } from 'react'
import { createWorkspace } from '../data/workspace.js'
import { WorkspaceContext } from './WorkspaceContext.js'

let demoId = 0
const nextId = (prefix) => `demo-${prefix}-${(demoId += 1)}`
const nowIso = () => new Date().toISOString()

export function DemoWorkspaceProvider({ children }) {
  const [kunden, setKunden] = useState(() => createWorkspace())
  const [, setGelesen] = useState(() => new Set())

  const getKunde = useCallback((id) => kunden.find((kunde) => kunde.id === id) ?? null, [kunden])
  const patchKunde = useCallback((kundeId, updater) => {
    setKunden((liste) => liste.map((kunde) => kunde.id === kundeId ? updater(kunde) : kunde))
  }, [])

  const setAufgabeStatus = useCallback(async (kundeId, aufgabeId, status) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      aufgaben: kunde.aufgaben.map((aufgabe) => aufgabe.id === aufgabeId ? { ...aufgabe, status } : aufgabe),
      plan: kunde.plan.map((phase) => ({
        ...phase,
        aufgaben: phase.aufgaben.map((aufgabe) => aufgabe.id === aufgabeId ? { ...aufgabe, status } : aufgabe),
      })),
    }))
    return true
  }, [patchKunde])

  const setAnalyseFeld = useCallback(async (kundeId, kategorieId, patch) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      analyse: kunde.analyse.map((item) => item.kategorieId === kategorieId ? { ...item, ...patch } : item),
    }))
    return true
  }, [patchKunde])

  const setFreigabe = useCallback(async (kundeId, kategorieId, freigabe) => {
    return setAnalyseFeld(kundeId, kategorieId, { freigabe, sichtbarKunde: freigabe === 'kunde' })
  }, [setAnalyseFeld])

  const freigebenAlle = useCallback(async (kundeId) => {
    const kunde = getKunde(kundeId)
    if (!kunde) return 0
    const anzahl = kunde.analyse.filter((item) => item.freigabe === 'intern' || item.freigabe === 'bearbeitet').length
    patchKunde(kundeId, (entry) => ({
      ...entry,
      analyse: entry.analyse.map((item) => item.freigabe === 'intern' || item.freigabe === 'bearbeitet'
        ? { ...item, freigabe: 'kunde', sichtbarKunde: true }
        : item),
    }))
    return anzahl
  }, [getKunde, patchKunde])

  const addNachricht = useCallback(async (kundeId, nachricht) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      chat: [...kunde.chat, { id: nextId('msg'), zeit: nowIso(), ...nachricht }],
    }))
    return true
  }, [patchKunde])

  const addNotiz = useCallback(async (kundeId, text, autor) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      notizenIntern: [{ id: nextId('note'), autor, zeit: nowIso(), text }, ...kunde.notizenIntern],
    }))
    return true
  }, [patchKunde])

  const addDokument = useCallback(async (kundeId, dokument) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      dokumente: [{ id: nextId('doc'), version: 1, status: 'neu', hochgeladen: nowIso().slice(0, 10), ...dokument }, ...kunde.dokumente],
    }))
    return true
  }, [patchKunde])

  const addAktivitaet = useCallback(async (kundeId, eintrag) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      aktivitaet: [{ id: nextId('activity'), zeit: nowIso(), ...eintrag }, ...kunde.aktivitaet],
    }))
    return true
  }, [patchKunde])

  const setBremseStatus = useCallback(async (kundeId, bremseId, status) => {
    patchKunde(kundeId, (kunde) => ({
      ...kunde,
      bremsen: kunde.bremsen.map((bremse) => bremse.id === bremseId ? { ...bremse, status } : bremse),
    }))
    return true
  }, [patchKunde])

  const benachrichtigungen = useMemo(() => [], [])
  const markiereGelesen = useCallback((id) => setGelesen((menge) => new Set(menge).add(id)), [])
  const alleGelesen = useCallback(() => setGelesen(new Set()), [])
  const kennzahlen = useMemo(() => ({
    aktiveKunden: kunden.length,
    laufendeAnalysen: kunden.length,
    offeneFreigaben: kunden.reduce((summe, kunde) => summe + kunde.analyse.filter((item) => item.freigabe !== 'kunde').length, 0),
    neueDokumente: kunden.reduce((summe, kunde) => summe + kunde.dokumente.filter((item) => item.status === 'neu').length, 0),
    offeneAufgaben: kunden.reduce((summe, kunde) => summe + kunde.aufgaben.filter((item) => item.status !== 'erledigt').length, 0),
    ueberfaellig: 0,
    berichteInArbeit: 0,
    termine: [],
    teamAuslastung: 0,
  }), [kunden])

  const value = useMemo(() => ({
    kunden,
    getKunde,
    kennzahlen,
    benachrichtigungen,
    markiereGelesen,
    alleGelesen,
    setAufgabeStatus,
    setAnalyseFeld,
    setFreigabe,
    freigebenAlle,
    addNachricht,
    addNotiz,
    addDokument,
    addAktivitaet,
    setBremseStatus,
    workspaceBereit: true,
    workspaceFehler: null,
    workspaceAktionsfehler: null,
    aktionsfehlerLeeren: () => {},
    workspaceFuerUser: 'demo',
    neuLaden: async () => true,
    echteDaten: false,
  }), [
    kunden, getKunde, kennzahlen, benachrichtigungen, markiereGelesen, alleGelesen,
    setAufgabeStatus, setAnalyseFeld, setFreigabe, freigebenAlle, addNachricht, addNotiz,
    addDokument, addAktivitaet, setBremseStatus,
  ])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
