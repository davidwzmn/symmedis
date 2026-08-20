# SYMMEDIS Production Launch Runbook

Dieses Runbook ist die operative Quelle fuer die externen Launch-Gates von SYMMEDIS. Ein gruener Build oder ein synthetischer E2E-Lauf ersetzt keinen realen Produktionsnachweis.

## Grundsatz

Die technischen Release-Gates und die externen Produktionsnachweise bleiben getrennt:

- CI Quality, Live Staging, Cross-Role E2E und Operations Health muessen fuer den aktuellen PR-Head gruen sein.
- Leaked Password Protection ist als vom Projekt-Owner bestaetigt dokumentiert.
- Custom SMTP, reale Invite-Zustellung, realer E-Mail-/Magic-Link-Login und Restore-Drill werden erst nach echter Evidenz als verifiziert gewertet.
- `@example.invalid`-Identitaeten und das Staging-E2E-Fixture duerfen niemals reale Launch-Evidenz erzeugen.
- Der PR bleibt Draft und ungemerged, solange ein erforderliches externes Gate offen ist.

## 1. Custom SMTP / Absenderdomain

### Ziel

Supabase Auth sendet Produktions-E-Mails ueber einen kontrollierten SMTP-Provider und eine freigegebene Absenderidentitaet statt ueber den Default-Mailpfad.

### Vorbedingungen

- SMTP-Provider und Absenderdomain sind festgelegt.
- SPF/DKIM und, falls verwendet, DMARC sind beim Provider bzw. DNS korrekt eingerichtet.
- Keine SMTP-Credentials werden im GitHub-Repository, Browser-Code oder in Screenshots abgelegt.
- Supabase Auth Site URL und erlaubte Redirect-URLs zeigen auf die produktive SYMMEDIS-URL.
- Link-Tracking beim SMTP-/Mailprovider ist fuer Auth-Mails deaktiviert, damit Supabase-Einmal-Links nicht umgeschrieben werden.

### Durchfuehrung

1. SMTP-Konfiguration im Supabase-Dashboard hinterlegen.
2. Absendername und Absenderadresse auf die freigegebene SYMMEDIS-Identitaet setzen.
3. Konfiguration speichern.
4. In SYMMEDIS unter **Einstellungen -> Reale Launch-Nachweise** als Admin den Gate-Eintrag `Custom SMTP / Absenderdomain` nur dann auf verifiziert setzen, wenn die Konfiguration real gespeichert und kontrolliert wurde.
5. In der Nachweisnotiz Provider, Absenderdomain und Pruefdatum dokumentieren, jedoch keine Secrets.

### Akzeptanzkriterium

`custom_smtp = verified` mit konkreter, geheimnisfreier Evidence Note.

## 2. Reale Invite-Zustellung und realer E-Mail-Login

Diese beiden Gates werden bewusst **nicht manuell** gesetzt. SYMMEDIS verifiziert sie serverseitig.

### Vorbedingungen

- `custom_smtp` ist verifiziert.
- Eine kontrollierte reale Test-Mailbox ist verfuegbar. Keine `example.invalid`-Adresse verwenden.
- Ein reales oder dediziertes Pilot-Kundenprojekt existiert.
- Der Empfaenger soll dem richtigen Kunden-Tenant zugeordnet werden.

### Durchfuehrung

1. Im Staff-Workspace beim Zielkunden **Portal-Zugang einladen** ausfuehren.
2. Pruefen, dass die Einladung in der kontrollierten realen Mailbox ankommt.
3. Ausschliesslich den Link aus dieser real zugestellten Nachricht verwenden.
4. Den Link in einem frischen Browser-/Privatfenster oeffnen.
5. Erfolgreich in den Kundenbereich wechseln und pruefen, dass ausschliesslich der zugeordnete Tenant sichtbar ist.
6. Nach erfolgreicher Customer-Session ruft SYMMEDIS automatisch die JWT-geschuetzte Edge Function `auth-email-evidence` auf.

### Enterprise-Mail-Security-Test

Unternehmens-Mailgateways koennen Links automatisiert per `GET` pruefen. Da Supabase Auth-Links einmalig sind, kann ein solcher Scanner einen Invite-/Magic-Link bereits vor dem Nutzer verbrauchen.

Darum vor dem produktiven Rollout mindestens einmal mit einer realistischen Unternehmens-Mailbox pruefen:

