# ♞ Schach lernen

Ein Lernspiel für Schach-Einsteiger – läuft komplett im Browser, ohne Installation.

**Starten:** `index.html` im Browser öffnen (Doppelklick genügt).

## Funktionen

Aufbau wie eine moderne Schach-App: Navigation links (auf dem Handy unten), großes Brett mit Spielerkarten und Bewertungsbalken, rechts ein Panel mit den Reitern „Trainer“, „Züge“ und „Eule fragen“.

- **Neues Spiel**: Farbe Weiß / Schwarz / Zufall, 4 Computerstufen oder „Beide Seiten selbst“ (Analysebrett), Brettfarben Grün / Holz / Blau
- **Zugliste mit Bewertungssymbolen** (📖 Theoriezug, ★ bester Zug, ✓ gut, ?! ungenau, ? Fehler, ?? grober Fehler) und Zusammenfassung am Spielende
- **Rätsel in 3 Stufen** (Leicht / Mittel / Schwer) – auch mehrzügige Matt-in-2- und Matt-in-3-Aufgaben und Aufgaben mit Schwarz am Zug; die Engine spielt die Gegenzüge
- **Eröffnungen nach Farbe filterbar** – 9 Lektionen speziell für Schwarz

- **Spielen gegen den Computer** – 4 Stufen (Anfänger bis Meister)
  - Trainer „Eule“ bewertet jeden Zug (⭐ bester Zug, 👍 gut, 🤔 ungenau, ❗ Fehler, ❌ grober Fehler) und erklärt, *warum*
  - 💡 Tipp-Knopf: erst ein Hinweis auf die Figur, dann der Zug mit Pfeil
  - ↶ Züge zurücknehmen, Bewertungsbalken, Eröffnungs-Erkennung
  - Markierung von Figuren in Gefahr (rot) und gewinnbaren gegnerischen Figuren (grün)
- **🦉 Frag die Eule (KI-Trainer)** – stell Fragen zur Stellung, zu Zügen oder zu Schach allgemein; die KI nutzt die Engine-Daten, prüft Züge und zeichnet Pfeile aufs Brett. Funktioniert nur in der claude.ai-Version (Artifact), lokal wird das Feld ausgeblendet.
- **Genaue Zugerklärungen** – Bewertung in Bauern, erkennt Gabeln, ungedeckte Figuren, Mattdrohungen, Drohungen des Computers
- **Eröffnungen lernen** – Italienisch, Spanisch, Schottisch, Damengambit, London, Sizilianisch, Französisch, Caro-Kann und die Schäfermatt-Falle; jeder Zug wird erklärt, deine Züge spielst du selbst
- **Rätsel** – Matt-Muster, Gabel, Spieß, Umwandlung (Fortschritt wird gespeichert)
- **Tipps** – Gangarten, Sonderregeln, Eröffnungsregeln, Taktik, Mittel- und Endspiel

## Dateien

- `engine.js` – Schach-Engine (Zuggenerator, Bewertung, Alpha-Beta-Suche)
- `data.js` – Eröffnungen, Rätsel und Tipps
- `app.js` – Oberfläche und Trainer-Logik
- `style.css` – Design (heller und dunkler Modus)
