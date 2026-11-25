// Lerninhalte: Eröffnungen, Rätsel, Tipps
// Züge in englischer Kurznotation (intern), Anzeige erfolgt auf Deutsch.

const OPENINGS = [
  {
    id: 'italian', name: 'Italienische Partie', side: 'w', level: 'Einsteiger',
    intro: 'Eine der ältesten und besten Eröffnungen für Anfänger. Weiß entwickelt schnell die Figuren und zielt auf den schwachen Punkt f7.',
    moves: [
      ['e4', 'Weiß besetzt mit dem Bauern das Zentrum und öffnet Wege für Dame und Läufer.'],
      ['e5', 'Schwarz macht dasselbe und kämpft ebenfalls um das Zentrum.'],
      ['Nf3', 'Der Springer kommt ins Spiel und greift sofort den Bauern auf e5 an.'],
      ['Nc6', 'Schwarz deckt e5 und entwickelt dabei selbst eine Figur.'],
      ['Bc4', 'Der Läufer zielt auf f7 – das ist der schwächste Punkt bei Schwarz, denn er wird nur vom König gedeckt.'],
      ['Bc5', 'Schwarz antwortet symmetrisch: Der Läufer zielt nun auf f2.'],
      ['c3', 'Ein ruhiger, aber kluger Zug: Weiß bereitet d4 vor, um ein großes Bauernzentrum zu bauen.'],
      ['Nf6', 'Schwarz entwickelt die nächste Figur und greift den Bauern e4 an.'],
      ['d4', 'Weiß schlägt im Zentrum zu! Die Stellung öffnet sich und Weiß hat aktives Spiel.'],
    ],
    summary: 'Merke: Schnell entwickeln (Springer und Läufer), auf f7 zielen und mit c3 + d4 das Zentrum erobern. Danach rochieren!',
  },
  {
    id: 'ruy', name: 'Spanische Partie', side: 'w', level: 'Fortgeschritten',
    intro: 'Die Lieblingseröffnung vieler Weltmeister. Weiß übt langfristig Druck auf den Bauern e5 aus.',
    moves: [
      ['e4', 'Zentrum besetzen – der klassische erste Zug.'],
      ['e5', 'Schwarz hält im Zentrum dagegen.'],
      ['Nf3', 'Entwicklung mit Angriff auf e5.'],
      ['Nc6', 'Schwarz deckt e5.'],
      ['Bb5', 'Das ist die „Spanische“ Idee: Der Läufer greift den Springer an, der e5 verteidigt.'],
      ['a6', 'Schwarz fragt den Läufer: „Willst du tauschen oder zurückgehen?“'],
      ['Ba4', 'Weiß behält den Läufer und den Druck. Er bleibt auf der Diagonale.'],
      ['Nf6', 'Schwarz entwickelt und greift e4 an.'],
      ['O-O', 'Weiß rochiert! Der König ist sicher, der Turm kommt ins Spiel. Der Bauer e4 ist indirekt gedeckt.'],
      ['Be7', 'Schwarz entwickelt ruhig und bereitet selbst die Rochade vor.'],
    ],
    summary: 'Merke: Druck auf die Verteidiger ausüben, früh rochieren und geduldig spielen.',
  },
  {
    id: 'scotch', name: 'Schottische Partie', side: 'w', level: 'Einsteiger',
    intro: 'Weiß öffnet sofort das Zentrum. Gut für Spieler, die aktives, offenes Spiel mögen.',
    moves: [
      ['e4', 'Zentrum besetzen.'],
      ['e5', 'Schwarz antwortet symmetrisch.'],
      ['Nf3', 'Angriff auf e5.'],
      ['Nc6', 'Schwarz deckt.'],
      ['d4', 'Sofort im Zentrum zuschlagen! Weiß öffnet das Spiel.'],
      ['exd4', 'Schwarz schlägt – das ist die normale Antwort.'],
      ['Nxd4', 'Weiß schlägt zurück. Der Springer steht stark im Zentrum.'],
      ['Nf6', 'Schwarz entwickelt mit Angriff auf e4.'],
      ['Nxc6', 'Weiß tauscht ab …'],
      ['bxc6', '… und Schwarz schlägt zum Zentrum hin zurück.'],
      ['e5', 'Weiß gewinnt Raum und vertreibt den Springer f6.'],
    ],
    summary: 'Merke: Mit d4 das Zentrum öffnen. Wer zuerst entwickelt ist, profitiert von offenen Linien.',
  },
  {
    id: 'qgd', name: 'Damengambit', side: 'w', level: 'Fortgeschritten',
    intro: 'Die wichtigste Eröffnung mit 1.d4. „Gambit“ heißt: Weiß bietet einen Bauern an – aber Schwarz kann ihn nicht gut behalten.',
    moves: [
      ['d4', 'Weiß besetzt das Zentrum mit dem Damenbauern. Der Bauer ist von der Dame gedeckt.'],
      ['d5', 'Schwarz hält dagegen.'],
      ['c4', 'Das Gambit! Weiß greift d5 von der Seite an, um Schwarz aus dem Zentrum zu locken.'],
      ['e6', 'Schwarz lehnt ab und stützt d5 stabil (Abgelehntes Damengambit).'],
      ['Nc3', 'Noch mehr Druck auf d5 – und eine Figur entwickelt.'],
      ['Nf6', 'Schwarz verteidigt d5 ein weiteres Mal.'],
      ['Bg5', 'Der Läufer fesselt den Springer f6 an die Dame. Der Springer verteidigt d5 nun schlechter.'],
      ['Be7', 'Schwarz löst die Fesselung und bereitet die Rochade vor.'],
      ['e3', 'Weiß öffnet den Weg für den Läufer f1 und baut eine solide Stellung.'],
      ['O-O', 'Schwarz bringt den König in Sicherheit.'],
    ],
    summary: 'Merke: Mit c4 Druck auf d5 machen. Fesselungen (Lg5) schwächen Verteidiger.',
  },
  {
    id: 'london', name: 'Londoner System', side: 'w', level: 'Einsteiger',
    intro: 'Ein „System“: Weiß baut fast immer dieselbe Stellung auf, egal was Schwarz macht. Ideal zum Lernen, weil man wenig auswendig wissen muss.',
    moves: [
      ['d4', 'Zentrum besetzen.'],
      ['d5', 'Schwarz hält dagegen.'],
      ['Bf4', 'Typisch London: Der Läufer kommt früh raus, BEVOR e3 gespielt wird (sonst wäre er eingesperrt).'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['e3', 'Jetzt kann der Bauer ziehen – der Läufer f4 ist bereits draußen.'],
      ['e6', 'Schwarz öffnet den Weg für seinen Läufer.'],
      ['Nf3', 'Entwicklung Richtung Zentrum.'],
      ['c5', 'Schwarz greift das Zentrum von der Seite an.'],
      ['c3', 'Weiß stützt d4 mit einer stabilen Bauernkette (c3–d4–e3).'],
      ['Nc6', 'Schwarz erhöht den Druck auf d4.'],
      ['Nbd2', 'Der zweite Springer geht nach d2 (nicht c3, da steht der Bauer).'],
      ['Bd6', 'Schwarz bietet den Läufertausch an.'],
      ['Bg3', 'Weiß weicht aus und behält den guten Läufer.'],
      ['O-O', 'Schwarz rochiert.'],
      ['Bd3', 'Der letzte Läufer kommt raus. Als Nächstes rochiert Weiß – eine perfekte Aufstellung!'],
    ],
    summary: 'Merke: d4, Lf4, e3, Sf3, c3, Sbd2, Ld3 und Rochade – fast immer derselbe Plan.',
  },
  {
    id: 'sicilian', name: 'Sizilianische Verteidigung', side: 'b', level: 'Fortgeschritten',
    intro: 'Die beliebteste Antwort auf 1.e4 auf hohem Niveau. Schwarz spielt unsymmetrisch und kämpft um den Sieg.',
    moves: [
      ['e4', 'Weiß eröffnet mit dem Königsbauern.'],
      ['c5', 'Schwarz kontrolliert d4 von der Seite – ohne e5 zu spielen. Das schafft eine unausgeglichene Stellung.'],
      ['Nf3', 'Weiß entwickelt und bereitet d4 vor.'],
      ['d6', 'Schwarz kontrolliert e5 und öffnet den Weg für den Läufer c8.'],
      ['d4', 'Weiß öffnet das Zentrum.'],
      ['cxd4', 'Schwarz tauscht einen Flügelbauern gegen einen Zentrumsbauern – ein guter Tausch!'],
      ['Nxd4', 'Weiß schlägt mit dem Springer zurück.'],
      ['Nf6', 'Entwicklung mit Angriff auf e4.'],
      ['Nc3', 'Weiß deckt e4.'],
      ['a6', 'Die berühmte Najdorf-Variante: Schwarz kontrolliert b5 und plant später b5 für Raumgewinn am Damenflügel.'],
    ],
    summary: 'Merke: Mit c5 kämpft Schwarz um d4. Nach dem Tausch auf d4 hat Schwarz mehr Zentrumsbauern.',
  },
  {
    id: 'french', name: 'Französische Verteidigung', side: 'b', level: 'Einsteiger',
    intro: 'Eine solide Verteidigung: Schwarz baut eine sichere Bauernkette und greift später das weiße Zentrum an.',
    moves: [
      ['e4', 'Weiß eröffnet mit dem Königsbauern.'],
      ['e6', 'Schwarz bereitet d5 vor. So kann er e4 angreifen, ohne einen Bauern zu verlieren.'],
      ['d4', 'Weiß baut ein großes Zentrum.'],
      ['d5', 'Schwarz greift e4 an! Der Bauer d5 ist durch e6 gedeckt.'],
      ['Nc3', 'Weiß deckt e4.'],
      ['Nf6', 'Schwarz erhöht den Druck auf e4.'],
      ['e5', 'Weiß rückt vor und vertreibt den Springer.'],
      ['Nfd7', 'Der Springer weicht aus. Schwarz plant jetzt c5, um die weiße Bauernkette anzugreifen.'],
      ['f4', 'Weiß stützt e5.'],
      ['c5', 'Der typische französische Gegenschlag gegen die Basis der Bauernkette!'],
    ],
    summary: 'Merke: Eine Bauernkette greift man an der Basis an (hier mit c5 gegen d4).',
  },
  {
    id: 'caro', name: 'Caro-Kann-Verteidigung', side: 'b', level: 'Einsteiger',
    intro: 'Sehr solide Verteidigung gegen 1.e4. Schwarz bekommt eine sichere Stellung, und der helle Läufer bleibt aktiv.',
    moves: [
      ['e4', 'Weiß eröffnet mit dem Königsbauern.'],
      ['c6', 'Schwarz bereitet d5 vor. Anders als bei Französisch bleibt der Weg für den Läufer c8 offen.'],
      ['d4', 'Weiß nimmt das Zentrum.'],
      ['d5', 'Schwarz greift e4 an.'],
      ['Nc3', 'Weiß deckt e4.'],
      ['dxe4', 'Schwarz schlägt.'],
      ['Nxe4', 'Weiß schlägt zurück, der Springer steht zentral.'],
      ['Bf5', 'Der Läufer kommt aktiv heraus und greift den Springer an. Das ist der große Vorteil von Caro-Kann.'],
      ['Ng3', 'Der Springer weicht mit Angriff auf den Läufer aus.'],
      ['Bg6', 'Der Läufer bleibt auf der guten Diagonale.'],
    ],
    summary: 'Merke: Erst c6, dann d5 – und den Läufer c8 aktivieren, BEVOR e6 gespielt wird.',
  },
  {
    id: 'scholar', name: 'Falle: Schäfermatt abwehren', side: 'b', level: 'Einsteiger',
    intro: 'Das Schäfermatt ist eine der häufigsten Fallen gegen Anfänger: Dame und Läufer greifen f7 an. Hier lernst du, wie du dich richtig verteidigst!',
    moves: [
      ['e4', 'Weiß eröffnet normal.'],
      ['e5', 'Schwarz antwortet normal.'],
      ['Bc4', 'Der Läufer zielt auf f7 …'],
      ['Nc6', 'Schwarz entwickelt und deckt e5.'],
      ['Qh5', 'ACHTUNG! Die Dame greift f7 an. Zusammen mit dem Läufer droht Dxf7 MATT! Außerdem greift sie e5 an (der ist aber gedeckt).'],
      ['g6', 'Die beste Verteidigung: Der Bauer blockiert die Dame UND greift sie an!'],
      ['Qf3', 'Die Dame flüchtet – und droht schon wieder Dxf7 Matt!'],
      ['Nf6', 'Der Springer stellt sich dazwischen und entwickelt sich dabei. Die Falle ist abgewehrt – und die weiße Dame steht schlecht.'],
    ],
    summary: 'Merke: Achte immer auf f7 (bzw. f2)! Wenn die Dame früh kommt, verteidige mit Entwicklung und Tempo-Gewinn.',
  },
];

// Rätsel: entweder mate:true (jedes Matt ist richtig) oder solution: Zug in Kurznotation
const PUZZLES = [
  { title: 'Grundreihenmatt', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', mate: true,
    goal: 'Weiß zieht und setzt Matt in einem Zug.',
    hint: 'Der schwarze König ist hinter seinen eigenen Bauern eingesperrt.',
    explain: 'Td8# – Der König kann nicht fliehen, weil seine eigenen Bauern ihm den Weg versperren. Darum: Mach dem König im Spiel „Luft“ (z. B. mit h3)!' },
  { title: 'Schäfermatt', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', mate: true,
    goal: 'Weiß zieht und setzt Matt in einem Zug.',
    hint: 'Welches Feld wird nur vom schwarzen König verteidigt?',
    explain: 'Dxf7# – f7 ist nur vom König gedeckt, und die Dame ist durch den Läufer c4 geschützt.' },
  { title: 'Ersticktes Matt', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', mate: true,
    goal: 'Weiß zieht und setzt Matt in einem Zug.',
    hint: 'Der König ist von eigenen Figuren komplett umzingelt. Welche Figur kann darüber springen?',
    explain: 'Sf7# – Ein „ersticktes Matt“: Der König kann sich nicht bewegen, weil alle Felder von eigenen Figuren besetzt sind.' },
  { title: 'Dame und König', fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1', mate: true,
    goal: 'Weiß zieht und setzt Matt in einem Zug.',
    hint: 'Der weiße König deckt schon a7 und b7. Die Dame braucht nur noch die 8. Reihe.',
    explain: 'Dh8# (oder Db7#) – König und Dame arbeiten zusammen. So setzt man im Endspiel Matt.' },
  { title: 'Narrenmatt', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2', mate: true,
    goal: 'Schwarz zieht und setzt Matt in einem Zug.',
    hint: 'Weiß hat die Diagonale zu seinem König geöffnet.',
    explain: 'Dh4# – das schnellste Matt im Schach! Darum: Spiele in der Eröffnung nicht f3 und g4.' },
  { title: 'Treppenmatt', fen: '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', mate: true,
    goal: 'Weiß zieht und setzt Matt in einem Zug.',
    hint: 'Ein Turm sperrt bereits die 7. Reihe ab.',
    explain: 'Tb8# – Die zwei Türme arbeiten wie eine Treppe zusammen: Einer sperrt eine Reihe, der andere gibt Matt.' },
  { title: 'Angriff auf f7', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', mate: true,
    goal: 'Weiß zieht und setzt Matt in einem Zug.',
    hint: 'Wieder der schwache Punkt f7!',
    explain: 'Dxf7# – Dame und Läufer gemeinsam gegen f7. Ein typisches Muster!' },
  { title: 'Springergabel', fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', solution: 'Nc7',
    goal: 'Weiß zieht und gewinnt Material.',
    hint: 'Ein Springer kann zwei Figuren gleichzeitig angreifen.',
    explain: 'Sc7+ – Eine GABEL: Der Springer greift König und Turm gleichzeitig an. Nach dem Königszug schlägt Weiß den Turm.' },
  { title: 'Spieß', fen: '4q3/8/8/4k3/8/8/8/K6R w - - 0 1', solution: 'Re1',
    goal: 'Weiß zieht und gewinnt die Dame.',
    hint: 'König und Dame stehen auf derselben Linie.',
    explain: 'Te1+ – Ein SPIESS: Der König steht im Schach und muss weg – dahinter steht die Dame und geht verloren.' },
  { title: 'Bauernumwandlung', fen: '8/4P1k1/8/8/8/8/6K1/8 w - - 0 1', solution: 'e8=Q',
    goal: 'Weiß zieht und macht aus dem Bauern eine Dame.',
    hint: 'Bauern, die die letzte Reihe erreichen, werden umgewandelt.',
    explain: 'e8=D – Der Bauer wird zur Dame. Freibauern im Endspiel sind sehr wertvoll!' },
];

const TIPS_OF_THE_DAY = [
  'Frage dich vor JEDEM Zug: Was will mein Gegner mit seinem letzten Zug?',
  'Prüfe vor jedem Zug: Schachgebote, Schlagzüge, Drohungen – zuerst für dich, dann für den Gegner.',
  'Entwickle zuerst Springer und Läufer, dann rochiere – erst danach greift man an.',
  'Ziehe in der Eröffnung jede Figur möglichst nur einmal.',
  'Bring die Dame nicht zu früh raus – sie wird sonst von kleineren Figuren gejagt.',
  'Ein Springer am Rand ist eine Schand’ – Springer gehören Richtung Zentrum.',
  'Türme gehören auf offene Linien (Linien ohne Bauern).',
  'Wenn du Material gewonnen hast: Tausche Figuren, nicht Bauern!',
  'Im Endspiel ist der König eine starke Figur – bring ihn in die Mitte!',
  'Ungedeckte Figuren sind in Gefahr. Achte auf rote Markierungen auf dem Brett!',
  'Ein Turm auf der 7. Reihe ist oft sehr stark.',
  'Wenn du nicht weißt, was du tun sollst: Verbessere deine schlechteste Figur.',
];

const TIPS_HTML = `
<section class="tip-card">
  <h3>♟ So ziehen die Figuren</h3>
  <ul>
    <li><b>Bauer (1):</b> zieht 1 Feld vorwärts (vom Start auch 2), schlägt aber schräg. Erreicht er die letzte Reihe, wird er zu einer Dame (oder Turm, Läufer, Springer).</li>
    <li><b>Springer (3):</b> springt im „L“: 2 Felder in eine Richtung, dann 1 zur Seite. Er kann über Figuren springen.</li>
    <li><b>Läufer (3):</b> zieht beliebig weit schräg. Er bleibt immer auf seiner Feldfarbe.</li>
    <li><b>Turm (5):</b> zieht beliebig weit gerade (waagerecht oder senkrecht).</li>
    <li><b>Dame (9):</b> zieht wie Turm und Läufer zusammen – die stärkste Figur.</li>
    <li><b>König:</b> zieht 1 Feld in jede Richtung. Er darf nie ins Schach ziehen.</li>
  </ul>
  <p class="small">Die Zahlen sind die ungefähren Werte der Figuren in Bauerneinheiten. Tausche nur, wenn du gleich viel oder mehr bekommst!</p>
</section>

<section class="tip-card">
  <h3>⭐ Sonderregeln</h3>
  <ul>
    <li><b>Rochade:</b> König zieht 2 Felder Richtung Turm, der Turm springt über ihn. Nur erlaubt, wenn König und Turm noch nicht gezogen haben, nichts dazwischen steht und der König nicht im Schach steht oder durch Schach zieht.</li>
    <li><b>En passant:</b> Zieht ein Bauer 2 Felder und landet neben deinem Bauern, darfst du ihn im nächsten Zug so schlagen, als wäre er nur 1 Feld gezogen.</li>
    <li><b>Matt:</b> Der König steht im Schach und kann sich nicht retten – Spiel gewonnen.</li>
    <li><b>Patt:</b> Wer am Zug ist, hat keinen legalen Zug, steht aber nicht im Schach – Remis (Unentschieden)!</li>
  </ul>
</section>

<section class="tip-card">
  <h3>🚀 Die goldenen Regeln der Eröffnung</h3>
  <ol>
    <li>Besetze das Zentrum mit Bauern (e4, d4 bzw. e5, d5).</li>
    <li>Entwickle Springer und Läufer schnell – Springer vor Läufer.</li>
    <li>Rochiere früh, damit dein König sicher ist.</li>
    <li>Ziehe jede Figur nur einmal, wenn es nicht nötig ist.</li>
    <li>Bring die Dame nicht zu früh ins Spiel.</li>
    <li>Ziehe nicht zu viele Bauern – vor allem nicht vor deinem König (f-, g-, h-Bauer).</li>
    <li>Verbinde deine Türme (alle Figuren zwischen ihnen wegentwickeln).</li>
  </ol>
</section>

<section class="tip-card">
  <h3>🧠 Denken vor jedem Zug</h3>
  <ol>
    <li><b>Was droht der Gegner?</b> Schau dir seinen letzten Zug genau an.</li>
    <li><b>Sind meine Figuren sicher?</b> Ist irgendetwas ungedeckt?</li>
    <li><b>Kandidatenzüge:</b> Prüfe Schachgebote, Schlagzüge und Drohungen (in dieser Reihenfolge!).</li>
    <li><b>Blunder-Check:</b> Bevor du ziehst: Was kann der Gegner nach meinem Zug machen?</li>
  </ol>
</section>

<section class="tip-card">
  <h3>⚔️ Taktische Motive</h3>
  <ul>
    <li><b>Gabel:</b> Eine Figur greift zwei gegnerische Figuren gleichzeitig an. Springer sind darin Meister.</li>
    <li><b>Fesselung:</b> Eine Figur darf (oder sollte) nicht ziehen, weil dahinter eine wertvollere Figur steht.</li>
    <li><b>Spieß:</b> Wie eine Fesselung, nur andersherum: Die wertvolle Figur steht vorne, muss weg, und die dahinter geht verloren.</li>
    <li><b>Abzugsangriff:</b> Eine Figur zieht weg und gibt dabei die Linie für eine andere Figur frei – zwei Angriffe auf einmal.</li>
    <li><b>Grundreihenmatt:</b> Der König ist hinter seinen Bauern eingesperrt und wird von Turm oder Dame auf der Grundreihe mattgesetzt.</li>
    <li><b>Ablenkung:</b> Einen Verteidiger weglocken, damit etwas anderes ungedeckt ist.</li>
  </ul>
</section>

<section class="tip-card">
  <h3>🏰 Mittelspiel</h3>
  <ul>
    <li>Mach einen Plan: Wo ist der Gegner schwach? Dort angreifen.</li>
    <li>Türme auf offene Linien, Springer auf sichere Felder im Zentrum (Vorposten).</li>
    <li>Greife dort an, wo du mehr Figuren hast.</li>
    <li>Tausche, wenn du vorne liegst. Vermeide Tausch, wenn du angreifst und der Gegner sich verteidigen muss.</li>
  </ul>
</section>

<section class="tip-card">
  <h3>👑 Endspiel</h3>
  <ul>
    <li>Aktiviere deinen König – im Endspiel ist er eine Kampffigur!</li>
    <li>Freibauern (kein gegnerischer Bauer kann sie aufhalten) müssen laufen.</li>
    <li>Türme gehören hinter Freibauern.</li>
    <li>Mit Dame oder Turm + König gegen König: Den König an den Rand drängen, dann Matt setzen. Vorsicht vor Patt!</li>
  </ul>
</section>

<section class="tip-card">
  <h3>📈 So wirst du besser</h3>
  <ul>
    <li>Löse jeden Tag ein paar Taktik-Rätsel.</li>
    <li>Lerne 1–2 Eröffnungen richtig (z. B. Italienisch mit Weiß, Caro-Kann mit Schwarz) – mit Verständnis, nicht nur auswendig.</li>
    <li>Schau nach jeder Partie: Wo habe ich eine Figur verloren und warum?</li>
    <li>Spiele lieber langsam und konzentriert als schnell.</li>
  </ul>
</section>
`;
