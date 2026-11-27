# ♞ Schach lernen

Ein Lernspiel für Schach-Einsteiger – läuft komplett im Browser, ohne Installation.

**Starten:** `index.html` im Browser öffnen. Damit Stockfish läuft, über einen Webserver öffnen (z. B. `python3 -m http.server` im Ordner, dann http://localhost:8000).

## Engine

Computergegner, Zugbewertung, Tipps und Bewertungsbalken laufen mit **Stockfish 18** (Lite, single-threaded, WebAssembly, direkt im Browser; Dateien `stockfish.js` / `stockfish.wasm` aus dem npm-Paket `stockfish` 18.0.8, Lizenz GPLv3 – siehe `STOCKFISH-LICENSE.txt`, Quelle: https://github.com/nmrugg/stockfish.js). Zugbewertung nach Gewinnchance wie bei Lichess (‼ einziger guter Zug, ?! ungenau, ? Fehler, ?? grober Fehler) und Genauigkeit in Prozent. Startet Stockfish nicht (z. B. beim direkten Öffnen der Datei ohne Webserver), springt die eingebaute Engine (`engine.js`) ein. Hinweis: Lokal am besten über einen kleinen Webserver öffnen, z. B. `python3 -m http.server`.

Spielstufen: Anfänger (eingebaute Engine mit Fehlern), Fortgeschritten (Stockfish Skill 3), Stark (~1700), Meister (~2200), Stockfish volle Stärke.

## Funktionen

Aufbau wie eine moderne Schach-App: Navigation links (auf dem Handy unten), großes Brett mit Spielerkarten und Bewertungsbalken, rechts ein Panel mit den Reitern „Trainer“, „Züge“ und „Eule fragen“.

- **Neues Spiel**: Farbe Weiß / Schwarz / Zufall, 4 Computerstufen oder „Beide Seiten selbst“ (Analysebrett), Brettfarben Grün / Holz / Blau
- **Zugliste mit Bewertungssymbolen** (📖 Theoriezug, ★ bester Zug, ✓ gut, ?! ungenau, ? Fehler, ?? grober Fehler) und Zusammenfassung am Spielende
- **🔥 Tägliches Taktik-Training** – Tagesprogramm (Muster des Tages, Wiederholung, gemischte Rätsel ohne Motiv-Angabe, Rechen-Challenge), 26 Muster mit Erklärung und Erkennungszeichen, Statistik und Schwächen pro Muster, verteilte Wiederholung falsch gelöster Rätsel (1/3/7/14/30 Tage), Woodpecker-Zyklen, Tages-Serie und Stoppuhr
- **11016 echte Rätsel aus der Lichess-Datenbank** (CC0, https://database.lichess.org/#puzzles) – aus echten Partien, mit eindeutiger Lösung und Wertung von echten Spielern (ca. 500–2700). Ablauf wie bei Lichess: Der Gegner zieht zuerst, dann muss genau der richtige Zug gefunden werden. Filter nach Schwierigkeit und Motiv (Gabel, Fesselung, Opfer, Zwischenzug, Zugzwang …)
- **Rätsel-Training mit Wertung** – bekommt Rätsel passend zur eigenen Stärke, Elo-Wertung, Serien-Zähler
- **Eröffnungen mit Varianten** – 48 Varianten; der Gegner wählt zufällig oder du suchst eine aus. Auch der Computer spielt dadurch abwechslungsreicher
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
- `data.js` – Eröffnungen (mit Varianten), handgemachte Rätsel und Tipps
- `training.js` – Muster-Lehrplan und Trainingsprinzipien
- `puzzles-lichess.js` – Rätsel aus der Lichess-Datenbank (Lizenz CC0)
- `app.js` – Oberfläche und Trainer-Logik
- `style.css` – Design (heller und dunkler Modus)
