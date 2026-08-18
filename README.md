# SYMMEDIS Diagnosis OS

SYMMEDIS ist eine Plattform für strategische Ursachenanalyse, Evidenz, Priorisierung und Umsetzung. Die Anwendung verbindet öffentliche Website, geführte Produktdemo, geschütztes Kundenportal und Mitarbeiterportal in einer gemeinsamen React-/Vite-Codebasis mit Supabase als produktivem Auth-, Datenbank-, Storage- und Edge-Function-Backend.

> **Produktdemo und echte Portale sind strikt getrennt.** `/demo` arbeitet ausschließlich mit fiktiven lokalen Daten. `/portal` und `/intern` nutzen echte Supabase-Authentifizierung, mandantengetrennte Daten und serverseitig erzwungene Zugriffsregeln.

## Produktbereiche

| Route | Bereich | Zugang |
| --- | --- | --- |
| `/` | Öffentliche Website | frei |
| `/demo` | Geführte Produktdemo | frei, fiktive Daten, keine Backend-Writes |
| `/login` | Geschützter Zugang | Supabase Auth, Kennwort oder Magic Link |
| `/portal` | Kundenportal | Rolle `kunde`, eigener Mandant/Projektzugang |
| `/intern` | Mitarbeiterportal | Rolle `intern` oder `admin`, organisationsbezogener Zugriff |

### Kundenportal

Das Kundenportal zeigt ausschließlich Inhalte, die für den jeweiligen Mandanten und das Projekt freigegeben sind. Dazu gehören unter anderem Analyseergebnisse, Umsatzbremsen, 90-Tage-Plan, Aufgaben, Dokumente, Berichte, Termine und Nachrichten.

Interne Notizen und nicht freigegebene Findings werden weder über die Oberfläche noch über die Datenbank-RLS an Kunden ausgeliefert.

### Mitarbeiterportal

Das Mitarbeiterportal bündelt Kunden- und Projektsteuerung, Analyse-Editor, Freigabezentrum, Aufgaben, Dokumente, Reports, Teamfunktionen, interne Notizen, Audit-/Aktivitätsinformationen und die projektweite Evidenzsuche.

Kritische Mutationen werden nicht als erfolgreich dargestellt, bevor die Persistenz bestätigt ist. Wo die Oberfläche optimistisch aktualisiert, wird bei Backendfehlern auf den zuletzt bestätigten Stand zurückgerollt.

## Sicherheits- und Vertrauensmodell

SYMMEDIS nutzt mehrere Schutzebenen:

- Supabase Auth mit rollenbasiertem Profilmodell
- Row Level Security auf den fachlichen Tabellen
- private Storage-RLS für Projektdateien
- getrennte Kunden-/Mitarbeiter-Sichten
- serverseitige Kanonisierung sensibler Felder
- Human-in-the-loop-Freigabe für Analyseergebnisse
- append-only Audit-Infrastruktur für relevante Vorgänge
- Publishable Key im Browser; kein `service_role`-Secret im Frontend

Die Plattform behandelt Kundenfreigabe als expliziten Prozess. Analyseergebnisse, KI-generierte Vorschläge oder interne Notizen werden nicht automatisch kundensichtbar.

## Authentifizierung

Der Login verwendet Supabase Auth. Unterstützt werden Kennwort-Login und einmalige Magic Links. Nach erfolgreicher Authentifizierung wird das zugehörige Profil geladen und der Nutzer ausschließlich in das freigegebene Portal geleitet.

Die produktive Staging-URL ist in Supabase Auth als Site-/Redirect-Ziel hinterlegt. Magic-Link-Redirects werden am App-Root verarbeitet, bevor der Hash-Router übernimmt.

## Dokumente und Evidenzsuche

Projektdateien werden in einem privaten Supabase-Storage-Bucket gespeichert. Unterstützt werden PDF, DOCX, XLSX, PPTX, CSV, TXT, PNG und JPG.

