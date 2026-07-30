# Marketing-Assets

Ablageort für die freigegebenen Bilddateien der öffentlichen Website. Die
Komponenten laden ein Bild nur, wenn die entsprechende Datei hier vorhanden ist
und in der jeweiligen Content-Datei referenziert wird – fehlt sie, greift eine
gestaltete Fallback-Darstellung (Initialen bzw. Platzhalter). So bleibt die
Seite ohne Bilder fehlerfrei und wertet sich auf, sobald die Dateien vorliegen.

## Erwartete, freigegebene Dateien

| Interner Name | Verwendung | Referenz |
|---|---|---|
| `david-constantin-waizmann.png` | Team-Porträt David | `TEAM.personen[…].bild` in `src/content/marketing.js` |
| `alfred-michael-waizmann.png` | Team-Porträt Alfred | `TEAM.personen[…].bild` in `src/content/marketing.js` |
| `symmedis-healthtech-network.png` | dunkler Section-Trenner / Trust-Visual | Startseite |
| `symmedis-diagnosis-dashboard.png` | Plattform-/Diagnosis-OS-Bereich (symbolisch) | Plattformseite |
| `symmedis-diagnosis-process.png` | Funktionsweise / 90-Tage-Plan | Funktionsweise |

## Ausdrücklich NICHT verwenden

Das gemeinsame Porträt `ChatGPT Image 30. Juli 2026, 18_50_41 (3).png` darf
nicht importiert, kopiert oder dargestellt werden.

## Einbau, sobald eine Datei vorliegt

1. Datei unter dem internen Namen in diesem Ordner ablegen.
2. In `src/content/marketing.js` das Bild importieren und dem passenden Feld
   zuweisen, z. B.:

   ```js
   import davidPortrait from '../assets/marketing/david-constantin-waizmann.png'
   // …
   bild: davidPortrait,
   ```

3. Bilder sind bereits responsive eingebunden (feste Seitenverhältnisse,
   `loading="lazy"` unterhalb des Folds, sinnvolle `object-position`).