1. Invite an eine Mailbox mit aktiviertem Unternehmens-Spam-/Safe-Link-Schutz senden, sofern fuer den Pilotkunden relevant.
2. Erst nach Zustellung manuell oeffnen und pruefen, ob der Link weiterhin erfolgreich eine Session erzeugt.
3. Falls der Link vor dem Nutzer verbraucht wird, den Launch fuer diese Mailumgebung blockieren und den Auth-Mailpfad auf eine scanner-resistente Variante umstellen, z. B. OTP oder einen eigenen Zwischen-Link mit menschlichem Bestaetigungsbutton.
4. Keine solche Umstellung nur vorsorglich bauen, solange der reale Test das Problem nicht zeigt.

### Automatischer Beweis

`auth-email-evidence` akzeptiert nur einen Nachweis, wenn alle Bedingungen gelten:

- Supabase hat die Session serverseitig validiert.
- Das Profil hat die Rolle `kunde`.
- Die Adresse endet nicht auf `@example.invalid`.
- Fuer genau dieses Profil existiert vorher ein `access.invited`-Audit aus dem SYMMEDIS-Invite-Flow.
- Der JWT-AMR enthaelt eine E-Mail-Authentifizierung (`otp`, `magiclink` oder `invite`).

Bei Erfolg schreibt der Server:

- `real_invite_delivery = verified`
- `real_magic_link_login = verified`
- Audit-Event `launch.email_auth_verified`

### Akzeptanzkriterium

Beide Gates stehen automatisch auf `verified`. Kein manueller Ersatznachweis ist zulassig.

## 3. Customer Golden Path direkt nach dem realen Login

Nach dem ersten echten Mail-Login einmal folgende Strecke ohne Sonderhilfe durchlaufen:

1. Kundenportal oeffnet korrekt.
2. Freigegebenes Finding ist sichtbar; interne Findings bleiben unsichtbar.
3. Kundenverantwortliche Aufgabe kann aktualisiert werden.
4. SYMMEDIS-interne Aufgabe bleibt read-only.
5. Kundendokument kann hochgeladen und authentifiziert wieder heruntergeladen werden.
6. Finaler Report und archivierte Version sind sichtbar, sobald sie Staff-seitig freigegeben wurden.
7. Logout fuehrt sicher aus dem Portal zurueck.

Jeder Fehler blockiert den Launch, bis Ursache und Re-Test dokumentiert sind.

## 4. Restore-Drill

### Kosten- und Betriebsgrenze

Keinen echten Restore, PITR-Vorgang, Projekt-Clone oder andere kosten-/betriebsrelevante Recovery-Aktion starten, bevor der Projekt-Owner dies explizit freigegeben hat.

### Nach Freigabe

1. `docs/RECOVERY_RUNBOOK.md` als Ablauf verwenden.
2. Wiederherstellung in einer geeigneten isolierten Zielumgebung durchfuehren.
3. `scripts/recovery-integrity.sql` ausfuehren.
4. Fachliche Kernpfade stichprobenartig pruefen: Organisation/Tenant, Projekte, Findings, Tasks, Reports, Audit.
5. Storage separat pruefen; Datenbank-Backups allein beweisen keine Wiederherstellung von Storage-Objekten.
6. RTO/RPO, Start/Ende, Ergebnis und Abweichungen dokumentieren.
7. Erst danach `restore_drill = verified` setzen.

## 5. Finaler Release-Entscheid

Vor dem Wechsel des PR aus Draft muessen mindestens gelten:

- aktueller Head: `symmedis/ci-quality = success`
- aktueller Head: `symmedis/live-staging = success`
- aktueller Head: `symmedis/cross-role-e2e = success`
- aktueller Head: `symmedis/operations-health = success`
- `leaked_password_protection` bestaetigt oder verifiziert
- `custom_smtp = verified`
- `real_invite_delivery = verified`
- `real_magic_link_login = verified`
- `restore_drill = verified`, sofern der Restore-Drill als zwingendes Merge-Gate beibehalten wird
- Security Advisor ohne neue relevante Findings

Bezahlte KI ist **kein** Voraussetzungsgate fuer den produktiven Kern. Sie bleibt deaktiviert, bis eine separate Kosten- und Produktfreigabe erfolgt.

## 6. Pilotstart danach

Nach Abschluss der externen Launch-Gates werden keine neuen generischen Features vorgezogen. Der naechste Produktbeweis sind 3-5 reale Pilotprojekte. Pro Projekt muss das vorhandene Pilot-Start-Gate vor Beginn gruen sein und P4-Evidenz ausschliesslich aus realen Produktdaten und dokumentierten Kundengespraechen entstehen.
