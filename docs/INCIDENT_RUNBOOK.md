# SYMMEDIS Incident Runbook

## Zweck

Dieses Runbook definiert die erste Reaktion auf produktionsnahe Störungen. Es ergänzt `docs/RECOVERY_RUNBOOK.md`: **Incident** stabilisiert und grenzt ein; **Recovery** stellt Daten/Service kontrolliert wieder her.

## Betriebsprinzipien

1. Kundendaten und Mandantentrennung haben Vorrang vor Verfügbarkeit.
2. Keine Release-Gates abschalten, um einen Incident zu kaschieren.
3. Keine bezahlte KI, Restore-Clone oder externe Observability-Kosten ohne explizite Freigabe aktivieren.
4. Keine Rohfehler, E-Mails, Projekt-/Kunden-IDs oder fachliche Freitexte in öffentliche Logs/Issues kopieren.
5. Bei Verdacht auf Tenant-Leak oder Auth-Bypass: Schreibpfade stoppen bzw. Release zurückhalten, bevor weiter diagnostiziert wird.

## Schweregrade

### SEV-1 — Trust / Security

Beispiele:
- Customer kann fremde oder interne Staff-Daten sehen.
- Auth-Bypass, falsche Rollenauflösung oder unerlaubter Schreibzugriff.
- Finalisierte Reports veränderbar.
- Datenverlust oder beschädigte produktive Daten.

Reaktion:
- Release sofort blockieren.
- Betroffenen Pfad nicht durch Workarounds umgehen.
- RLS/Auth/Storage-Policies und Audit-Trail prüfen.
- Falls Datenintegrität betroffen: `docs/RECOVERY_RUNBOOK.md` verwenden.
- Erst nach reproduzierbarem Negativtest plus positivem Cross-Role-E2E wieder freigeben.

### SEV-2 — Kernreise gestört

Beispiele:
- Login/Portal nicht erreichbar.
- Save-/Upload-/Download-Kernpfad schlägt reproduzierbar fehl.
- Staff→Customer-Handover oder Outcome-Loop rot.
- Lead-Ingress nicht erreichbar.

Reaktion:
- `symmedis/ci-quality`, `symmedis/live-staging` und `symmedis/cross-role-e2e` am exakten Head prüfen.
- Operations-Watch-Artefakt und betroffenen Actions-Run öffnen.
- Supabase Function/Auth/API-Logs im Incident-Zeitfenster prüfen.
- Kleinsten reproduzierbaren Pfad isolieren; keine Gates schwächen.

### SEV-3 — Degradation

Beispiele:
- Performance-Budget gerissen.
- Web Vital verschlechtert.
- erhöhte einzelne Fehler ohne Ausfall des Golden Path.

Reaktion:
- Trend gegen 30-Tage-Baseline prüfen.
- Regression auf Build-SHA und Route-Familie eingrenzen.
- Fix priorisieren, aber keine unnötige Feature-Arbeit beginnen.

## Automatische Operations-Schwellen

Der Workflow `.github/workflows/operations-watch.yml` wertet aus:

- 30-Tage-Erfolgsrate von `ci.yml`
- 30-Tage-Erfolgsrate von `cross-role-e2e.yml`
- Frische des letzten abgeschlossenen CI-/E2E-Laufs
- Live-Staging HTTP + Build-Marker
- öffentlichen Lead-Ingress über Honeypot-Smoke
- JWT-Schutz der `operational-telemetry` Function

Standardgrenzen:

- mindestens **95 %** Erfolg, sobald mindestens **5** abgeschlossene Läufe im 30-Tage-Fenster existieren
- letzter abgeschlossener CI-/E2E-Nachweis höchstens **48 Stunden** alt
- Live-Staging und Lead-Ingress müssen erfolgreich antworten
- `operational-telemetry` muss ohne JWT mit **401** ablehnen

Jeder Lauf speichert `operations-health.json` und `operations-health.md` für 90 Tage als Actions-Artefakt. Ein Grenzbruch lässt den Job fehlschlagen und nutzt damit GitHubs bestehende Actions-Benachrichtigung statt eines zusätzlichen kostenpflichtigen Alerting-Dienstes.

> GitHub-Schedules laufen nur vom Default-Branch. Auf dem aktiven PR-Branch wird derselbe Evaluator in CI validiert; der 6-Stunden-Zeitplan wird nach Merge auf den Default-Branch wirksam.

## Triage in 10 Minuten

1. Exakten betroffenen Build-SHA feststellen.
2. Prüfen, welches Gate zuerst rot wurde: Quality, Live-Staging oder Cross-Role.
3. Bei Browser-/Produktfehlern: Route + Rolle + Aktion notieren, keine Kundendaten kopieren.
4. Bei Backendfehlern: Supabase-Logs nach Zeitfenster, Function und HTTP-Status filtern.
5. Bei Save/File-Fehlern: Trace-ID aus Operational Telemetry mit API-/Function-Zeitfenster korrelieren.
6. Bei Security-Verdacht: Security Advisor + relevante RLS/Grants prüfen.
7. Reproduktion auf kanonischem E2E-Fixture statt auf Kundendaten.

## Freigabe nach Incident

Ein Incident gilt erst als technisch behoben, wenn:

- die eigentliche Ursache dokumentiert ist,
- der Fix durch einen Guard/Test gegen Regression geschützt ist,
- CI/Quality grün ist,
- exaktes Live-Staging grün ist,
- Cross-Role-E2E grün ist,
- bei Daten-/Security-Themen zusätzlich Security Advisor und der betroffene direkte Policy-Test grün sind.

## Externe Launch-Gates bleiben separat

Dieses Runbook ersetzt nicht:

- realen Invite/Magic-Link-Test mit kontrollierter Mailbox,
- finale SMTP-/Sender-/Domain-Konfiguration,
- Supabase Leaked Password Protection,
- tatsächlichen Backup-/Restore-Drill,
- explizite Kostenfreigabe für bezahlte KI oder weitere kostenpflichtige Infrastruktur.
