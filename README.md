# SYMMEDIS Diagnosis OS – Interaktive Beta-Demo

One-Pager mit interaktiver Ursachenanalyse und zwei Chat-Zugängen (Kunde und
Mitarbeiter). React + Vite + Tailwind CSS, mit einem schlanken Node-Server, der
die Anthropic-API kapselt.

> **Beta-Demo.** Alle Inhalte, Anfragen und Gesprächsverläufe sind fiktiv. Es
> werden keine echten Patienten- oder Gesundheitsdaten verarbeitet und nichts
> dauerhaft gespeichert.

---

## Setup

```bash
npm install
npm run dev          # Entwicklung → http://localhost:5173
```

Produktionsbetrieb:

```bash
npm run build        # erzeugt dist/
npm run preview      # Node-Server auf http://localhost:4173 (liefert dist/ + /api)
```

Weitere Skripte:

| Befehl          | Zweck                                                       |
| --------------- | ----------------------------------------------------------- |
| `npm run dev`   | Vite-Dev-Server inkl. `/api`-Routen (identisch zur Produktion) |
| `npm run build` | Produktionsbuild nach `dist/`                                |
| `npm run preview` / `npm start` | Node-Server für `dist/` + `/api`             |
| `npm run lint`  | ESLint (läuft fehler- und warnungsfrei durch)                |

### Anthropic-API konfigurieren (optional)

Der API-Key steht **ausschließlich in der Umgebung** und wird nie an den Browser
ausgeliefert. Alle Modellaufrufe laufen serverseitig über `/api/*`.

```bash
cp .env.example .env      # nur als Referenz – Werte als echte Env-Variablen setzen
export ANTHROPIC_API_KEY=…
npm run build && npm run preview
```

| Variable             | Standard                    | Bedeutung                              |
| -------------------- | --------------------------- | -------------------------------------- |
| `ANTHROPIC_API_KEY`  | –                           | Aktiviert die KI-Auswertung            |
| `ANTHROPIC_MODEL`    | `claude-sonnet-4-6`         | Modell laut Briefing                   |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | Abweichender Endpunkt (z. B. Proxy)    |
| `PORT`               | `4173`                      | Port des Produktions-Servers           |

**Ohne Key läuft die Demo vollständig weiter.** Analyse und Chat greifen dann auf
ein lokales, regelbasiertes Demo-Modell zurück, das ebenfalls eingabeabhängige
und variierende Ergebnisse liefert. Die Herkunft wird in der Oberfläche
transparent ausgewiesen („KI-gestützte Auswertung“ vs. „Lokales Demo-Modell“).

Feste Vorgaben je Modellaufruf: `model: claude-sonnet-4-6`, `max_tokens: 1000`,
vollständige Conversation-History bei jedem Chat-Request.

---

## Struktur

```
index.html                 Einstiegspunkt, SEO-Meta, Favicon (inline SVG)
server/
  api.mjs                  /api/analyze, /api/chat, /api/status + Fallback-Logik
  index.mjs                Statischer Server für dist/ (ohne Fremd-Abhängigkeiten)
vite.config.js             Vite + Tailwind + dieselben /api-Routen im Dev-Server
src/
  main.jsx                 Provider-Baum (Toast → Inbox → App)
  App.jsx                  Seitenaufbau, Dialog- und Sitzungssteuerung
  index.css                Tailwind-Theme: Farben, Typografie, Basis, Utilities
  content/site.js          Sämtliche Website-Texte an einer Stelle
  lib/
    analysis.js            Prompts, Antwort-Normalisierung, lokales Demo-Modell
    api.js                 Client-seitiger API-Zugriff inkl. Timeout und Fallback
    scroll.js              Sanftes Scrollen mit Fokus-Übergabe
  hooks/                   useTheme, useScrollSpy, useToast, useInbox
  context/                 Toast- und Inbox-Kontext (ohne Komponenten)
  components/
    layout/                Header (Navigation, Mobile-Menü), Footer, Logo
    sections/              Hero, Problem, Prozess, Zielgruppe, Angebot,
                           UeberUns, Termin, SectionHeading
    demo/                  DemoModal (Analyse-Flow), AnalysisResult
    portal/                PortalModal (Login), CustomerChat, StaffConsole
    ui/                    Button, Modal, Field, Toast, Spinner, Reveal, Icons
    InboxProvider.jsx      Gemeinsamer Zustand für Chat, Formular und Posteingang
```

`src/lib/analysis.js` wird bewusst von Server **und** Client importiert – dieselbe
Logik erzeugt die Ergebnisse, egal wo der Fallback greift.

---

## Funktionen

### Seitenaufbau

One-Pager mit Ankernavigation: Start · Das Problem · Ursachenanalyse · Für wen? ·
Über uns · Kundenlogin · Termin buchen. Dazu Hero mit den vier häufigsten
Ursachen und Kennzahlen, Kernangebot mit Fakten-Box, Über uns, Terminformular und
Footer.

