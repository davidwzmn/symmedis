# SYMMEDIS Supabase

Dieses Verzeichnis dokumentiert das produktive Backend der SYMMEDIS-Plattform.

## Projekt

- Supabase Project Ref: `jmxxinrvszwggcxvlwfs`
- Region: `eu-west-1`
- Der historische sichtbare Projektname `rovalis` sollte im Supabase Dashboard auf `symmedis` umbenannt werden. Der Project Ref bleibt unverändert.

## Architektur

Das Frontend verwendet ausschließlich:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Ein `service_role`/Secret Key darf niemals in Vite-, GitHub-Pages- oder Browser-Variablen landen.

Die Autorisierung erfolgt zusätzlich zu Supabase Auth über Row Level Security. Kundenprofile sind fest einem `client_id`/Tenant zugeordnet. Interne Notizen sind ausschließlich für `intern`/`admin` sichtbar. Analyse-Ergebnisse werden erst nach menschlicher Freigabe für Kunden sichtbar.

## Aktive Edge Functions

### `analyze-project`

- JWT-Pflicht
- nur Rollen `intern` und `admin`
- erzeugt einen versionierten `analysis_run`
- liest autorisierte Projektquellen
- erzeugt exakt zehn strukturierte Findings
- speichert Confidence und echte Quellenreferenzen
- setzt neue Findings immer auf `vorgeschlagen` und `customer_visible=false`
- erstellt drei priorisierte Ursachenhebel
- veröffentlicht niemals automatisch an Kunden

Benötigte Function Secrets:

- `ANTHROPIC_API_KEY` (erforderlich)
- `ANTHROPIC_MODEL` (optional)
- `ANTHROPIC_BASE_URL` (optional)

### `invite-user`

- JWT-Pflicht
- nur Rollen `intern` und `admin`
- lädt Kundenbenutzer serverseitig über Supabase Admin Auth ein
- der Service-Role-Key bleibt ausschließlich in der Edge Function
- legt/aktualisiert das öffentliche Profil mit `organization_id` und `client_id`

Optionales Function Secret:

- `SYMMEDIS_APP_URL` – kanonische Basis-URL für Auth-Redirects. Vor dem öffentlichen Launch auf die endgültige App-Domain setzen.

## Bootstrap des ersten internen Accounts

Der allererste interne Nutzer muss einmal kontrolliert in Supabase Auth angelegt und anschließend in `public.profiles` der bereits vorhandenen Organisation `SYMMEDIS` zugeordnet werden.

Empfohlene Profilwerte:

- `role = 'admin'`
- `organization_id = ID der Organisation mit slug 'symmedis'`
- `client_id = NULL`

Danach können Kunden-Tenants und Kunden-Zugänge vollständig aus der SYMMEDIS-Oberfläche angelegt werden.

## Auth URL-Konfiguration

Vor echtem Kundenbetrieb in Supabase Auth konfigurieren:

- Site URL = endgültige SYMMEDIS-App-URL
- erlaubte Redirect URLs = Produktionsdomain plus gewünschte Preview-/Development-URLs

GitHub Pages verwendet aktuell einen Hash Router. `src/lib/supabase.js` normalisiert Supabase-Auth-Fragmente vor dem React-Router. Für den kommerziellen Launch ist eine eigene Domain mit normalem BrowserRouter vorzuziehen.

## Storage

Privater Bucket: `project-files`

Pfadkonvention:

`<client_uuid>/<project_uuid>/<timestamp>-<dateiname>`

Maximale Dateigröße: 50 MB. Der Bucket ist nicht öffentlich; der Zugriff wird per Storage-RLS und Tenant-Zuordnung begrenzt.

## Datenmodell

Kernobjekte:

- `organizations`
- `profiles`
- `clients`
- `projects`
- `analysis_runs`
- `analysis_items`
- `growth_blockers`
- `tasks`
- `documents`
- `appointments`
- `reports`
- `activities`
- `messages`
- `internal_notes`
- `social_profiles`
- `social_insights`
- `competitor_snapshots`

## Qualität

Nach DDL-Änderungen immer ausführen:

1. Supabase Security Advisor
2. Supabase Performance Advisor
3. GitHub CI (`npm run lint`, normaler Build und Hash-Build)

Aktuell meldet der Security Advisor keine Findings. Performance-Hinweise betreffen ausschließlich noch ungenutzte Indizes in der leeren/frischen Datenbank; diese Indizes sind für die vorgesehenen FK-/Tenant-/Projektabfragen angelegt und sollten erst nach realem Query-Traffic neu bewertet werden.
