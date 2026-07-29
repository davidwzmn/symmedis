# SYMMEDIS Diagnosis OS – Interaktive Beta-Demo

Plattform für strategische Ursachenanalyse in Gesundheit und MedTech:
öffentliche Website, Produktdemo, Kundenportal und Mitarbeiterportal in einer
Anwendung. React + Vite + Tailwind CSS v4, mit einem schlanken Node-Server, der
die Anthropic-API kapselt.

> **Beta-Demo.** Alle Unternehmen, Zahlen, Dokumente und Gesprächsverläufe sind
> fiktiv. Es werden keine echten Patienten- oder Gesundheitsdaten verarbeitet
> und nichts dauerhaft gespeichert.

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

| Befehl                          | Zweck                                                          |
| ------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                   | Vite-Dev-Server inkl. `/api`-Routen (identisch zur Produktion)  |
| `npm run build`                 | Produktionsbuild nach `dist/`                                   |
| `npm run preview` / `npm start` | Node-Server für `dist/` + `/api`                                |
| `npm run lint`                  | ESLint (läuft fehler- und warnungsfrei durch)                   |

---

## Bereiche

| Route     | Bereich             | Zugang                                          |
| --------- | ------------------- | ----------------------------------------------- |
| `/`       | Öffentliche Website | frei                                            |
| `/demo`   | Produktdemo         | frei, ohne Anmeldung, gekennzeichnete Demo-Daten |
| `/login`  | Demo-Anmeldung      | jede Eingabe wird akzeptiert                     |
| `/portal` | Kundenportal        | Rolle „Kunde“                                    |
| `/intern` | Mitarbeiterportal   | Rolle „Mitarbeiter“                              |

**Produktdemo** (8 Bereiche): Übersicht, Analyse, Social Media, Dokumente,
90-Tage-Plan, Aufgaben, Chat, Bericht. Läuft vollständig ohne Backend.

**Kundenportal** (11 Bereiche): Übersicht, Analyse, Umsatzbremsen,
90-Tage-Plan, Aufgaben, Social Media, Wettbewerb, Dokumente, Berichte, Termine,
Nachrichten. Sichtbar sind ausschließlich freigegebene Inhalte des eigenen
Projekts.

**Mitarbeiterportal** (13 Bereiche): Übersicht, Kunden, Analysen, Freigaben,
Aufgaben, Dokumente, Social Media, Berichte, Termine, Posteingang, Team,
Aktivitäten, Einstellungen. Dazu die Kundenakte mit zwölf Registern, der
Analyse-Editor, das Freigabezentrum, interne Notizen und der Prüfpfad.

### Anmeldung

Die Anmeldung ist bewusst ohne Authentifizierung: jede Adresse und jedes
Kennwort werden akzeptiert, geprüft wird nichts. Die Sitzung lebt **nur im
React-State** – ein Neuladen der Seite meldet ab. Persistiert wird
ausschließlich die Auswahl zwischen hellem und dunklem Modus.

---

## Trennung von Kunden- und Mitarbeitersicht

Zwei Regeln sind in den Komponenten verankert und werden im Oberflächentest
geprüft:

1. **Interne Notizen erscheinen nie im Kundenportal** – weder in der Analyse
   noch in Berichten oder Exporten. Der Analyse-Editor kennzeichnet das Feld
   entsprechend.
2. **Mandantentrennung** – Kundenportal, globale Suche und
   Benachrichtigungszentrum sind auf den eigenen Mandanten begrenzt; fremde
   Projekte sind dort nicht erreichbar.

Bewertungen durchlaufen fünf Freigabestufen: *automatisch vorgeschlagen → in
Prüfung → bearbeitet → intern freigegeben → für Kunden freigegeben*. Kein
Ergebnis und keine KI-Antwort wird automatisch veröffentlicht oder versendet;
KI-Antwortvorschläge landen ausschließlich im Eingabefeld der Mitarbeitenden.

---

