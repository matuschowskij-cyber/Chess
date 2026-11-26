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
  {
    id: 'scandi', name: 'Skandinavische Verteidigung', side: 'b', level: 'Einsteiger',
    intro: 'Schwarz greift e4 sofort an. Einfach zu lernen: Schwarz bekommt schnell freies Spiel für alle Figuren.',
    moves: [
      ['e4', 'Weiß eröffnet mit dem Königsbauern.'],
      ['d5', 'Schwarz greift sofort den Bauern e4 an – keine Zeit verlieren!'],
      ['exd5', 'Weiß schlägt.'],
      ['Qxd5', 'Schwarz schlägt mit der Dame zurück. Früh, aber hier in Ordnung, weil Weiß keine Figur hat, die sie sofort gut angreift …'],
      ['Nc3', '… außer diesem Springer! Er greift die Dame mit Tempo an.'],
      ['Qa5', 'Die Dame geht auf ein sicheres Feld, von wo sie auf e1 und den Damenflügel zielt.'],
      ['d4', 'Weiß nimmt das Zentrum.'],
      ['Nf6', 'Schwarz entwickelt und kontrolliert e4.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['c6', 'Ein wichtiger Zug: Die Dame bekommt das Rückzugsfeld c7, und d5 wird kontrolliert.'],
      ['Bc4', 'Weiß entwickelt den Läufer aktiv.'],
      ['Bf5', 'Auch Schwarz bringt den Läufer raus – BEVOR e6 gespielt wird.'],
    ],
    summary: 'Merke: Wenn die Dame angegriffen wird, such ein sicheres Feld (a5). Dann Sf6, c6 und Lf5 – eine solide Stellung.',
  },
  {
    id: 'giuocoBlack', name: 'Italienisch – so verteidigst du dich', side: 'b', level: 'Einsteiger',
    intro: 'Die Italienische Partie ist gegen Anfänger sehr beliebt. Hier lernst du die solide Antwort mit Schwarz, wenn Weiß mit c3 und d4 angreift.',
    moves: [
      ['e4', 'Weiß eröffnet.'],
      ['e5', 'Schwarz hält im Zentrum dagegen.'],
      ['Nf3', 'Angriff auf e5.'],
      ['Nc6', 'Schwarz deckt e5 mit Entwicklung.'],
      ['Bc4', 'Der Läufer zielt auf f7.'],
      ['Bc5', 'Schwarz entwickelt symmetrisch und zielt auf f2.'],
      ['c3', 'Weiß bereitet d4 vor.'],
      ['Nf6', 'Schwarz greift e4 an und entwickelt.'],
      ['d4', 'Weiß greift im Zentrum an.'],
      ['exd4', 'Schwarz schlägt – sonst verliert er Raum.'],
      ['cxd4', 'Weiß hat jetzt ein großes Zentrum.'],
      ['Bb4+', 'Wichtig! Der Läufer gibt Schach statt zurückzugehen – so gewinnt Schwarz Zeit.'],
      ['Bd2', 'Weiß blockiert mit dem Läufer.'],
      ['Bxd2+', 'Schwarz tauscht ab.'],
      ['Nbxd2', 'Weiß schlägt zurück.'],
      ['d5', 'Der Befreiungsschlag! Schwarz greift das Zentrum an und öffnet das Spiel für seine Figuren.'],
    ],
    summary: 'Merke: Gegen ein großes Zentrum mit Schach Zeit gewinnen (Lb4+), tauschen und dann mit d5 zurückschlagen.',
  },
  {
    id: 'twoKnights', name: 'Zweispringerspiel (Schwarz)', side: 'b', level: 'Fortgeschritten',
    intro: 'Eine aktive Antwort auf Italienisch: Schwarz greift sofort e4 an. Wenn Weiß f7 angreift, opfert Schwarz einen Bauern für schnelle Entwicklung.',
    moves: [
      ['e4', 'Weiß eröffnet.'],
      ['e5', 'Schwarz antwortet.'],
      ['Nf3', 'Angriff auf e5.'],
      ['Nc6', 'Deckung.'],
      ['Bc4', 'Der Läufer zielt auf f7.'],
      ['Nf6', 'Statt Lc5 greift Schwarz sofort e4 an – das Zweispringerspiel.'],
      ['Ng5', 'Weiß greift f7 doppelt an (Springer + Läufer)!'],
      ['d5', 'Die richtige Antwort: Schwarz blockiert die Läufer-Diagonale.'],
      ['exd5', 'Weiß schlägt.'],
      ['Na5', 'Schwarz greift den Läufer an. Nicht Sxd5?, weil dann Sxf7 oder Lxd5 gefährlich wird.'],
      ['Bb5+', 'Weiß gibt Schach.'],
      ['c6', 'Schwarz blockiert und greift den Läufer erneut an.'],
      ['dxc6', 'Weiß schlägt.'],
      ['bxc6', 'Schwarz hat einen Bauern weniger, aber schnelle Entwicklung und Angriffschancen – dafür lohnt sich das Opfer.'],
    ],
    summary: 'Merke: Gegen Sg5 nicht passiv verteidigen, sondern mit d5 und Sa5 aktiv spielen. Entwicklung ist manchmal mehr wert als ein Bauer.',
  },
  {
    id: 'slav', name: 'Slawische Verteidigung', side: 'b', level: 'Fortgeschritten',
    intro: 'Eine sehr solide Antwort auf das Damengambit. Schwarz deckt d5 mit c6 und hält den hellen Läufer frei.',
    moves: [
      ['d4', 'Weiß eröffnet mit dem Damenbauern.'],
      ['d5', 'Schwarz hält dagegen.'],
      ['c4', 'Das Damengambit.'],
      ['c6', 'Schwarz deckt d5 mit dem c-Bauern. Der Läufer c8 bleibt frei – anders als nach e6.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Nc3', 'Mehr Druck auf d5.'],
      ['dxc4', 'Jetzt nimmt Schwarz den Bauern, weil er mit b5 gedeckt werden könnte.'],
      ['a4', 'Weiß verhindert b5.'],
      ['Bf5', 'Der Läufer kommt aktiv heraus – das ist das Ziel von Slawisch.'],
      ['e3', 'Weiß bereitet Lxc4 vor.'],
      ['e6', 'Jetzt kann e6 kommen, der Läufer ist schon draußen. Solide Stellung!'],
    ],
    summary: 'Merke: Erst den hellen Läufer aktivieren, dann e6 spielen.',
  },
  {
    id: 'kid', name: 'Königsindische Verteidigung', side: 'b', level: 'Fortgeschritten',
    intro: 'Eine kämpferische Antwort auf 1.d4. Schwarz lässt Weiß das Zentrum, rochiert schnell und greift es dann mit e5 an.',
    moves: [
      ['d4', 'Weiß eröffnet.'],
      ['Nf6', 'Schwarz kontrolliert e4 mit dem Springer statt mit einem Bauern.'],
      ['c4', 'Weiß gewinnt Raum.'],
      ['g6', 'Schwarz bereitet Lg7 vor – der Läufer wird auf der langen Diagonale sehr stark.'],
      ['Nc3', 'Weiß entwickelt.'],
      ['Bg7', 'Der Läufer zielt auf das Zentrum und den Damenflügel.'],
      ['e4', 'Weiß baut ein großes Zentrum.'],
      ['d6', 'Schwarz bereitet e5 vor.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['O-O', 'Schwarz bringt den König in Sicherheit.'],
      ['Be2', 'Weiß bereitet die Rochade vor.'],
      ['e5', 'Jetzt greift Schwarz das Zentrum an! Typisch Königsindisch.'],
    ],
    summary: 'Merke: Erst entwickeln und rochieren, dann mit e5 das weiße Zentrum angreifen.',
  },
];

// Rätsel. level: Leicht | Mittel | Schwer
// mate: Anzahl eigener Züge bis Matt (0 = kein Matt, sondern Materialgewinn)
// sol: Lösungszüge der ziehenden Seite (englische Kurznotation); die Antworten des Gegners spielt die Engine.
const PUZZLES = [
  { title: 'Grundreihenmatt', level: 'Leicht', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', mate: 1, sol: ['Rd8'],
    goal: 'Weiß setzt Matt in 1 Zug.',
    hint: 'Der schwarze König ist hinter seinen eigenen Bauern eingesperrt.',
    explain: 'Td8# – Der König kann nicht fliehen, weil seine eigenen Bauern ihm den Weg versperren. Darum: Mach deinem König im Spiel „Luft“ (z. B. mit h3)!' },
  { title: 'Schäfermatt', level: 'Leicht', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', mate: 1, sol: ['Qxf7'],
    goal: 'Weiß setzt Matt in 1 Zug.',
    hint: 'Welches Feld wird nur vom schwarzen König verteidigt?',
    explain: 'Dxf7# – f7 ist nur vom König gedeckt, und die Dame ist durch den Läufer c4 geschützt.' },
  { title: 'Ersticktes Matt', level: 'Leicht', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', mate: 1, sol: ['Nf7'],
    goal: 'Weiß setzt Matt in 1 Zug.',
    hint: 'Der König ist von eigenen Figuren umzingelt. Welche Figur kann darüber springen?',
    explain: 'Sf7# – Ein „ersticktes Matt“: Der König kann sich nicht bewegen, weil alle Felder von eigenen Figuren besetzt sind.' },
  { title: 'Ersticktes Matt mit Schwarz', level: 'Leicht', fen: '6k1/8/8/8/6n1/8/6PP/6RK b - - 0 1', mate: 1, sol: ['Nf2'],
    goal: 'Schwarz setzt Matt in 1 Zug.',
    hint: 'Diesmal ist der weiße König eingesperrt. Welche schwarze Figur kann springen?',
    explain: 'Sf2# – Dasselbe Muster wie mit Weiß, nur gespiegelt. Achte auch auf deinen eigenen König in der Ecke!' },
  { title: 'Narrenmatt', level: 'Leicht', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2', mate: 1, sol: ['Qh4'],
    goal: 'Schwarz setzt Matt in 1 Zug.',
    hint: 'Weiß hat die Diagonale zu seinem König geöffnet.',
    explain: 'Dh4# – das schnellste Matt im Schach! Darum: Spiele in der Eröffnung nicht f3 und g4.' },
  { title: 'Dame und König', level: 'Leicht', fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1', mate: 1, sol: ['Qh8'],
    goal: 'Weiß setzt Matt in 1 Zug.',
    hint: 'Der weiße König deckt schon a7 und b7. Die Dame braucht nur noch die 8. Reihe.',
    explain: 'Dh8# (oder Db7#) – König und Dame arbeiten zusammen. So setzt man im Endspiel Matt.' },
  { title: 'Treppenmatt', level: 'Leicht', fen: '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', mate: 1, sol: ['Rb8'],
    goal: 'Weiß setzt Matt in 1 Zug.',
    hint: 'Ein Turm sperrt bereits die 7. Reihe ab.',
    explain: 'Tb8# – Die zwei Türme arbeiten wie eine Treppe zusammen: Einer sperrt eine Reihe, der andere gibt Matt.' },
  { title: 'Angriff auf f7', level: 'Leicht', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', mate: 1, sol: ['Qxf7'],
    goal: 'Weiß setzt Matt in 1 Zug.',
    hint: 'Wieder der schwache Punkt f7!',
    explain: 'Dxf7# – Dame und Läufer gemeinsam gegen f7. Ein typisches Muster!' },
  { title: 'Springergabel', level: 'Leicht', fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', mate: 0, sol: ['Nc7', 'Nxa8'],
    goal: 'Weiß gewinnt Material.',
    hint: 'Ein Springer kann zwei Figuren gleichzeitig angreifen.',
    explain: 'Sc7+ – Eine GABEL: Der Springer greift König und Turm gleichzeitig an. Nach dem Königszug schlägt Weiß den Turm.' },
  { title: 'Spieß', level: 'Leicht', fen: '4q3/8/8/4k3/8/8/8/K6R w - - 0 1', mate: 0, sol: ['Re1', 'Rxe8'],
    goal: 'Weiß gewinnt die Dame.',
    hint: 'König und Dame stehen auf derselben Linie.',
    explain: 'Te1+ – Ein SPIESS: Der König steht im Schach und muss weg – dahinter steht die Dame und geht verloren.' },
  { title: 'Bauernumwandlung', level: 'Leicht', fen: '8/4P1k1/8/8/8/8/6K1/8 w - - 0 1', mate: 0, sol: ['e8=Q'],
    goal: 'Weiß macht aus dem Bauern eine Dame.',
    hint: 'Bauern, die die letzte Reihe erreichen, werden umgewandelt.',
    explain: 'e8=D – Der Bauer wird zur Dame. Freibauern im Endspiel sind sehr wertvoll!' },

  { title: 'Königsgabel', level: 'Mittel', fen: '6k1/3q1p1p/8/8/4N3/8/5PPP/6K1 w - - 0 1', mate: 0, sol: ['Nf6', 'Nxd7'],
    goal: 'Weiß gewinnt die Dame. (2 Züge)',
    hint: 'Mit Schach kann der Gegner nicht auf deine Drohung reagieren. Such ein Schach, das gleichzeitig die Dame angreift.',
    explain: 'Sf6+ greift König UND Dame an. Schwarz muss den König ziehen, danach Sxd7. Merke: Schach + Angriff = Gabel.' },
  { title: 'Königsgabel mit Schwarz', level: 'Mittel', fen: '6k1/5ppp/8/4n3/8/8/3Q1P1P/6K1 b - - 0 1', mate: 0, sol: ['Nf3', 'Nxd2'],
    goal: 'Schwarz gewinnt die Dame. (2 Züge)',
    hint: 'Welches Springerfeld gibt Schach und greift gleichzeitig die weiße Dame an?',
    explain: 'Sf3+ – Gabel gegen König und Dame. Weiß muss den König ziehen, dann Sxd2. Als Schwarz genauso wichtig wie als Weiß!' },
  { title: 'Ablenkung auf der Grundreihe', level: 'Mittel', fen: 'r5k1/5ppp/8/8/8/8/1Q3PPP/1R4K1 w - - 0 1', mate: 2, sol: ['Qb8', 'Rxb8'],
    goal: 'Weiß setzt Matt in 2 Zügen.',
    hint: 'Der Turm a8 ist der einzige Verteidiger der Grundreihe. Lenk ihn ab – auch wenn es die Dame kostet!',
    explain: 'Db8+! Txb8 Txb8# – Ein Damenopfer lenkt den Verteidiger ab, danach ist die Grundreihe offen. Material ist egal, wenn es Matt gibt!' },
  { title: 'Ablenkung mit Schwarz', level: 'Mittel', fen: '1r4k1/1q3ppp/8/8/8/8/5PPP/R5K1 b - - 0 1', mate: 2, sol: ['Qb1', 'Rxb1'],
    goal: 'Schwarz setzt Matt in 2 Zügen.',
    hint: 'Auch Weiß hat seinem König keine Luft gemacht. Wer verteidigt die 1. Reihe?',
    explain: 'Db1+! Txb1 Txb1# – Dasselbe Muster mit vertauschten Farben. Wenn du Schwarz spielst, achte genauso auf die Grundreihe des Gegners.' },
  { title: 'Abzugsschach', level: 'Mittel', fen: '7k/5p1p/6p1/q7/3N4/8/1B3PPP/6K1 w - - 0 1', mate: 0, sol: ['Nb3', 'Nxa5'],
    goal: 'Weiß gewinnt die Dame. (2 Züge)',
    hint: 'Der Läufer b2 zielt auf den König – nur der Springer steht im Weg.',
    explain: 'Sb3+ (oder Sc6+) – ABZUGSSCHACH: Der Springer zieht weg, der Läufer gibt Schach, und gleichzeitig greift der Springer die Dame an. Schwarz muss das Schach abwehren, danach fällt die Dame.' },

  { title: 'Philidors Vermächtnis', level: 'Schwer', fen: '5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1', mate: 2, sol: ['Qg8', 'Nf7'],
    goal: 'Weiß setzt Matt in 2 Zügen.',
    hint: 'Opfere die Dame auf einem Feld, das der König nicht nehmen darf. Dann hilft ein Springer.',
    explain: 'Dg8+!! Txg8 Sf7# – Die Dame wird geopfert, damit der Turm den letzten Fluchtweg des Königs zustellt. Dann ein ersticktes Matt!' },
  { title: 'Philidor mit Schwarz', level: 'Schwer', fen: '6k1/8/8/8/3q4/7n/6PP/5R1K b - - 0 1', mate: 2, sol: ['Qg1', 'Nf2'],
    goal: 'Schwarz setzt Matt in 2 Zügen.',
    hint: 'Der Springer h3 deckt g1. Was passiert, wenn die Dame dorthin geht?',
    explain: 'Dg1+!! Txg1 Sf2# – Das berühmte erstickte Matt, diesmal für Schwarz.' },
  { title: 'Anastasias Matt', level: 'Schwer', fen: '5rk1/5ppp/8/3N3Q/8/4R3/8/1K6 w - - 0 1', mate: 3, sol: ['Ne7', 'Qxh7', 'Rh3'],
    goal: 'Weiß setzt Matt in 3 Zügen.',
    hint: 'Erst mit dem Springer Schach geben, dann die h-Linie öffnen – mit einem Opfer!',
    explain: 'Se7+ Kh8 Dxh7+!! Kxh7 Th3# – Der Springer e7 nimmt dem König g8 und g6, die Dame öffnet die h-Linie, der Turm setzt Matt.' },
  { title: 'Anastasias Matt mit Schwarz', level: 'Schwer', fen: '1k6/8/4r3/8/3n3q/8/5PPP/5RK1 b - - 0 1', mate: 3, sol: ['Ne2', 'Qxh2', 'Rh6'],
    goal: 'Schwarz setzt Matt in 3 Zügen.',
    hint: 'Springer mit Schach, dann Damenopfer auf h2, dann kommt der Turm.',
    explain: 'Se2+ Kh1 Dxh2+!! Kxh2 Th6# – Dasselbe Matt-Muster mit Schwarz.' },
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
  <h3>♚ Als Schwarz spielen – richtig reagieren</h3>
  <ul>
    <li><b>Weiß hat einen kleinen Vorsprung</b>, weil Weiß zuerst zieht. Als Schwarz willst du zuerst <b>sicher ausgleichen</b>, dann selbst angreifen.</li>
    <li><b>Gegen 1.e4:</b> 1…e5 (klassisch), 1…c5 (Sizilianisch, kämpferisch), 1…e6 (Französisch) oder 1…c6 (Caro-Kann, sehr solide).</li>
    <li><b>Gegen 1.d4:</b> 1…d5 (klassisch) oder 1…Sf6 (flexibel). Gegen 2.c4 ist 2…e6 oder 2…c6 solide.</li>
    <li><b>Frühe Dame (Dh5, Df3):</b> Achte auf f7! Decke mit g6, Sf6 oder De7 und greife die Dame mit Entwicklung an.</li>
    <li><b>Läufer auf c4 und Springer auf g5:</b> Weiß greift f7 doppelt an – antworte mit d5 (Zweispringerspiel).</li>
    <li><b>Großes weißes Zentrum (e4 + d4):</b> Nicht in Panik geraten. Entwickeln, rochieren und dann mit c5, e5 oder d5 das Zentrum angreifen.</li>
    <li><b>Übe es:</b> Wähle bei „Neu“ die Farbe Schwarz, oder „Beide Seiten selbst“, um verschiedene Antworten auszuprobieren. Unter Eröffnungen → „Als Schwarz“ gibt es 9 Lektionen.</li>
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

// Varianten: at = Anzahl Züge der Hauptvariante, die übernommen werden; danach folgen die eigenen Züge.
const OPENING_VARS = {
  italian: [
    { name: 'Zweispringerspiel', at: 5, moves: [
      ['Nf6', 'Schwarz greift sofort e4 an, statt den Läufer zu entwickeln.'],
      ['d3', 'Ruhig und solide: Weiß deckt e4 mit dem Bauern.'],
      ['Bc5', 'Schwarz entwickelt den Läufer.'],
      ['c3', 'Weiß bereitet d4 vor und schafft dem Läufer ein Rückzugsfeld.'],
      ['d6', 'Schwarz stützt e5.'],
      ['O-O', 'Weiß rochiert. Eine gesunde Stellung mit Plan d4 später.'],
    ] },
    { name: 'Ungarische Verteidigung', at: 5, moves: [
      ['Be7', 'Schwarz spielt sehr vorsichtig: Der Läufer schützt den Königsflügel, steht aber passiv.'],
      ['d4', 'Gegen passives Spiel: sofort das Zentrum nehmen!'],
      ['d6', 'Schwarz hält e5.'],
      ['d5', 'Weiß gewinnt Raum und greift den Springer an.'],
      ['Nb8', 'Der Springer muss zurück. Weiß hat klar mehr Raum.'],
      ['Bd3', 'Der Läufer geht auf ein sicheres Feld. Jetzt c4 und Sc3 – Weiß steht angenehm.'],
    ] },
    { name: 'Philidor-Verteidigung (2…d6)', at: 3, moves: [
      ['d6', 'Schwarz deckt e5 mit dem Bauern statt mit dem Springer.'],
      ['d4', 'Weiß greift sofort im Zentrum an.'],
      ['Nf6', 'Schwarz entwickelt und greift e4 an.'],
      ['Nc3', 'Weiß deckt e4 mit Entwicklung.'],
      ['Nbd7', 'Schwarz deckt e5 ein zweites Mal.'],
      ['Bc4', 'Der Läufer zielt wieder auf f7!'],
      ['Be7', 'Schwarz entwickelt und bereitet die Rochade vor.'],
      ['O-O', 'Weiß rochiert und hat mehr Raum.'],
    ] },
  ],
  ruy: [
    { name: 'Abtauschvariante', at: 6, moves: [
      ['Bxc6', 'Weiß tauscht den Läufer gegen den Springer.'],
      ['dxc6', 'Schwarz schlägt mit dem d-Bauern – so wird der Läufer c8 frei.'],
      ['O-O', 'Weiß rochiert. Weil der Springer weg ist, ist e5 jetzt schwächer.'],
      ['f6', 'Schwarz deckt e5 mit dem Bauern.'],
      ['d4', 'Weiß öffnet das Zentrum. Im Endspiel hat Weiß die bessere Bauernstruktur (4 gegen 3 am Königsflügel).'],
    ] },
    { name: 'Berliner Verteidigung', at: 5, moves: [
      ['Nf6', 'Statt a6 greift Schwarz sofort e4 an – die „Berliner Mauer“.'],
      ['O-O', 'Weiß rochiert und lässt e4 scheinbar ungedeckt.'],
      ['Nxe4', 'Schwarz nimmt den Bauern.'],
      ['d4', 'Weiß öffnet sofort das Zentrum und holt den Bauern bald zurück.'],
      ['Nd6', 'Der Springer greift den Läufer an.'],
      ['Bxc6', 'Weiß tauscht.'],
      ['dxc6', 'Schwarz schlägt zurück.'],
      ['dxe5', 'Weiß holt den Bauern zurück und vertreibt den Springer.'],
      ['Nf5', 'Der Springer weicht aus.'],
      ['Qxd8+', 'Damentausch!'],
      ['Kxd8', 'Schwarz kann nicht mehr rochieren, steht aber solide – ein berühmtes Endspiel.'],
    ] },
    { name: 'Klassische Verteidigung (3…Lc5)', at: 5, moves: [
      ['Bc5', 'Der Läufer zielt auf f2.'],
      ['c3', 'Weiß bereitet d4 vor.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['O-O', 'Weiß rochiert.'],
      ['O-O', 'Schwarz rochiert.'],
      ['d4', 'Weiß greift im Zentrum an.'],
      ['Bb6', 'Der Läufer zieht sich zurück und bleibt auf der starken Diagonale.'],
    ] },
  ],
  scotch: [
    { name: 'Klassische Variante (4…Lc5)', at: 7, moves: [
      ['Bc5', 'Schwarz greift sofort den Springer d4 an.'],
      ['Be3', 'Weiß deckt den Springer mit dem Läufer.'],
      ['Qf6', 'Die Dame erhöht den Druck auf d4.'],
      ['c3', 'Weiß deckt d4 noch einmal mit einem Bauern.'],
      ['Nge7', 'Der Springer geht nach e7, damit die Dame auf f6 bleiben kann.'],
      ['Bc4', 'Weiß entwickelt aktiv.'],
    ] },
    { name: 'Schwarz hält e5 (3…d6)', at: 5, moves: [
      ['d6', 'Schwarz schlägt nicht, sondern stützt e5.'],
      ['Bb5', 'Weiß fesselt den Springer – jetzt ist e5 schwer zu halten.'],
      ['Bd7', 'Schwarz bereitet vor, die Fesselung zu lösen.'],
      ['Nc3', 'Weiß entwickelt.'],
      ['exd4', 'Schwarz gibt das Zentrum auf.'],
      ['Nxd4', 'Weiß schlägt zurück und hat freies Spiel und mehr Raum.'],
    ] },
  ],
  qgd: [
    { name: 'Angenommenes Damengambit', at: 3, moves: [
      ['dxc4', 'Schwarz nimmt den Bauern an.'],
      ['e3', 'Weiß öffnet den Weg für den Läufer, um c4 zurückzuholen.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Bxc4', 'Weiß gewinnt den Bauern zurück und hat einen aktiven Läufer.'],
      ['e6', 'Schwarz öffnet seinen Läufer.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['c5', 'Schwarz greift das Zentrum an.'],
      ['O-O', 'Weiß rochiert – Weiß hat etwas mehr Zentrum.'],
    ] },
    { name: 'Slawische Verteidigung', at: 3, moves: [
      ['c6', 'Schwarz deckt d5 mit dem c-Bauern.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Nc3', 'Mehr Druck auf d5.'],
      ['dxc4', 'Jetzt schlägt Schwarz.'],
      ['a4', 'Weiß verhindert b5, damit Schwarz den Bauern nicht halten kann.'],
      ['Bf5', 'Schwarz entwickelt den Läufer.'],
      ['e3', 'Weiß bereitet Lxc4 vor.'],
    ] },
    { name: 'Abtauschvariante', at: 6, moves: [
      ['cxd5', 'Weiß klärt die Bauernstruktur.'],
      ['exd5', 'Schwarz schlägt zurück.'],
      ['Bg5', 'Der Läufer fesselt den Springer.'],
      ['Be7', 'Schwarz löst die Fesselung.'],
      ['e3', 'Weiß entwickelt.'],
      ['c6', 'Schwarz stützt d5.'],
      ['Bd3', 'Weiß entwickelt. Der Plan später: b4–b5, der „Minoritätsangriff“.'],
    ] },
  ],
  london: [
    { name: 'Gegen Königsindisch-Aufbau', at: 1, moves: [
      ['Nf6', 'Schwarz spielt flexibel.'],
      ['Bf4', 'Weiß bleibt beim Londoner Plan.'],
      ['g6', 'Schwarz bereitet Lg7 vor.'],
      ['e3', 'Weiß baut die Bauernkette.'],
      ['Bg7', 'Der Läufer kommt auf die lange Diagonale.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['O-O', 'Schwarz rochiert.'],
      ['Be2', 'Weiß entwickelt und bereitet die Rochade vor.'],
      ['d6', 'Schwarz bereitet e5 vor.'],
      ['O-O', 'Weiß rochiert – sichere Aufstellung wie immer.'],
    ] },
    { name: 'Schwarz greift b2 an (…Db6)', at: 9, moves: [
      ['Qb6', 'Typische Idee gegen London: Weil der Läufer f4 weg ist, greift die Dame b2 an.'],
      ['Qb3', 'Weiß deckt b2 und bietet den Damentausch an.'],
      ['Nc6', 'Schwarz entwickelt.'],
      ['Nbd2', 'Weiß entwickelt. Wenn Schwarz auf b3 tauscht, schlägt Weiß mit dem a-Bauern und bekommt eine offene a-Linie.'],
    ] },
  ],
  sicilian: [
    { name: 'Alapin-Variante (2.c3)', at: 2, moves: [
      ['c3', 'Weiß bereitet d4 vor, um ein Bauernzentrum zu bauen.'],
      ['d5', 'Eine gute Antwort: Schwarz greift sofort e4 an.'],
      ['exd5', 'Weiß schlägt.'],
      ['Qxd5', 'Die Dame schlägt zurück. Sie kann nicht mit Sc3 gejagt werden, weil dort der Bauer steht!'],
      ['d4', 'Weiß baut das Zentrum.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['e6', 'Schwarz öffnet den Läufer und steht solide.'],
    ] },
    { name: 'Geschlossenes Sizilianisch', at: 2, moves: [
      ['Nc3', 'Weiß spielt ruhiger und öffnet das Zentrum nicht.'],
      ['Nc6', 'Schwarz entwickelt.'],
      ['g3', 'Weiß plant Lg2.'],
      ['g6', 'Schwarz plant ebenfalls Lg7.'],
      ['Bg2', 'Der Läufer auf der langen Diagonale.'],
      ['Bg7', 'Schwarz ebenso.'],
      ['d3', 'Weiß stützt e4.'],
      ['d6', 'Eine solide Aufstellung. Schwarz plant später Angriff am Damenflügel mit Tb8 und b5.'],
    ] },
    { name: 'Drachenvariante', at: 9, moves: [
      ['g6', 'Statt a6: der Drachen! Der Läufer kommt nach g7.'],
      ['Be3', 'Weiß entwickelt.'],
      ['Bg7', 'Der Läufer auf der langen Diagonale – sehr stark.'],
      ['f3', 'Weiß schützt e4 und plant Dd2 und die lange Rochade.'],
      ['O-O', 'Schwarz rochiert.'],
      ['Qd2', 'Weiß verbindet Dame und Läufer.'],
      ['Nc6', 'Schwarz entwickelt und greift d4 an. Ein scharfer Kampf beginnt!'],
    ] },
  ],
  french: [
    { name: 'Vorstoßvariante (3.e5)', at: 4, moves: [
      ['e5', 'Weiß rückt sofort vor und gewinnt Raum.'],
      ['c5', 'Typisch: Angriff auf die Basis der Kette (d4).'],
      ['c3', 'Weiß stützt d4.'],
      ['Nc6', 'Mehr Druck auf d4.'],
      ['Nf3', 'Weiß deckt d4 noch einmal.'],
      ['Qb6', 'Die Dame greift d4 und b2 an.'],
      ['a3', 'Weiß bereitet b4 vor.'],
      ['Bd7', 'Schwarz entwickelt und plant Tc8.'],
    ] },
    { name: 'Abtauschvariante', at: 4, moves: [
      ['exd5', 'Weiß tauscht – die Stellung wird symmetrisch.'],
      ['exd5', 'Schwarz schlägt zurück; sein Läufer c8 ist jetzt frei.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Bd3', 'Weiß entwickelt.'],
      ['Bd6', 'Schwarz spiegelt.'],
      ['O-O', 'Weiß rochiert.'],
      ['O-O', 'Schwarz rochiert – völlig ausgeglichen.'],
    ] },
    { name: 'Winawer-Variante (3…Lb4)', at: 5, moves: [
      ['Bb4', 'Statt Sf6: Der Läufer fesselt den Springer c3.'],
      ['e5', 'Weiß rückt vor.'],
      ['c5', 'Der übliche Gegenschlag.'],
      ['a3', 'Weiß fragt den Läufer.'],
      ['Bxc3+', 'Schwarz tauscht.'],
      ['bxc3', 'Weiß hat Doppelbauern, aber dafür das Läuferpaar.'],
      ['Ne7', 'Der Springer geht nach e7, weil f6 vom Bauern e5 kontrolliert wird.'],
    ] },
  ],
  caro: [
    { name: 'Vorstoßvariante (3.e5)', at: 4, moves: [
      ['e5', 'Weiß gewinnt Raum.'],
      ['Bf5', 'Der Läufer kommt raus, bevor e6 gespielt wird.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['e6', 'Jetzt e6 – eine solide Kette.'],
      ['Be2', 'Weiß entwickelt.'],
      ['c5', 'Angriff auf die Basis der weißen Kette.'],
      ['O-O', 'Weiß rochiert.'],
      ['Nc6', 'Mehr Druck auf d4.'],
    ] },
    { name: 'Abtauschvariante', at: 4, moves: [
      ['exd5', 'Weiß tauscht.'],
      ['cxd5', 'Schwarz schlägt mit dem c-Bauern zurück.'],
      ['Bd3', 'Weiß entwickelt aktiv.'],
      ['Nc6', 'Schwarz entwickelt.'],
      ['c3', 'Weiß stützt d4.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Bf4', 'Weiß entwickelt.'],
      ['Bg4', 'Der Läufer wird aktiv.'],
    ] },
    { name: 'Zweispringer-Variante (2.Sc3)', at: 2, moves: [
      ['Nc3', 'Weiß entwickelt statt d4.'],
      ['d5', 'Schwarz greift e4 an.'],
      ['Nf3', 'Weiß entwickelt weiter.'],
      ['Bg4', 'Der Läufer fesselt den Springer.'],
      ['h3', 'Weiß fragt den Läufer.'],
      ['Bxf3', 'Schwarz tauscht ab.'],
      ['Qxf3', 'Die Dame schlägt zurück.'],
      ['e6', 'Schwarz baut solide auf. Die weiße Dame steht etwas früh draußen.'],
    ] },
  ],
  scholar: [
    { name: 'Dame über f3', at: 4, moves: [
      ['Qf3', 'Die Dame kommt über f3 – sie droht Dxf7 Matt!'],
      ['Nf6', 'Der Springer stellt sich dazwischen und entwickelt sich dabei.'],
      ['Ne2', 'Weiß entwickelt.'],
      ['Bc5', 'Schwarz entwickelt und zielt selbst auf f2.'],
    ] },
    { name: 'Direkt 2.Dh5', at: 2, moves: [
      ['Qh5', 'Die Dame kommt sofort und greift e5 an.'],
      ['Nc6', 'Schwarz deckt e5 und entwickelt.'],
      ['Bc4', 'Jetzt droht Dxf7 Matt!'],
      ['g6', 'Der Bauer greift die Dame an und blockiert.'],
      ['Qf3', 'Die Dame flieht und droht wieder Matt auf f7.'],
      ['Nf6', 'Abgewehrt – mit Entwicklung!'],
    ] },
  ],
  scandi: [
    { name: 'Springer schlägt zurück (2…Sf6)', at: 3, moves: [
      ['Nf6', 'Schwarz holt den Bauern mit dem Springer zurück statt mit der Dame.'],
      ['d4', 'Weiß baut das Zentrum.'],
      ['Nxd5', 'Schwarz gewinnt den Bauern zurück.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['Bg4', 'Der Läufer wird aktiv.'],
      ['Be2', 'Weiß entwickelt.'],
      ['e6', 'Schwarz baut solide auf.'],
    ] },
    { name: 'Weiß rückt vor (2.e5)', at: 2, moves: [
      ['e5', 'Weiß rückt vor statt zu schlagen.'],
      ['Bf5', 'Der Läufer kommt raus – ähnlich wie Caro-Kann.'],
      ['d4', 'Weiß stützt e5.'],
      ['e6', 'Schwarz baut eine solide Kette.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['c5', 'Angriff auf d4!'],
    ] },
  ],
  giuocoBlack: [
    { name: 'Weiß spielt ruhig (4.d3)', at: 6, moves: [
      ['d3', 'Weiß spielt ruhig (Giuoco Pianissimo).'],
      ['Nf6', 'Schwarz entwickelt und greift e4 an.'],
      ['O-O', 'Weiß rochiert.'],
      ['d6', 'Schwarz deckt e5.'],
      ['c3', 'Weiß bereitet d4 vor.'],
      ['O-O', 'Schwarz rochiert – eine sichere Stellung.'],
    ] },
    { name: 'Evans-Gambit (4.b4)', at: 6, moves: [
      ['b4', 'Das Evans-Gambit! Weiß opfert einen Bauern für schnelle Entwicklung.'],
      ['Bxb4', 'Schwarz nimmt an.'],
      ['c3', 'Weiß vertreibt den Läufer mit Tempo.'],
      ['Ba5', 'Der Läufer zieht sich zurück und bleibt aktiv.'],
      ['d4', 'Weiß öffnet das Zentrum.'],
      ['exd4', 'Schwarz schlägt.'],
      ['O-O', 'Weiß rochiert und opfert weiter für den Angriff.'],
      ['Nge7', 'Solide: Schwarz entwickelt und hält f7 geschützt. Bald folgt d5 oder die Rochade.'],
    ] },
  ],
  twoKnights: [
    { name: 'Weiß spielt ruhig (4.d3)', at: 6, moves: [
      ['d3', 'Weiß spielt ruhig und deckt e4.'],
      ['Be7', 'Schwarz entwickelt solide.'],
      ['O-O', 'Weiß rochiert.'],
      ['O-O', 'Schwarz rochiert.'],
      ['Re1', 'Der Turm deckt e4.'],
      ['d6', 'Schwarz deckt e5 – eine sichere Stellung.'],
    ] },
    { name: 'Weiß öffnet (4.d4)', at: 6, moves: [
      ['d4', 'Weiß öffnet sofort das Zentrum.'],
      ['exd4', 'Schwarz schlägt.'],
      ['O-O', 'Weiß rochiert und lässt e4 ungedeckt.'],
      ['Nxe4', 'Schwarz nimmt den Bauern.'],
      ['Re1', 'Der Turm greift den Springer an.'],
      ['d5', 'Schwarz deckt den Springer mit dem Bauern.'],
      ['Bxd5', 'Weiß opfert den Läufer!'],
      ['Qxd5', 'Schwarz schlägt zurück.'],
      ['Nc3', 'Doppelangriff auf Dame und Springer!'],
      ['Qa5', 'Die Dame weicht aus und hält den Springer e4 im Blick – Schwarz steht gut.'],
    ] },
  ],
  slav: [
    { name: 'Abtauschvariante', at: 4, moves: [
      ['cxd5', 'Weiß tauscht – die Abtauschvariante.'],
      ['cxd5', 'Schwarz schlägt zurück, die Stellung ist symmetrisch.'],
      ['Nc3', 'Weiß entwickelt.'],
      ['Nf6', 'Schwarz entwickelt.'],
      ['Bf4', 'Weiß entwickelt aktiv.'],
      ['Nc6', 'Schwarz entwickelt.'],
      ['e3', 'Weiß baut solide auf.'],
      ['Bf5', 'Schwarz spiegelt – ausgeglichen.'],
    ] },
    { name: 'Weiß deckt c4 (3.e3)', at: 4, moves: [
      ['e3', 'Weiß deckt c4 vorsorglich.'],
      ['Bf5', 'Schwarz entwickelt den Läufer vor e6.'],
      ['Nc3', 'Weiß entwickelt.'],
      ['e6', 'Jetzt e6.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['Nd7', 'Schwarz entwickelt flexibel und plant Sgf6.'],
    ] },
  ],
  kid: [
    { name: 'Weiß spielt ruhig (2.Sf3, Lf4)', at: 2, moves: [
      ['Nf3', 'Weiß spielt ruhig.'],
      ['g6', 'Schwarz bleibt beim Plan.'],
      ['Bf4', 'Weiß entwickelt.'],
      ['Bg7', 'Der Läufer auf der langen Diagonale.'],
      ['e3', 'Weiß baut auf.'],
      ['O-O', 'Schwarz rochiert.'],
      ['Be2', 'Weiß entwickelt.'],
      ['d6', 'Schwarz plant e5 oder c5.'],
    ] },
    { name: 'Vierbauernangriff', at: 8, moves: [
      ['f4', 'Der Vierbauernangriff: Weiß baut ein riesiges Zentrum.'],
      ['O-O', 'Schwarz rochiert erst einmal.'],
      ['Nf3', 'Weiß entwickelt.'],
      ['c5', 'Schwarz greift das Zentrum sofort an!'],
      ['d5', 'Weiß rückt vor.'],
      ['e6', 'Schwarz greift die Spitze an und öffnet Linien für seine Figuren.'],
    ] },
  ],
};
