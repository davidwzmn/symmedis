# GitHub Pages – einmalige Aktivierung für SYMMEDIS Staging

Der Release-Workflow baut und prüft das Pages-Artefakt vollständig über GitHub Actions. Das Repository ist aktuell jedoch noch auf den Legacy-Publishing-Typ `gh-pages` eingestellt. GitHub lehnt deshalb `actions/deploy-pages` von `agent/supabase-auth-foundation` serverseitig ab.

## Einmalig in GitHub setzen

1. Repository **Settings** öffnen.
2. **Pages** öffnen.
3. Unter **Build and deployment → Source** **GitHub Actions** auswählen.
4. Keine `gh-pages`-Branch-Publishing-Quelle mehr verwenden.

Danach startet der vorhandene CI-Workflow beim nächsten Push automatisch:

- Quality Gate (`symmedis/ci-quality`)
- offizieller Pages-Deploy über `actions/deploy-pages`
- exakte Build-SHA-Prüfung auf `https://davidwzmn.github.io/symmedis/`
- Live-Mobile-Browser-Smoke
- Commit-Status `symmedis/live-staging`
- secretloser Staff↔Customer Cross-Role-E2E (`symmedis/cross-role-e2e`)

## Sicherheitsvertrag

- Kein Bot-Push auf `gh-pages`.
- Kein langlebiges GitHub-Passwort-Secret für E2E.
- Pages-Deploy nur aus dem expliziten Staging-Branch.
- Der ausgelieferte Build muss exakt `GITHUB_SHA` entsprechen.
- Ein fehlgeschlagener Deploy oder Live-Smoke markiert `symmedis/live-staging` als `failure` und lässt den Release nicht grün werden.

## Warum dies nicht automatisiert wird

GitHubs Pages-REST-API benötigt zum Umschalten des Publishing-Typs auf `workflow` neben `Pages: write` auch **Administration: write**. Der normale `GITHUB_TOKEN` eines Workflows besitzt diese Repository-Admin-Berechtigung bewusst nicht. Die Umschaltung bleibt deshalb eine einmalige Repository-Admin-Einstellung statt eines selbstprivilegierenden CI-Schritts.