## Anthropic-API konfigurieren (optional)

Der API-Key steht **ausschließlich in der Umgebung** und wird nie an den
Browser ausgeliefert. Alle Modellaufrufe laufen serverseitig über `/api/*`.

```bash
cp .env.example .env      # nur als Referenz – Werte als echte Env-Variablen setzen
export ANTHROPIC_API_KEY=…
npm run build && npm run preview
```

| Variable               | Standard                    | Bedeutung                           |
| ---------------------- | --------------------------- | ----------------------------------- |
| `ANTHROPIC_API_KEY`    | –                           | aktiviert die KI-Auswertung         |
| `ANTHROPIC_AUTH_TOKEN` | –                           | Alternative: OAuth-Token            |
| `ANTHROPIC_MODEL`      | `claude-sonnet-4-6`         | Modell laut Briefing                |
| `ANTHROPIC_BASE_URL`   | `https://api.anthropic.com` | abweichender Endpunkt (z. B. Proxy) |
| `PORT`                 | `4173`                      | Port des Produktions-Servers        |

Feste Vorgaben je Modellaufruf: `model: claude-sonnet-4-6`, `max_tokens: 1000`,
vollständige Conversation-History bei jedem Chat-Request.

**Ohne Key läuft die Demo vollständig weiter.** Der Server antwortet dann mit
einem lokalen, eingabeabhängigen Demo-Modell; ist auch der Server nicht
erreichbar (statisches Hosting), greift dasselbe Modell im Browser. Die
Herkunft der Antwort wird in der Oberfläche ausgewiesen.

`src/lib/analysis.js` wird bewusst von Server **und** Client importiert –
dieselbe Logik erzeugt die Ergebnisse, egal wo der Fallback greift.

---

## Demo-Daten und Connectoren

Alle Projektdaten werden aus wenigen Kennwerten je Beispielkunde erzeugt
(`src/data/workspace.js`) und sind an jeder Stelle als Demo-Daten
gekennzeichnet. Es wird **keine Live-Integration vorgetäuscht**: Social-Kanäle
sind in den Einstellungen sichtbar als „nicht verbunden“ ausgewiesen, die
Connector-Schnittstelle ist vorbereitet, aber nicht belegt. Für Kanäle ohne
Daten werden keine Werte geschätzt.

Der Datei-Upload legt nur einen Eintrag im Sitzungszustand an – es wird nichts
übertragen und nichts gespeichert. Der CSV-Export entsteht im Browser aus dem
aktuellen Projektstand und enthält nie interne Notizen.

---

## Design-System

Alle Farben, Schatten, Radien und Bewegungsangaben liegen als CSS-Variablen in
`src/styles/tokens.css` und werden in `src/index.css` über `@theme inline` an
Tailwind gebunden – so wirkt der Themenwechsel zur Laufzeit.

Jede Semantik hat drei Rollen:

| Rolle    | Verwendung                                  |
| -------- | ------------------------------------------- |
| `…`      | Flächen- und Markenfarbe (Chips, Diagramme) |
| `…-ink`  | abgedunkelte Variante für Text (WCAG AA)    |
| `…-soft` | sehr helle Tönung für Hintergründe          |

Grund für die `-ink`-Stufe: die Signalfarben erreichen als Text auf Weiß nur
2,8–4,2:1. Als Fläche sind sie richtig, als Text nicht. Für Text auf gefüllten
Flächen existieren zusätzlich `--c-on-brand`, `--c-on-accent` und
`--c-on-solid` – Weiß ist z. B. auf `#14B8A6` nur 2,3:1 und auf dem
Dunkelmodus-Blau `#7C9BFF` nur 2,6:1.

Farbverteilung: rund 75–80 % Weiß und Neutraltöne, 10–12 % Blau (`#2F5BEA`),
4–6 % Teal (`#14B8A6`), 3–5 % Schiefer (`#172033`), Koralle (`#F0645A`)
ausschließlich für dringende Hinweise. **Information wird nie allein über Farbe
vermittelt** – jeder Status trägt zusätzlich Text und, wo nötig, ein Icon.