- Allgemeines Upload-Limit im Frontend: 50 MB pro Datei
- DOCX/XLSX/PPTX: maximal 25 MB für die lokale Office-Extraktion
- CSV/TXT: lokale textbasierte Indexierung
- Office-Dateien: lokale, kostenfreie Extraktion für die Evidenzsuche
- PDFs: kontrollierter interner Extraktionspfad; bezahlte KI ist derzeit nicht aktiviert
- Bilder: sichere Ablage, keine automatische Inhaltsinterpretation

Die projektweite Evidenzsuche kombiniert freigegebene Findings und indexierte Knowledge-Chunks und respektiert dieselben Projekt-/Tenant-Grenzen wie der restliche Workspace.

## Analyse und Human-in-the-loop

Der echte Analysepfad verwendet die geschützte Supabase Edge Function `analyze-project`. Die lokale Demo-Analyse ist auf `/demo` beschränkt und wird im Produkt nicht stillschweigend als echte Analyse verwendet.

Analysefelder werden lokal bearbeitet und gezielt gespeichert. Freigaben warten auf bestätigte Persistenz. Unbekannte Kategorie-, Prioritäts- oder Statuswerte werden defensiv dargestellt, damit Schema-Drift nicht zu UI-Crashes führt.

## 90-Tage-Plan und Aufgaben

Der 90-Tage-Plan kann aus priorisierten Analyseempfehlungen erzeugt bzw. synchronisiert werden. Die zugehörige Backend-Logik aktualisiert bestehende Maßnahmen idempotent statt bei wiederholtem Ausführen Duplikate anzulegen.

Aufgabenstatus wird optimistisch aktualisiert und bei Persistenzfehlern zurückgerollt. Kunden können nur die für sie vorgesehenen Statusänderungen durchführen; zusätzliche Felder werden serverseitig geschützt.

## Reports

Reports unterscheiden klar zwischen Entwurf und final freigegebenem Bericht. Kunden sehen ausschließlich finale Berichte. Die Finalisierung erzeugt unveränderliche Versions-/Auditinformationen im Backend.

Management-Auswertungen enthalten nur dafür vorgesehene Inhalte; interne Notizen werden nicht in Kundenexporte aufgenommen.

## Demo

`/demo` ist eine eigenständige geführte Produktdemo mit fiktivem Beispielunternehmen. Sie schreibt nicht in Supabase und verwendet keine echten Kundendaten. Demo-Assistent und lokale Fallback-Logik sind ausdrücklich als Demo gekennzeichnet.

Die Demo soll Interessenten den Produktfluss zeigen, ohne einen gemeinsamen Echt-Account, Registrierungszwang oder echte Backend-Daten zu benötigen.

## Setup

```bash
npm install
npm run dev
```

Produktionsbuild:

```bash
npm run build
npm run preview
```

Wichtige Befehle:

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Vite-Entwicklung |
| `npm run build` | Produktionsbuild |
| `npm run preview` / `npm start` | lokaler Produktionsserver |
| `npm run lint` | ESLint |

## GitHub Pages / Staging

Für GitHub Pages wird zusätzlich ein Hash-Router-Build erzeugt. Die CI prüft:

1. Dependency-Installation
2. Lint
3. normalen Vite-Build
4. statischen Hash-Build
5. bei freigegebenen Branches die Staging-Ausspielung auf `gh-pages`

Staging: `https://davidwzmn.github.io/symmedis/`

Der aktuelle Entwicklungs-PR bleibt bewusst Draft, bis echte Staff-/Customer-End-to-End-Tests vollständig abgeschlossen sind. Es erfolgt kein automatischer Merge in den Basisbranch.

## Supabase

Produktives Projekt: SYMMEDIS, Region EU.

Die Datenbank enthält unter anderem:

- Organisationen und Profile
- Kunden und Projekte
- Analyse-Runs und Findings
- Wachstumsbremsen und Aufgaben
- Dokumente und Knowledge-Chunks
- Termine, Nachrichten und interne Notizen
- Reports und unveränderliche Report-Versionen
- Audit Events
- Website Leads
- Integrations-/Sync-Grundstruktur

