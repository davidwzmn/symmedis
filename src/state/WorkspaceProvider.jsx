import { useCallback, useMemo, useState } from 'react'
import { WorkspaceContext } from './WorkspaceContext.js'
import { createWorkspace, TEAM_MAP } from '../data/workspace.js'
import { HEUTE, tageBis } from '../lib/format.js'

let laufendeId = 0
const naechsteId = (prefix) => `${prefix}-${(laufendeId += 1)}`

function jetztIso() {
  return new Date().toISOString()
}

export function WorkspaceProvider({ children }) {
  const [kunden, setKunden] = useState(createWorkspace)
  const [gelesen, setGelesen] = useState(() => new Set())

  const patchKunde = useCallback((kundeId, updater) => {
    setKunden((liste) => liste.map((k) => (k.id === kundeId ? updater(k) : k)))
  }, [])

  /* ------------------------------------------------------------ Aufgaben */

  const setAufgabeStatus = useCallback(
    (kundeId, aufgabeId, status) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        aufgaben: kunde.aufgaben.map((a) => (a.id === aufgabeId ? { ...a, status } : a)),
      }))
    },
    [patchKunde],
  )

  /* ------------------------------------------- Analyse-Editor & Freigaben */

  const setAnalyseFeld = useCallback(
    (kundeId, kategorieId, patch) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        analyse: kunde.analyse.map((eintrag) =>
          eintrag.kategorieId === kategorieId ? { ...eintrag, ...patch } : eintrag,
        ),
      }))
    },
    [patchKunde],
  )

  const setFreigabe = useCallback(
    (kundeId, kategorieId, freigabe) => {
      setAnalyseFeld(kundeId, kategorieId, { freigabe, sichtbarKunde: freigabe === 'kunde' })
    },
    [setAnalyseFeld],
  )

  /** Alle geprüften Punkte auf einmal für den Kunden freigeben. */
  const freigebenAlle = useCallback(
    (kundeId) => {
      let anzahl = 0
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        analyse: kunde.analyse.map((eintrag) => {
          if (eintrag.freigabe === 'intern' || eintrag.freigabe === 'bearbeitet') {
            anzahl += 1
            return { ...eintrag, freigabe: 'kunde', sichtbarKunde: true }
          }
          return eintrag
        }),
      }))
      return anzahl
    },
    [patchKunde],
  )

  /* ---------------------------------------------------------------- Chat */

  const addNachricht = useCallback(
    (kundeId, nachricht) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        chat: [...kunde.chat, { id: naechsteId('msg'), zeit: jetztIso(), ...nachricht }],
      }))
    },
    [patchKunde],
  )

  /* -------------------------------------------------- Notizen & Dokumente */

  const addNotiz = useCallback(
    (kundeId, text, autor) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        notizenIntern: [
          { id: naechsteId('note'), autor, zeit: jetztIso(), text },
          ...kunde.notizenIntern,
        ],
      }))
    },
    [patchKunde],
  )

  const addDokument = useCallback(
    (kundeId, dokument) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        dokumente: [
          {
            id: naechsteId('doc'),
            version: 1,
            status: 'neu',
            hochgeladen: jetztIso().slice(0, 10),
            ...dokument,
          },
          ...kunde.dokumente,
        ],
        aktivitaet: [
          {
            id: naechsteId('akt'),
            titel: `Dokument hochgeladen: ${dokument.name}`,
            actor: dokument.von === 'kunde' ? kunde.ansprechpartner.name : 'SYMMEDIS',
            tone: 'info',
            zeit: jetztIso(),
          },
          ...kunde.aktivitaet,
        ],
      }))
    },
    [patchKunde],
  )

  const addAktivitaet = useCallback(
    (kundeId, eintrag) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        aktivitaet: [{ id: naechsteId('akt'), zeit: jetztIso(), ...eintrag }, ...kunde.aktivitaet],
      }))
    },
    [patchKunde],
  )

  const setBremseStatus = useCallback(
    (kundeId, bremseId, status) => {
      patchKunde(kundeId, (kunde) => ({
        ...kunde,
        bremsen: kunde.bremsen.map((b) => (b.id === bremseId ? { ...b, status } : b)),
      }))
    },
    [patchKunde],
  )

  /* ------------------------------------------------------ Abgeleitete Daten */

  const benachrichtigungen = useMemo(() => {
    const liste = []
    for (const kunde of kunden) {
      const ueberfaellig = kunde.aufgaben.filter(
        (a) => a.status !== 'erledigt' && tageBis(a.faellig) < 0,
      )
      if (ueberfaellig.length > 0) {
        liste.push({
          id: `n-${kunde.id}-faellig`,
          kundeId: kunde.id,
          tone: 'urgent',
          titel: `${ueberfaellig.length} überfällige Aufgabe${ueberfaellig.length > 1 ? 'n' : ''}`,
          text: `${kunde.unternehmen} · ${ueberfaellig[0].titel}`,
          zeit: ueberfaellig[0].faellig,
        })
      }

      const offeneFreigaben = kunde.analyse.filter(
        (a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern',
      ).length
      if (offeneFreigaben > 0) {
        liste.push({
          id: `n-${kunde.id}-freigabe`,
          kundeId: kunde.id,
          tone: 'warn',
          titel: `${offeneFreigaben} Analysepunkte warten auf Freigabe`,
          text: kunde.unternehmen,
          zeit: kunde.ergebnis,
        })
      }

      const neueDokumente = kunde.dokumente.filter((d) => d.status === 'neu').length
      if (neueDokumente > 0) {
        liste.push({
          id: `n-${kunde.id}-doks`,
          kundeId: kunde.id,
          tone: 'info',
          titel: `${neueDokumente} neue Dokumente`,
          text: kunde.unternehmen,
          zeit: kunde.dokumente[0]?.hochgeladen,
        })
      }
    }
    return liste.map((n) => ({ ...n, gelesen: gelesen.has(n.id) }))
  }, [kunden, gelesen])

  const markiereGelesen = useCallback((id) => {
    setGelesen((menge) => new Set(menge).add(id))
  }, [])

  const alleGelesen = useCallback(() => {
    setKunden((liste) => liste)
    setGelesen((menge) => {
      const neu = new Set(menge)
      return neu
    })
  }, [])

  const kennzahlen = useMemo(() => {
    const aktive = kunden.filter((k) => k.status !== 'abgeschlossen')
    const alleAufgaben = kunden.flatMap((k) => k.aufgaben)
    return {
      aktiveKunden: aktive.length,
      laufendeAnalysen: kunden.filter((k) => k.status === 'analyse' || k.status === 'pruefung').length,
      offeneFreigaben: kunden.reduce(
        (sum, k) => sum + k.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern').length,
        0,
      ),
      neueDokumente: kunden.reduce((sum, k) => sum + k.dokumente.filter((d) => d.status === 'neu').length, 0),
      offeneAufgaben: alleAufgaben.filter((a) => a.status !== 'erledigt').length,
      ueberfaellig: alleAufgaben.filter((a) => a.status !== 'erledigt' && tageBis(a.faellig) < 0).length,
      berichteInArbeit: kunden.reduce(
        (sum, k) => sum + k.berichte.filter((b) => b.stand === 'entwurf').length,
        0,
      ),
      termine: kunden
        .flatMap((k) => k.termine.map((t) => ({ ...t, kundeId: k.id, unternehmen: k.unternehmen })))
        .filter((t) => new Date(t.datum) >= HEUTE)
        .sort((a, b) => new Date(a.datum) - new Date(b.datum)),
      teamAuslastung: Math.round(
        Object.values(TEAM_MAP).reduce((s, m) => s + m.auslastung, 0) / Object.keys(TEAM_MAP).length,
      ),
    }
  }, [kunden])

  const getKunde = useCallback((id) => kunden.find((k) => k.id === id) ?? null, [kunden])

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