Typografie: Inter Variable, selbst gehostet (Latin-Subset, 48 kB), keine
Anfragen an fremde CDNs. Diagramme sind handgeschriebenes SVG ohne
Chart-Bibliothek; Größenvergleiche nutzen einen Farbton und sortierte Länge,
jede Marke ist direkt beschriftet.

---

## Barrierefreiheit

- Kontraste in hellem und dunklem Modus programmatisch geprüft, mindestens
  WCAG AA – auch auf getönten Flächen wie `surface-muted` und `…-soft`.
- Vollständige Tastaturbedienung: Sprungmarke zum Inhalt, sichtbarer Fokus,
  Fokusfalle in Dialogen und Panels, Fokusrückgabe beim Schließen.
- Globale Suche über `⌘K` / `Strg+K`, Pfeiltasten und Enter.
- Bewegung ist zurückhaltend und respektiert `prefers-reduced-motion`.
- Tabellen erscheinen auf Mobilgeräten als Kartenliste, Register als
  Auswahlfeld – kein horizontaler Scrollbereich für Inhalte.

---

## Projektstruktur

```
index.html                 Einstiegspunkt, SEO-Meta, Favicon (inline SVG)
server/
  api.mjs                  /api/analyze, /api/chat, /api/status + Fallback-Logik
  index.mjs                Statischer Server für dist/ (ohne Fremd-Abhängigkeiten)
vite.config.js             Vite + Tailwind + dieselben /api-Routen im Dev-Server
src/
  main.jsx                 Einstiegspunkt
  App.jsx                  Router und Provider-Baum
  index.css                Tokens → Tailwind, Basisstile, wiederkehrende Muster
  styles/tokens.css        Einzige Quelle für Farbe, Schatten, Motion
  components/
    brand/                 Wortmarke
    shell/                 App-Rahmen, Topbar, Navigation, Suche, Hinweise
    ui/                    Primitive, Layout, Formulare, Overlays, Tabellen, Icons
    viz/                   Diagramme (SVG, keine Chart-Bibliothek)
    modules/               Analyse, Social, Plan, Aufgaben, Dokumente, Berichte,
                           Termine, Chat, Wettbewerb, interne Notizen, Cockpit
  data/                    Katalog der Analysedimensionen, Erzeugung der Demo-Daten
  state/                   Sitzungs- und Arbeitsbereichs-Kontext (ohne Persistenz)
  pages/                   marketing/, demo/, customer/, staff/, Login, 404
  lib/                     Formatierung, Farbtöne, API-Zugriff, Analyse-Logik
  content/marketing.js     Sämtliche Website-Texte an einer Stelle
```

---

## Geprüft

- `npm run build` und `npm run lint` laufen ohne Fehler und ohne Warnungen durch.
- Oberflächentest über alle Bereiche: Website, Demo, Kundenportal,
  Mitarbeiterportal, 404 – Browser-Konsole frei von Fehlern, keine
  fehlgeschlagenen Requests.
- Kein horizontales Overflow bei 320, 375, 768, 1024 und 1440 px; mobile
  Bottom-Navigation und Drawer durchgespielt.
- Kontrastprüfung aller Textknoten in hellem **und** dunklem Modus über alle
  Bereiche: keine Unterschreitung von WCAG AA.
- Rollen- und Mandantentrennung im Test verifiziert: keine internen Inhalte und
  keine fremden Projekte im Kundenportal.
- Durchgespielt: Anmeldung beider Rollen, Zugriffsschutz ohne Sitzung,
  Analyse-Editor mit Freigabe, Freigabezentrum inkl. Bestätigung, Aufgaben-
  Statuswechsel, CSV-Export, Chat mit vollständiger History, KI-Antwortvorschlag
  (landet im Entwurf, wird nicht gesendet), globale Suche, Abmelden.