Schemaänderungen werden als Migrationen unter `supabase/migrations/` versioniert. Nach sicherheitsrelevanten DDL-Änderungen werden Supabase Security- und Performance-Advisors erneut geprüft.

## Edge Functions

Aktiv sind derzeit:

- `analyze-project`
- `invite-user`
- `index-document`
- `submit-lead`
- `manage-leads`
- `invite-staff`

Authentifizierte Funktionen validieren JWT und Profil/Rolle serverseitig. `submit-lead` ist absichtlich öffentlich, verwendet dafür eigene Validierung, Rate-Limits und Bot-/Honeypot-Schutz.

## KI / Anthropic

Die produktive KI-Analyse ist derzeit bewusst deaktiviert. Es werden keine bezahlten Modellaufrufe vorausgesetzt, um den Workspace, Office-Indexierung, Dokumentverwaltung oder die Demo zu verwenden.

Eine Aktivierung erfolgt erst in der finalen Produktionsphase nach expliziter Kostenfreigabe und kontrolliertem End-to-End-Test. API-Secrets gehören ausschließlich in Server-/Supabase-Secrets und niemals in den Browser oder das Repository.

## Design und Barrierefreiheit

Das Designsystem basiert auf CSS-Tokens und Tailwind CSS. Statusinformation wird nie ausschließlich über Farbe vermittelt.

Barrierefreiheitsgrundlagen:

- sichtbare Fokuszustände
- Skip-Link zum Hauptinhalt
- vollständige Tastaturbedienung für Dialoge und Drawer
- Fokusfalle und Fokus-Rückgabe
- `aria-live` für relevante Lade-/Speicherzustände
- Mobile-Karten statt unkontrolliertem Tabellen-Overflow
- `prefers-reduced-motion`
- Safe-Area-Unterstützung auf mobilen Geräten
- WCAG-orientierte Kontraste

## Fehler- und Offline-Verhalten

Ein fataler Workspace-Ladefehler erhält einen eigenen Retry-Zustand. Einzelne fehlgeschlagene Saves bleiben dagegen nicht-fatal: Der Nutzer bleibt im Arbeitskontext, erhält eine klare Meldung und die UI fällt auf den zuletzt bestätigten Datenstand zurück.

Bei fehlender Internetverbindung bleiben bereits geladene Inhalte sichtbar; die Oberfläche weist darauf hin, dass Änderungen und Uploads erst nach Wiederherstellung der Verbindung sicher gespeichert werden können.

## Repository-Struktur

```text
src/
  components/
    modules/       Fachmodule
    shell/         Navigation, Topbar, globale UI
    ui/            Primitives, Formulare, Overlays, Tabellen
    viz/           Visualisierungen
  data/            Kataloge und Demo-Daten
  lib/             Supabase/API-/Formatierungslogik
  pages/           Marketing, Demo, Customer, Staff, Login
  state/           Session- und Workspace-State
supabase/
  functions/       Edge Functions
  migrations/      versionierte Datenbankmigrationen
.github/workflows/  CI und Staging-Publishing
```

## Production-Readiness

Vor einem endgültigen Produktions-Switch bleiben bewusst einige kontrollierte Schritte offen:

- echter Staff-Browser-E2E
- echter Customer-Browser-E2E mit sicherer Testadresse
- Invite → Magic Link → Session → Portal → Upload/Download → Task-Update → Report-Freigabe
- finaler SMTP-/Branding-Entscheid, falls erforderlich
- KI-Aktivierung ausschließlich nach Kostenfreigabe

Bis dahin bleibt der Entwicklungs-PR Draft. Diese Grenze ist Absicht: SYMMEDIS soll nicht nur „bauen“, sondern vor einem finalen Release nachvollziehbar **funktionieren, sicher sein und belastbar getestet sein**.
