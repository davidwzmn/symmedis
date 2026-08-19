# SYMMEDIS Recovery Runbook

## Ziel

Dieses Runbook definiert den Wiederanlauf nach Datenverlust, Fehlmigration, versehentlicher Löschung oder beschädigtem Produktionszustand. Der Recovery-Prozess gilt erst als erfolgreich, wenn nicht nur die Datenbank erreichbar ist, sondern die fachlichen Sicherheits- und Integritätsverträge von SYMMEDIS erneut bewiesen wurden.

## Recovery-Ziele

- **RPO:** so niedrig wie der aktivierte Supabase-Backupmodus zulässt; für produktiven Betrieb PITR bewerten und bei passendem Plan aktivieren.
- **RTO:** Wiederanlauf wird nicht nur an Datenbank-Verfügbarkeit gemessen, sondern an bestandener Integritätsprüfung + Auth-/Storage-/Portal-Smoke.
- **Keine direkte Produktionsexperimentierung:** Restore-Drills bevorzugt in ein neues Projekt / isoliertes Recovery-Ziel.

## Wichtige Plattformgrenzen

Supabase-Datenbank-Backups enthalten die Postgres-Datenbank, aber nicht die eigentlichen Storage-Objekte. Ein Datenbank-Restore allein stellt daher gelöschte Dateien nicht wieder her. Edge Functions, Auth-Einstellungen, API-Keys, Realtime-Konfiguration und weitere Projekteinstellungen müssen bei einem Restore in ein neues Projekt separat geprüft bzw. wiederhergestellt werden.

## Auslöser

Recovery starten bei mindestens einem der folgenden Fälle:

1. bestätigter Datenverlust oder inkonsistente Fachrelationen,
2. fehlgeschlagene Migration mit nicht sicher vorwärts reparierbarem Zustand,
3. kompromittierte oder massenhaft falsch veränderte Datensätze,
4. versehentliche Löschung kritischer Mandanten-/Projekt-/Reportdaten,
5. Sicherheitsvorfall, bei dem ein sauberer Wiederanlauf aus bekanntem Zustand erforderlich ist.

## Phase 1 — Incident einfrieren

1. Schreibende Deployments stoppen.
2. Betroffenen Zeitraum und letzte bekannte korrekte Änderung festhalten.
3. Aktuellen Git-SHA, Supabase-Projekt-Ref und Incident-Zeitpunkt dokumentieren.
4. Keine destruktiven Reparatur-SQLs ausführen, bevor Restore-Option und Beweissicherung geklärt sind.
5. Bei sicherheitsrelevantem Incident Tokens/Sessions nach Lagebild gezielt widerrufen.

## Phase 2 — Restore-Ziel wählen

Bevorzugte Reihenfolge:

1. **Restore to a new project / Clone aus Backup oder PITR** für Drill, Analyse und sichere Validierung.
2. **PITR** bei engem RPO und bekanntem Schadenszeitpunkt.
3. **Scheduled backup restore** wenn tägliche Wiederherstellung ausreichend ist.
4. **Logischer Export/Import** nur als bewusst gewählter Recovery-Pfad.

Ein In-place-Restore der Produktion ist nur zulässig, wenn Downtime und Verlustfenster akzeptiert und dokumentiert sind.

## Phase 3 — Nach Restore zwingend rekonfigurieren/prüfen

- Edge Functions vollständig vorhanden und erwartete Versionen aktiv.
- Auth Redirect URLs, SMTP, Sender-Domain und OTP/Magic-Link-Einstellungen korrekt.
- Publishable Keys / serverseitige Secrets korrekt und nicht aus altem Snapshot übernommen.
- `SYMMEDIS_APP_URL` korrekt.
- GitHub OIDC E2E Bootstrap-Konfiguration korrekt.
- Private Storage-Buckets und Storage-RLS vorhanden.
- Storage-Objekte separat abgeglichen; DB-Metadaten dürfen nicht fälschlich als Dateiwiederherstellung interpretiert werden.
- Leaked Password Protection aktiviert.
- Security Advisor ohne offene Findings.

## Phase 4 — Datenbank-Integritätsprüfung

`scripts/recovery-integrity.sql` auf dem Recovery-Ziel ausführen. Der Check muss ohne `FAIL`-Zeilen enden.

Zusätzlich prüfen:

- alle fachlichen Tabellen in `public` haben RLS,
- keine orphaned Projects ohne Client,
- keine orphaned Tasks/Reports/Documents ohne Project,
- keine Report-Version ohne Report,
- finale Report-Versionen sind vorhanden und unveränderlich,
- Profile referenzieren nur erlaubte Organisationen/Clients,
- Audit-Events bleiben vorhanden,
- private Audit-/Triggerfunktionen besitzen keine unerwarteten Browser-EXECUTE-Rechte.

## Phase 5 — Anwendungs-Smokes

Auf dem Recovery-Ziel mindestens:

1. Staff Login.
2. Staff sieht nur autorisierte Organisation/Projekte.
3. Customer Login.
4. Customer sieht ausschließlich eigenen Tenant.
5. Staff internes Dokument bleibt für Customer unsichtbar.
6. Customer-eigene Aufgabe kann Status ändern; SYMMEDIS-Aufgabe bleibt read-only.
7. Human-Review-Finding wird erst nach Freigabe kundensichtbar.
8. Draft Report kann finalisiert werden und erzeugt immutable Version.
9. Authentifizierter Dokument-Download funktioniert.
10. Logout entfernt lokale Session und blockiert geschützten Wiedereintritt.
11. Öffentliche Website, Demo, Termin und Login funktionieren mobil.

Die vorhandene secretlose Cross-Role-E2E-Strecke ist dafür der bevorzugte Produktbeweis.

## Phase 6 — Produktionsfreigabe

Recovery gilt erst als abgeschlossen, wenn:

- Integritäts-SQL grün,
- Supabase Security Advisor grün,
- `symmedis/ci-quality` grün,
- `symmedis/cross-role-e2e` grün,
- `symmedis/live-staging` grün,
- Auth-/Mailflow geprüft,
- Storage-Abgleich dokumentiert,
- verantwortliche Person den wiederhergestellten Zeitpunkt und das maximale Verlustfenster dokumentiert hat.

## Regelmäßiger Restore-Drill

Mindestens quartalsweise oder vor einem bedeutenden Produktionslaunch:

1. Backup-/PITR-Verfügbarkeit prüfen.
2. Restore bevorzugt in ein neues isoliertes Projekt durchführen.
3. `scripts/recovery-integrity.sql` ausführen.
4. Cross-Role-E2E gegen Recovery-Ziel durchführen.
5. Storage separat prüfen.
6. tatsächliches RPO/RTO dokumentieren.
7. Recovery-Ziel nach Abschluss sicher entfernen.

## Nicht verhandelbar

Ein vorhandenes Backup ist **kein** nachgewiesener Recovery-Prozess. Weltklasse-Betrieb verlangt einen getesteten Restore mit anschließendem Sicherheits-, Integritäts- und Produktbeweis.