### Interaktive Demo

Branche wählen, Situation beschreiben, Analyse starten. Ein sichtbarer
Analysedurchlauf (vier Schritte) führt zum Ergebnis:

- Bewertung der vier Ursachen-Kategorien mit Reifegrad 0–100 und Einstufung
- die drei größten Umsatzbremsen mit Begründung
- ein 90-Tage-Plan in drei Phasen

### Chat-Zugänge

- **Kundenlogin →** KI-gestützter Chat mit einem SYMMEDIS-Berater. Die
  vollständige History wird bei jedem Request mitgeschickt.
- **Mitarbeiterlogin →** interner Posteingang mit fiktiven Anfragen: filtern,
  Status ändern, mit Textbausteinen antworten.

Beide Logins sind Demo-Attrappen ohne echte Authentifizierung; jede Eingabe wird
akzeptiert und ist als Demo gekennzeichnet. Der Chat-Verlauf liegt
ausschließlich im React-State – **kein localStorage**.

---

## Eigenständig ergänzte Features

Über das Briefing hinaus ergänzt, um eine wirklich benutzbare Demo zu erhalten:

**Verbindung der Bereiche**

- Antwortet eine Mitarbeiterin im Live-Thread, erscheint die Antwort sofort im
  Kundenchat – sichtbar als „SYMMEDIS Team“ statt als Assistent.
- Eine abgeschickte Formularanfrage landet unmittelbar als neuer Eingang in der
  Mitarbeiteransicht.

**Zustände und Fehlerbehandlung**

- Ladezustände für Analyse, Chat, Login und Formular; abbrechbarer Analyselauf.
- Timeouts (Client 50 s, Server 45 s) und mehrstufiger Fallback: Anthropic →
  serverseitiges Demo-Modell → clientseitiges Demo-Modell, falls kein Backend
  erreichbar ist. Die Demo bleibt dadurch immer bedienbar.
- Ausweisung der Ergebnisherkunft und Hinweiszeile, wenn der Fallback greift.
- Empty States (leerer Filter, keine Auswahl) und Fehleransicht mit Wiederholung.
- Serverseitige Validierung inkl. Größenlimit für Request-Bodies.

**Bedienung und Zugänglichkeit**

- Fokus-Management in Dialogen: Autofokus, Fokus-Trap, Escape schließt, Fokus
  kehrt zum auslösenden Element zurück, Hintergrund scrollt nicht mit.
- Tastaturbedienung im Chat (Enter senden, Umschalt+Enter neue Zeile).
- Skip-Link, sichtbarer Fokusring, `aria-live` für Toasts, Chatverlauf und
  Analysefortschritt, beschriftete Formularfelder mit Fehlerbezug.
- Aktiver Navigationszustand über Scrollspy, Mobile-Menü, sanftes Scrollen mit
  Fokusübergabe, `prefers-reduced-motion` wird respektiert.
- Toast-Feedback bei Formular, Login, Antworten und Fehlern.

**Inhaltliches**

- Sechs Branchen und drei Beispieltexte für einen schnellen Demo-Einstieg.
- Textbausteine und Statusverwaltung in der Mitarbeiteransicht.
- Impressum, Datenschutz und LinkedIn als Dialoge mit klar als Demo
  gekennzeichneten Platzhaltertexten – keine toten Links.

---

## Design

- Heller Grundmodus mit viel Weißraum, Dark Mode per Umschalter (Standard hell,
  Auswahl wird gespeichert).
- Primärfarbe: tiefes Petrol-Marine. Akzent: Kupfer/Messing. Neutrale, leicht
  warme Grautöne. Kein Standard-KI-Lila, kein Neon.
- Serifen-Headlines, Sans-Serif im Fließtext – ausschließlich Systemschriften,
  daher keine externen Requests und kein Font-Flackern.

---

## Geprüft

- `npm run build` und `npm run lint` laufen ohne Fehler und ohne Warnungen durch.
- Browser-Konsole beim Durchklicken frei von Errors und Warnings.
- Kein horizontales Overflow bei 375 px, 768 px und 1440 px – hell und dunkel.
- Alle Textfarben erfüllen WCAG AA (Seite und alle Dialoge, beide Modi).
- Durchgespielt: Ankernavigation, Theme-Toggle, Mobile-Menü, Demo-Flow inkl.
  Validierung und variierender Ausgabe, beide Logins, beide Chats,
  Formularvalidierung und -versand, Footer-Dialoge, Fokus-Trap und
  Fokusrückgabe.
- API-Pfad gegen einen Mock verifiziert (Modell, `max_tokens`, System-Prompt,
  vollständige History) sowie die Fallback-Pfade bei nicht erreichbarem oder
  fehlerhaftem Upstream.
