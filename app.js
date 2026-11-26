/* global Engine, OPENINGS, PUZZLES, TIPS_HTML, TIPS_OF_THE_DAY */
'use strict';
const E = Engine;
const $ = id => document.getElementById(id);

const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const VS = '︎'; // erzwingt Text-Darstellung statt Emoji
const NAME = { p: 'Bauer', n: 'Springer', b: 'Läufer', r: 'Turm', q: 'Dame', k: 'König' };
const NAME_ACC = { p: 'deinen Bauern', n: 'deinen Springer', b: 'deinen Läufer', r: 'deinen Turm', q: 'deine Dame', k: 'deinen König' };
const NAME_THEIR = { p: 'den Bauern', n: 'den Springer', b: 'den Läufer', r: 'den Turm', q: 'die Dame', k: 'den König' };

// Deutsche Notation: S=Springer, L=Läufer, T=Turm, D=Dame, K=König
const de = san => san.replace(/[NBRQ]/g, c => ({ N: 'S', B: 'L', R: 'T', Q: 'D' })[c]);
const sameMove = (a, b) => a && b && a.from === b.from && a.to === b.to && (a.promo || '') === (b.promo || '');
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const later = (fn, ms) => setTimeout(fn, ms || 0);

// Bekannte Eröffnungen zur Erkennung im Spiel
const OPENING_NAMES = [
  ['e4', 'Königsbauer-Eröffnung'], ['d4', 'Damenbauer-Eröffnung'], ['c4', 'Englische Eröffnung'], ['Nf3', 'Réti-Eröffnung'],
  ['e4 e5', 'Offene Partie'], ['e4 e5 Nf3 Nc6 Bc4', 'Italienische Partie'], ['e4 e5 Nf3 Nc6 Bc4 Nf6', 'Zweispringerspiel'],
  ['e4 e5 Nf3 Nc6 Bb5', 'Spanische Partie'], ['e4 e5 Nf3 Nc6 d4', 'Schottische Partie'], ['e4 e5 Nf3 d6', 'Philidor-Verteidigung'],
  ['e4 e5 Nf3 Nf6', 'Russische Verteidigung'], ['e4 e5 f4', 'Königsgambit'], ['e4 e5 Nc3', 'Wiener Partie'],
  ['e4 e5 Bc4 Nc6 Qh5', 'Schäfermatt-Versuch!'], ['e4 e5 Qh5', 'Frühe Damen-Attacke'],
  ['e4 c5', 'Sizilianische Verteidigung'], ['e4 e6', 'Französische Verteidigung'], ['e4 c6', 'Caro-Kann-Verteidigung'],
  ['e4 d5', 'Skandinavische Verteidigung'], ['e4 d6', 'Pirc-Verteidigung'], ['e4 Nf6', 'Aljechin-Verteidigung'],
  ['d4 d5', 'Geschlossene Partie'], ['d4 d5 c4', 'Damengambit'], ['d4 d5 c4 dxc4', 'Angenommenes Damengambit'],
  ['d4 d5 c4 c6', 'Slawische Verteidigung'], ['d4 d5 c4 e6', 'Abgelehntes Damengambit'],
  ['d4 d5 Bf4', 'Londoner System'], ['d4 Nf6 Bf4', 'Londoner System'], ['d4 d5 Nf3 Nf6 Bf4', 'Londoner System'],
  ['d4 Nf6', 'Indische Verteidigung'], ['d4 Nf6 c4 g6', 'Königsindische Verteidigung'], ['d4 Nf6 c4 e6 Nc3 Bb4', 'Nimzoindische Verteidigung'],
  ['d4 f5', 'Holländische Verteidigung'],
];
for (const o of OPENINGS) {
  OPENING_NAMES.push([o.moves.map(m => m[0]).join(' '), o.name]);
  for (const v of (typeof OPENING_VARS !== 'undefined' && OPENING_VARS[o.id]) || []) {
    OPENING_NAMES.push([o.moves.slice(0, v.at).concat(v.moves).map(m => m[0]).join(' '), `${o.name}: ${v.name}`]);
  }
}

function isBookLine(sans) {
  const line = sans.map(E.cleanSAN).join(' ');
  return OPENING_NAMES.some(([seq]) => seq === line || seq.startsWith(line + ' '));
}

function openingNameFor(sans) {
  const line = sans.map(E.cleanSAN).join(' ');
  let best = null, len = 0;
  for (const [seq, name] of OPENING_NAMES) {
    if ((line === seq || line.startsWith(seq + ' ')) && seq.length > len) { best = name; len = seq.length; }
  }
  return best;
}

// ===================== Brett =====================
const ui = {
  orientation: 'w', selected: -1, targets: [], legal: [],
  ctx: null, // aktueller Brett-Kontext (Spiel, Eröffnung, Rätsel)
  arrows: [], hintFrom: -1, busy: false, mark: null,
};

function setContext(ctx) {
  ui.ctx = ctx;
  ui.selected = -1; ui.targets = []; ui.arrows = []; ui.hintFrom = -1;
  render();
}

// Markiert eigene Figuren in Gefahr (rot) und schlagbare gegnerische (grün)
function threatSquares(s, me) {
  const danger = [], chance = [];
  const b = s.board;
  for (let i = 0; i < 64; i++) {
    const p = b[i];
    if (!p || E.typeOf(p) === 'k') continue;
    const owner = E.colorOf(p), enemy = E.other(owner);
    const att = E.attackers(b, i, enemy);
    if (!att.length) continue;
    const defended = E.attackers(b, i, owner).length > 0;
    const val = E.VALUE[E.typeOf(p)];
    const cheapest = Math.min(...att.map(a => E.VALUE[E.typeOf(b[a])] || 0));
    const hanging = !defended || cheapest < val;
    if (!hanging) continue;
    if (owner === me) danger.push(i); else chance.push(i);
  }
  return { danger, chance };
}

function render() {
  const ctx = ui.ctx;
  if (!ctx) return;
  const s = ctx.state;
  const boardEl = $('board');
  boardEl.innerHTML = '';
  const checkSq = E.inCheck(s, s.turn) ? E.kingSquare(s.board, s.turn) : -1;
  const th = ctx.showThreats && ctx.showThreats() ? threatSquares(s, ctx.me) : { danger: [], chance: [] };
  const flip = ui.orientation === 'b';
  for (let k = 0; k < 64; k++) {
    const i = flip ? 63 - k : k;
    const r = i >> 3, c = i % 8;
    const sq = document.createElement('div');
    sq.className = 'sq ' + ((r + c) % 2 ? 'dark' : 'light');
    if (ctx.lastMove && (ctx.lastMove.from === i || ctx.lastMove.to === i)) sq.classList.add('last');
    if (ui.selected === i) sq.classList.add('sel');
    if (ui.hintFrom === i) sq.classList.add('hintfrom');
    if (i === checkSq) sq.classList.add('check');
    if (ui.mark && ui.mark.sq === i) sq.classList.add(ui.mark.cls);
    if (th.danger.includes(i)) { sq.classList.add('danger'); sq.title = 'Achtung: Diese Figur ist in Gefahr!'; }
    if (th.chance.includes(i)) { sq.classList.add('chance'); sq.title = 'Diese gegnerische Figur kannst du vielleicht gewinnen!'; }
    const p = s.board[i];
    if (p) {
      const span = document.createElement('span');
      span.className = 'piece ' + E.colorOf(p);
      span.textContent = GLYPH[E.typeOf(p)] + VS;
      sq.appendChild(span);
    }
    if (ui.targets.includes(i)) {
      const d = document.createElement('span');
      d.className = p || (ui.legal.find(m => m.from === ui.selected && m.to === i && m.flag === 'ep')) ? 'ring' : 'dot';
      sq.appendChild(d);
    }
    if ((flip ? r === 0 : r === 7)) { const f = document.createElement('span'); f.className = 'coord file'; f.textContent = 'abcdefgh'[c]; sq.appendChild(f); }
    if ((flip ? c === 7 : c === 0)) { const f = document.createElement('span'); f.className = 'coord rank'; f.textContent = 8 - r; sq.appendChild(f); }
    sq.addEventListener('click', () => onSquare(i));
    boardEl.appendChild(sq);
  }
  drawArrows();
  renderBars();
}

function sqCenter(i) {
  let r = i >> 3, c = i % 8;
  if (ui.orientation === 'b') { r = 7 - r; c = 7 - c; }
  return [c + 0.5, r + 0.5];
}

function drawArrows() {
  const layer = $('arrowLayer');
  layer.innerHTML = '';
  for (const a of ui.arrows) {
    const [x1, y1] = sqCenter(a.from), [x2, y2] = sqCenter(a.to);
    const len = Math.hypot(x2 - x1, y2 - y1);
    const sh = 0.32 / len;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2 - (x2 - x1) * sh); line.setAttribute('y2', y2 - (y2 - y1) * sh);
    line.setAttribute('marker-end', 'url(#ah)');
    layer.appendChild(line);
  }
}

// Geschlagene Figuren und Materialvorteil
// Spielerkarten über und unter dem Brett: Name, geschlagene Figuren, Materialvorteil
function renderBars() {
  const ctx = ui.ctx;
  const s = ctx.state;
  const start = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const count = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
  let mat = 0;
  for (const p of s.board) {
    if (!p || E.typeOf(p) === 'k') continue;
    const c = E.colorOf(p), t = E.typeOf(p);
    count[c][t]++;
    mat += (c === 'w' ? 1 : -1) * E.VALUE[t];
  }
  const capturedBy = color => {
    const opp = E.other(color);
    let out = '';
    for (const t of ['q', 'r', 'b', 'n', 'p']) out += (GLYPH[t] + VS).repeat(Math.max(0, start[t] - count[opp][t]));
    return out;
  };
  const card = color => {
    const info = (ctx.players && ctx.players[color]) || { name: color === 'w' ? 'Weiß' : 'Schwarz', sub: '' };
    const adv = color === 'w' ? mat : -mat;
    if (ctx.noCaps) return `<div class="av ${color}v">${GLYPH.k}${VS}</div><div class="who"><span class="nm">${info.name}</span><span class="sub">${info.sub || (color === 'w' ? 'Weiß' : 'Schwarz')}</span></div>${s.turn === color ? '<span class="turn-dot"></span>' : ''}`;
    const advStr = adv > 0 ? `<span class="adv">+${Math.round(adv / 100)}</span>` : '';
    const dot = s.turn === color ? '<span class="turn-dot" title="am Zug"></span>' : '';
    return `<div class="av ${color}v">${GLYPH.k}${VS}</div>
      <div class="who"><span class="nm">${info.name}</span><span class="sub">${info.sub || (color === 'w' ? 'Weiß' : 'Schwarz')}</span></div>${dot}
      <span class="caps">${capturedBy(color)}${advStr}</span>`;
  };
  const top = ui.orientation === 'w' ? 'b' : 'w';
  $('topBar').innerHTML = card(top);
  $('bottomBar').innerHTML = card(E.other(top));
}

function showToast(text, ms) {
  const t = $('toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { t.hidden = true; }, ms || 1300);
}

async function onSquare(i) {
  const ctx = ui.ctx;
  if (!ctx || ui.busy || !ctx.canMove()) return;
  const s = ctx.state;
  if (ui.selected >= 0) {
    const cands = ui.legal.filter(m => m.from === ui.selected && m.to === i);
    if (cands.length) {
      let m = cands[0];
      if (cands.length > 1) {
        const promo = await choosePromotion(s.turn);
        m = cands.find(x => E.typeOf(x.promo) === promo) || cands[0];
      }
      ui.selected = -1; ui.targets = []; ui.arrows = []; ui.hintFrom = -1;
      ctx.onMove(m);
      return;
    }
  }
  const p = s.board[i];
  if (p && E.colorOf(p) === s.turn && i !== ui.selected) {
    ui.legal = E.legalMoves(s);
    ui.selected = i;
    ui.targets = ui.legal.filter(m => m.from === i).map(m => m.to);
  } else {
    ui.selected = -1; ui.targets = [];
  }
  render();
}

function choosePromotion(color) {
  return new Promise(resolve => {
    const box = $('promo');
    box.innerHTML = '';
    for (const t of ['q', 'r', 'b', 'n']) {
      const btn = document.createElement('button');
      btn.innerHTML = `<span class="piece ${color}">${GLYPH[t]}${VS}</span>`;
      btn.title = NAME[t];
      btn.onclick = () => { box.hidden = true; resolve(t); };
      box.appendChild(btn);
    }
    box.hidden = false;
  });
}

function shakeBoard() {
  const w = document.querySelector('.board-wrap');
  w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake');
}

// ===================== Spiel gegen Computer =====================
const LEVELS = { 0: 'Beide Seiten selbst', 1: 'Anfänger', 2: 'Fortgeschritten', 3: 'Stark', 4: 'Meister' };
const settings = { color: 'w', level: 2, board: 'green' };
try { Object.assign(settings, JSON.parse(localStorage.getItem('schach-settings') || '{}')); } catch (e) { /* egal */ }
function saveSettings() { try { localStorage.setItem('schach-settings', JSON.stringify(settings)); } catch (e) { /* egal */ } }
function applyBoardTheme() { document.querySelector('.board-wrap').dataset.board = settings.board; }

const game = {
  states: [], moves: [], sans: [], quals: [], player: 'w', level: 2, over: false, hintStep: 0, lastOpening: null, lastQuality: null,
};
const twoPlayer = () => game.level === 0;
const curState = () => game.states[game.states.length - 1];
const myColor = () => (twoPlayer() ? curState().turn : game.player);

const tidy = h => h.replace(/!\./g, '!').replace(/\.\./g, '.');
function setCoach(html) { $('coachMsg').innerHTML = tidy(html); }
function appendCoach(html) { $('coachMsg').insertAdjacentHTML('beforeend', tidy(html)); }

function newGame(fromStates, fromMoves, fromSans, playerColor, level) {
  let col = playerColor || settings.color;
  if (col === 'r') col = Math.random() < 0.5 ? 'w' : 'b';
  game.player = col;
  game.level = level !== undefined ? level : settings.level;
  game.states = fromStates ? fromStates.slice() : [E.parseFEN(E.START_FEN)];
  game.moves = fromMoves ? fromMoves.slice() : [];
  game.sans = fromSans ? fromSans.slice() : [];
  game.quals = new Array(game.sans.length).fill(null);
  game.over = false; game.hintStep = 0;
  game.lastOpening = openingNameFor(game.sans);
  chat.turns = [];
  $('chatLog').innerHTML = '';
  ui.orientation = col;
  setContext(playContext());
  $('playTitle').textContent = twoPlayer() ? 'Analysebrett' : `Gegen Computer · ${LEVELS[game.level]}`;
  $('openingName').textContent = game.lastOpening || '';
  let intro;
  if (fromStates) intro = '<p>Weiter geht’s! Spiel die Partie aus dieser Stellung weiter.</p>';
  else if (twoPlayer()) intro = '<p>Du ziehst <b>beide Seiten</b>. Ich bewerte jeden Zug – für Weiß und für Schwarz. Ideal, um auszuprobieren, wie man als Schwarz auf weiße Züge reagiert.</p><p class="small">Mit „⇅ Drehen“ kannst du das Brett aus der Sicht von Schwarz sehen.</p>';
  else if (col === 'b') intro = `<p>Du spielst <b>Schwarz</b>. Weiß zieht zuerst – dein Job ist es, gut zu <b>reagieren</b>.</p>
    <p class="small">Faustregeln: Gegen 1.e4 sind e5, c5, e6 oder c6 gute Antworten, gegen 1.d4 sind d5 oder Sf6 gut. Frag dich nach jedem weißen Zug: Was droht er? Dann entwickle deine Figuren und rochiere.</p>`;
  else intro = `<p>Du spielst <b>Weiß</b> und ziehst zuerst. Nach jedem Zug sage ich dir, wie gut er war.</p>
    <p class="small">Klicke auf eine Figur und dann auf das Zielfeld. Mit „💡 Tipp“ helfe ich dir.</p>`;
  setCoach(intro);
  $('tipOfDay').textContent = pick(TIPS_OF_THE_DAY);
  showSub('coach');
  updatePlayUI();
  if (!twoPlayer() && curState().turn !== game.player) later(computerMove, 500);
}

function playContext() {
  return {
    get state() { return curState(); },
    get lastMove() { return game.moves[game.moves.length - 1] || null; },
    get me() { return myColor(); },
    get players() {
      if (twoPlayer()) return { w: { name: 'Weiß', sub: 'du' }, b: { name: 'Schwarz', sub: 'du' } };
      const c = E.other(game.player);
      return { [game.player]: { name: 'Du', sub: game.player === 'w' ? 'Weiß' : 'Schwarz' }, [c]: { name: 'Computer', sub: `${LEVELS[game.level]} · ${c === 'w' ? 'Weiß' : 'Schwarz'}` } };
    },
    showThreats: () => $('threatChk').checked && !game.over,
    canMove: () => !game.over && (twoPlayer() || curState().turn === game.player),
    onMove: playerMove,
  };
}

function pushMove(m) {
  const s = curState();
  const san = E.toSAN(s, m);
  game.states.push(E.makeMove(s, m));
  game.moves.push(m);
  game.sans.push(san);
  game.quals.push(null);
  return san;
}

const QBADGE = { book: ['q-book', '📖', ''], best: ['q-best', '★', '★ Bester Zug!'], good: ['q-good', '✓', ''], inaccurate: ['q-inacc', '?!', ''], mistake: ['q-mist', '?', '? Fehler'], blunder: ['q-blund', '??', '?? Grober Fehler'] };

function playerMove(m) {
  const before = curState();
  const histBefore = game.moves.slice();
  pushMove(m);
  game.hintStep = 0;
  render();
  updatePlayUI();
  ui.busy = true;
  setStatus('Trainer bewertet deinen Zug', true);
  later(() => {
    game.lastQuality = 'best';
    const fb = coachFeedback(before, m, histBefore);
    game.quals[game.quals.length - 1] = game.lastQuality;
    setCoach(fb);
    showSub('coach');
    const toast = QBADGE[game.lastQuality] && QBADGE[game.lastQuality][2];
    if (toast) showToast(toast, 1100);
    ui.busy = false;
    if (!checkGameOver()) {
      if (twoPlayer()) {
        const s = curState();
        const th = describeThreat(s, E.other(s.turn));
        if (th) appendCoach(`<p class="warn">⚠ Jetzt ist ${s.turn === 'w' ? 'Weiß' : 'Schwarz'} am Zug. Achtung, Drohung: ${th.text}.</p>`);
        else appendCoach(`<p class="small">Jetzt ist <b>${s.turn === 'w' ? 'Weiß' : 'Schwarz'}</b> am Zug.</p>`);
        render();
      } else later(computerMove, 350);
    }
    updatePlayUI();
  }, 30);
}

function computerMove() {
  if (game.over || twoPlayer() || curState().turn === game.player) return;
  ui.busy = true;
  setStatus('Computer denkt nach', true);
  later(() => {
    const s = curState();
    const m = chooseComputerMove(s);
    ui.busy = false;
    if (!m) { checkGameOver(); return; }
    const san = pushMove(m);
    render();
    if (!checkGameOver()) {
      const name = openingNameFor(game.sans);
      if (name && name !== game.lastOpening) {
        game.lastOpening = name;
        $('openingName').textContent = name;
      }
      const extra = E.inCheck(curState(), game.player) ? ' <span class="bad">Du stehst im Schach!</span>' : '';
      appendCoach(`<p>🤖 Computer spielt <b>${de(san)}</b>: Der Zug ${joinReasons(explainMove(s, m).slice(0, 3))}.${extra}</p>`);
      const th = describeThreat(curState(), E.other(game.player));
      if (th) appendCoach(`<p class="warn">⚠ Achtung, Drohung: ${th.text}. Was machst du dagegen?</p>`);
    }
    updatePlayUI();
  }, 60);
}

function bookMove(s) {
  if (game.sans.length > 16) return null;
  const line = game.sans.map(E.cleanSAN);
  const cands = [];
  for (const o of OPENINGS) {
    for (const l of openingLines(o)) {
      const seq = l.moves.map(x => E.cleanSAN(x[0]));
      if (seq.length > line.length && line.every((x, k) => x === seq[k])) cands.push(seq[line.length]);
    }
  }
  if (!cands.length) return null;
  return E.moveFromSAN(s, pick(cands));
}

function chooseComputerMove(s) {
  const lvl = game.level;
  if (lvl >= 2 && Math.random() < 0.85) {
    const bm = bookMove(s);
    if (bm) return bm;
  }
  if (lvl === 1) {
    const res = E.analyzeAll(s, 1);
    if (!res.length) return null;
    if (res[0].score > E.MATE - 100 && Math.random() < 0.5) return res[0].move;
    if (Math.random() < 0.2) return pick(res.slice(0, Math.max(1, Math.ceil(res.length / 2)))).move;
    return pick(res.filter(r => r.score >= res[0].score - 120)).move;
  }
  if (lvl === 2) {
    const res = E.analyzeAll(s, 2);
    if (!res.length) return null;
    return pick(res.filter(r => r.score >= res[0].score - 25)).move;
  }
  if (game.sans.length < 16) {
    // Früh in der Partie: unter fast gleich guten Zügen zufällig wählen, damit nicht jede Partie gleich läuft
    const top = E.analyzeAll(s, 2).slice(0, 4).map(r => ({ m: r.move, sc: E.scoreMove(s, r.move, 3) }));
    top.sort((a, b) => b.sc - a.sc);
    if (top.length) return pick(top.filter(x => x.sc >= top[0].sc - 20)).m;
  }
  const r = E.bestMove(s, lvl === 3 ? 3 : 4);
  return r ? r.move : null;
}

// ---------- Zug-Erklärungen ----------
const sqWord = sq => E.sqName(sq);
const fmtScore = v => {
  if (v > E.MATE - 100) return 'Matt';
  if (v < -E.MATE + 100) return 'wird matt';
  const p = v / 100;
  return (p > 0 ? '+' : p < 0 ? '−' : '±') + Math.abs(p).toFixed(1);
};

// Steht die Figur auf `sq` in Gefahr (ungedeckt oder von einer billigeren Figur angegriffen)?
function isHanging(s, sq) {
  const p = s.board[sq];
  if (!p || E.typeOf(p) === 'k') return false;
  const owner = E.colorOf(p), enemy = E.other(owner);
  const att = E.attackers(s.board, sq, enemy);
  if (!att.length) return false;
  if (!E.attackers(s.board, sq, owner).length) return true;
  return Math.min(...att.map(a => E.VALUE[E.typeOf(s.board[a])] || 0)) < E.VALUE[E.typeOf(p)];
}

function matesInOne(s) {
  return E.legalMoves(s).filter(x => {
    const n = E.makeMove(s, x);
    return E.inCheck(n, n.turn) && !E.legalMoves(n).length;
  });
}

// Liefert Gründe (Satzteile), was ein Zug bewirkt. Subjekt: „Der Zug …“
function explainMove(s, m) {
  const R = [];
  const me = s.turn, opp = E.other(me), t = E.typeOf(m.piece);
  const ns = E.makeMove(s, m);
  const oppMoves = E.legalMoves(ns);
  const check = E.inCheck(ns, opp);
  if (check && !oppMoves.length) return ['setzt Matt!'];
  if (!check && !oppMoves.length) return ['führt zum Patt (Remis)!'];
  if (m.flag === 'K' || m.flag === 'Q') R.push('bringt den König mit der Rochade in Sicherheit und holt den Turm ins Spiel');
  if (m.promo) R.push(`wandelt den Bauern in ${NAME_THEIR[E.typeOf(m.promo)]} um`);
  if (m.captured) {
    const ct = E.typeOf(m.captured);
    const defended = m.flag !== 'ep' && E.attackers(s.board, m.to, opp).length > 0;
    if (!defended) R.push(`schlägt ${NAME_THEIR[ct]} auf ${sqWord(m.to)} – ${ct === 'q' ? 'die' : 'der'} war ungedeckt, also reiner Materialgewinn`);
    else if (E.VALUE[ct] > E.VALUE[t]) R.push(`schlägt ${NAME_THEIR[ct]} (Wert ${E.VALUE[ct] / 100}) mit einer billigeren Figur (Wert ${E.VALUE[t] / 100}) – ein guter Tausch`);
    else R.push(`schlägt ${NAME_THEIR[ct]} auf ${sqWord(m.to)} (Abtausch)`);
  }
  if (check) R.push(oppMoves.length <= 2 ? 'gibt Schach – der Gegner hat fast keine Züge mehr' : 'gibt Schach');
  // Neue Angriffe der gezogenen Figur
  const targets = E.attacksFrom(ns, m.to).filter(sq => {
    const tt = E.typeOf(ns.board[sq]);
    return tt === 'k' || E.VALUE[tt] > E.VALUE[t] || !E.attackers(ns.board, sq, opp).length;
  });
  const tName = sq => (E.typeOf(ns.board[sq]) === 'k' ? 'den König' : `${NAME_THEIR[E.typeOf(ns.board[sq])]} auf ${sqWord(sq)}`);
  if (targets.length >= 2) R.push(`greift gleichzeitig ${targets.map(tName).join(' und ')} an – eine Gabel!`);
  else if (targets.length === 1 && E.typeOf(ns.board[targets[0]]) !== 'k') R.push(`greift ${tName(targets[0])} an`);
  // Rettet oder deckt eigene Figuren
  const dangerBefore = threatSquares(s, me).danger, dangerAfter = threatSquares(ns, me).danger;
  if (dangerBefore.includes(m.from) && !dangerAfter.includes(m.to)) R.push(`bringt ${NAME_THEIR[t]} aus der Gefahr`);
  const saved = dangerBefore.filter(sq => sq !== m.from && sq !== m.to && ns.board[sq] === s.board[sq] && !dangerAfter.includes(sq));
  if (saved.length) R.push(`schützt ${NAME_THEIR[E.typeOf(s.board[saved[0]])]} auf ${sqWord(saved[0])}`);
  // Mattdrohung
  if (!check && matesInOne({ ...ns, turn: me, ep: -1 }).length) R.push('droht im nächsten Zug Matt!');
  // Ruhige Züge
  if (!R.length) {
    const backRank = me === 'w' ? m.from >= 56 : m.from < 8;
    if ((t === 'n' || t === 'b') && backRank) R.push('entwickelt eine Figur – sie kommt aktiv ins Spiel');
    else if (t === 'p' && [27, 28, 35, 36].includes(m.to)) R.push('besetzt das Zentrum und nimmt dem Gegner wichtige Felder');
    else if (t === 'p' && E.isPassed(ns.board, m.to, me)) R.push('schiebt einen Freibauern Richtung Umwandlung');
    else if (t === 'r' && !ns.board.some((p, i) => i % 8 === m.to % 8 && p && E.typeOf(p) === 'p')) R.push('stellt den Turm auf eine offene Linie');
    else if (t === 'k') R.push('bewegt den König');
    else R.push('verbessert die Stellung');
  }
  // Warnung: steht die gezogene Figur jetzt ungeschützt?
  if (!m.promo && isHanging(ns, m.to) && !(m.captured && E.VALUE[E.typeOf(m.captured)] >= E.VALUE[t])) {
    R.push(`aber Vorsicht: ${NAME_THEIR[t]} steht auf ${sqWord(m.to)} nicht sicher`);
  }
  return R;
}

const joinReasons = r => { r = r.map(x => x.replace(/!$/, '')); return r.length > 1 ? r.slice(0, -1).join(', ') + ' und ' + r[r.length - 1] : r[0] || ''; };

// Was droht die Seite `color`, wenn sie noch einmal ziehen dürfte?
function describeThreat(s, color) {
  const th = E.threatOf(s, color, 2);
  if (!th || !th.move) return null;
  const mate = th.score > E.MATE - 100;
  if (!mate && th.gain < 150) return null;
  const san = de(E.toSAN(th.state, th.move));
  return { san, move: th.move, mate, text: mate ? `${san} mit Matt` : `${san} – ${joinReasons(explainMove(th.state, th.move).slice(0, 2))}` };
}

function coachFeedback(before, m, prevMoves) {
  const me = before.turn;
  const legal = E.legalMoves(before);
  const san = E.toSAN(before, m, legal);
  const after = E.makeMove(before, m);
  const parts = [];

  if (!E.legalMoves(after).length) {
    if (E.inCheck(after, after.turn)) return '<p class="good">♛ Schachmatt! Du hast gewonnen – großartig!</p>';
    return '<p class="warn">Patt! Der Gegner hat keinen Zug, steht aber nicht im Schach – das ist ein Remis.</p>';
  }

  const best = E.bestMove(before, 3);
  const myScore = sameMove(best.move, m) ? best.score : E.scoreMove(before, m, 3);
  const loss = best.score - myScore;
  const bestSan = de(E.toSAN(before, best.move, legal));
  let quality;
  if (sameMove(best.move, m) || loss <= 15) quality = 'best';
  else if (loss <= 50) quality = 'good';
  else if (loss <= 130) quality = 'inaccurate';
  else if (loss <= 300) quality = 'mistake';
  else quality = 'blunder';
  const book = mode === 'play' && quality !== 'best' && isBookLine(game.sans);
  if (book) quality = 'book';
  game.lastQuality = quality;

  const mineWhy = joinReasons(explainMove(before, m));
  const bestWhy = joinReasons(explainMove(before, best.move));
  let problem = '';
  if (quality === 'mistake' || quality === 'blunder' || quality === 'inaccurate') {
    const reply = E.bestMove(after, 3);
    if (reply && reply.move) {
      const rsan = de(E.toSAN(after, reply.move));
      problem = reply.score > E.MATE - 100
        ? `Der Gegner kann jetzt mit <b>${rsan}</b> Matt setzen!`
        : `Die beste Antwort des Gegners ist <b>${rsan}</b>: Der Zug ${joinReasons(explainMove(after, reply.move).slice(0, 2))}.`;
    }
  }

  const praise = ['Sehr gut!', 'Stark!', 'Top-Zug!', 'Genau richtig!', 'Prima!'];
  const evalLine = `<p class="small">Bewertung für dich: ${fmtScore(best.score)} möglich, nach deinem Zug ${fmtScore(myScore)}${loss > 15 ? ` (Verlust ${(loss / 100).toFixed(1)} Bauern)` : ''}.</p>`;
  if (quality === 'book') parts.push(`<p class="good">📖 ${de(san)} – Theoriezug!</p><p>Genau so spielt man das in der <b>${openingNameFor(game.sans) || 'Eröffnung'}</b>. Dein Zug ${mineWhy}.</p>`);
  else if (quality === 'best') parts.push(`<p class="good">⭐ ${de(san)} – ${pick(praise)} Das ist der beste Zug.</p><p>Dein Zug ${mineWhy}.</p>`);
  else if (quality === 'good') parts.push(`<p class="good">👍 ${de(san)} – Guter Zug.</p><p>Dein Zug ${mineWhy}. Noch etwas besser war <b>${bestSan}</b> (${bestWhy}).</p>`);
  else if (quality === 'inaccurate') parts.push(`<p class="warn">🤔 ${de(san)} – Etwas ungenau.</p><p>${problem}</p><p>Besser war <b>${bestSan}</b>: Der Zug ${bestWhy}.</p>`);
  else if (quality === 'mistake') parts.push(`<p class="warn">❗ ${de(san)} – Ein Fehler.</p><p>${problem}</p><p>Besser war <b>${bestSan}</b>: Der Zug ${bestWhy}.</p>`);
  else parts.push(`<p class="bad">❌ ${de(san)} – Grober Fehler!</p><p>${problem}</p><p>Besser war <b>${bestSan}</b>: Der Zug ${bestWhy}.</p><p class="small">Tipp: Mit „↶ Zurück“ kannst du den Zug zurücknehmen.</p>`);
  parts.push(evalLine);

  if (quality === 'best' || quality === 'good' || quality === 'inaccurate' || quality === 'book') {
    const tip = principleTip(before, m, prevMoves, me);
    if (tip) parts.push(`<p class="small">💬 ${tip}</p>`);
  }

  const name = openingNameFor(game.sans);
  if (name && name !== game.lastOpening) {
    game.lastOpening = name;
    $('openingName').textContent = name;
    parts.push(`<p class="small">📖 Eröffnung: <b>${name}</b></p>`);
  }
  return parts.join('');
}

// Allgemeine Schach-Prinzipien zum gespielten Zug
function principleTip(before, m, prevMoves, me) {
  const t = E.typeOf(m.piece);
  const moveNo = before.full;
  const file = m.to % 8, rank = 8 - (m.to >> 3);
  if (m.flag === 'K' || m.flag === 'Q') return 'Rochade! Dein König steht jetzt sicherer und dein Turm kommt ins Spiel.';
  if (m.captured && E.VALUE[E.typeOf(m.captured)] > E.VALUE[t]) return `Du hast eine wertvollere Figur geschlagen (${NAME[E.typeOf(m.captured)]} für ${NAME[t]}). Sehr gut!`;
  if (moveNo <= 3 && t === 'p' && (file === 3 || file === 4) && (rank === 4 || rank === 5)) return 'Gut: Ein Bauer im Zentrum kontrolliert wichtige Felder.';
  if (moveNo <= 5 && t === 'q' && !m.captured) return 'Vorsicht mit der Dame so früh – gegnerische Figuren können sie mit Tempo angreifen.';
  if (moveNo <= 10 && t === 'n' && (file === 0 || file === 7)) return '„Ein Springer am Rand ist eine Schand’“ – vom Rand aus kontrolliert er weniger Felder.';
  if (moveNo <= 8 && (t === 'n' || t === 'b') && !m.captured) {
    const myPrev = prevMoves.filter((x, k) => E.colorOf(x.piece) === me);
    if (myPrev.some(x => x.to === m.from)) return 'Tipp: In der Eröffnung möglichst jede Figur nur einmal ziehen und erst alle entwickeln.';
    return 'Gute Entwicklung – Figur ins Spiel gebracht.';
  }
  if (moveNo <= 8 && t === 'p' && m.from % 8 === 5) return 'Achtung: Der f-Bauer schützt deinen König. Ihn früh zu ziehen kann gefährlich sein.';
  const castleRights = me === 'w' ? (before.castling.K || before.castling.Q) : (before.castling.k || before.castling.q);
  if (moveNo >= 9 && moveNo <= 14 && castleRights && t !== 'k') return 'Denk an die Rochade – dein König steht noch in der Mitte.';
  return '';
}

function checkGameOver() {
  const s = curState();
  const legal = E.legalMoves(s);
  let msg = null, toast = null;
  const side = c => (c === 'w' ? 'Weiß' : 'Schwarz');
  if (!legal.length) {
    if (E.inCheck(s, s.turn)) {
      if (twoPlayer()) { msg = `<p class="good">♛ Schachmatt! ${side(E.other(s.turn))} gewinnt.</p>`; toast = 'Schachmatt!'; }
      else if (s.turn === game.player) { msg = '<p class="bad">Schachmatt – der Computer hat gewonnen.</p><p class="small">Nicht schlimm! Nimm Züge zurück und schau im Tab „Züge“, wo die roten Markierungen sind – dort ging es schief.</p>'; toast = 'Verloren'; }
      else { msg = '<p class="good">♛ Schachmatt! Du hast gewonnen – großartig!</p>'; toast = '🏆 Gewonnen!'; }
    } else { msg = '<p class="warn">Patt – Remis! Wer am Zug ist, hat keinen legalen Zug, steht aber nicht im Schach.</p>'; toast = 'Patt – Remis'; }
  } else if (E.insufficientMaterial(s.board)) { msg = '<p class="warn">Remis – niemand hat mehr genug Material, um Matt zu setzen.</p>'; toast = 'Remis'; }
  else if (s.half >= 100) { msg = '<p class="warn">Remis durch die 50-Züge-Regel.</p>'; toast = 'Remis'; }
  else {
    const key = E.positionKey(s);
    if (game.states.filter(x => E.positionKey(x) === key).length >= 3) { msg = '<p class="warn">Remis durch dreifache Stellungswiederholung.</p>'; toast = 'Remis'; }
  }
  if (msg) {
    game.over = true;
    const q = game.quals.filter(Boolean);
    const cnt = k => q.filter(x => x === k).length;
    const summary = q.length ? `<p class="small">Deine Partie: ${cnt('best')}× ★ bester Zug, ${cnt('good')}× ✓ gut, ${cnt('inaccurate')}× ungenau, ${cnt('mistake')}× Fehler, ${cnt('blunder')}× grober Fehler.</p>` : '';
    appendCoach(msg + summary + '<p class="small">Mit „＋ Neu“ startest du ein neues Spiel.</p>');
    if (toast) showToast(toast, 2200);
    render();
    updatePlayUI();
    return true;
  }
  return false;
}

function setStatus(text, thinking, mine) {
  const el = $('status');
  el.textContent = text;
  el.classList.toggle('thinking', !!thinking);
  el.classList.toggle('mine', !!mine);
}

function updatePlayUI() {
  const s = curState();
  const side = s.turn === 'w' ? 'Weiß' : 'Schwarz';
  if (game.over) setStatus('Spiel beendet');
  else if (twoPlayer()) setStatus(`${side} ist am Zug${E.inCheck(s, s.turn) ? ' – Schach!' : ''}`, false, true);
  else if (s.turn === game.player) setStatus(E.inCheck(s, s.turn) ? 'Du bist am Zug – Schach!' : 'Du bist am Zug', false, true);
  else setStatus('Computer denkt nach', true);

  // Zugliste mit Bewertungssymbolen
  const list = $('moveList');
  let html = '';
  const first = game.states[0];
  let num = first.full;
  if (!game.sans.length) html = '<span></span><span class="small" style="grid-column: span 2">Noch keine Züge.</span>';
  if (first.turn === 'b' && game.sans.length) html += `<span class="n">${num}.</span><span class="mv">…</span>`;
  game.sans.forEach((san, k) => {
    const white = (first.turn === 'w') === (k % 2 === 0);
    if (white) html += `<span class="n">${num}.</span>`;
    const q = game.quals[k] && QBADGE[game.quals[k]];
    const badge = q ? `<span class="q ${q[0]}">${q[1]}</span>` : '';
    html += `<span class="mv ${k === game.sans.length - 1 ? 'cur' : ''}">${de(san)}${badge}</span>`;
    if (!white) num++;
  });
  list.innerHTML = html;
  list.parentElement.scrollTop = list.parentElement.scrollHeight;

  $('undoBtn').disabled = game.moves.length === 0 || ui.busy;
  $('hintBtn').disabled = game.over || !playContext().canMove();
  updateEval();
}

function updateEval() {
  const s = curState();
  let white;
  if (game.over) {
    const legal = E.legalMoves(s);
    white = !legal.length && E.inCheck(s, s.turn) ? (s.turn === 'w' ? -E.MATE : E.MATE) : 0;
  } else {
    const r = E.bestMove(s, 2);
    white = r ? (s.turn === 'w' ? r.score : -r.score) : 0;
  }
  const pct = Math.max(3, Math.min(97, 50 + 50 * Math.tanh(white / 600)));
  $('evalFill').style.height = pct + '%';
  $('evalV').classList.toggle('flipped', ui.orientation === 'b');
  const mate = Math.abs(white) > E.MATE - 100;
  $('evalNum').textContent = mate ? 'M' : (Math.abs(white) / 100).toFixed(1);
  $('evalNum').style.color = white >= 0 ? '#403d39' : '#f4f2ec';
  $('evalNum').style.bottom = white >= 0 ? '2px' : 'auto';
  $('evalNum').style.top = white >= 0 ? 'auto' : '2px';
  let txt;
  if (mate) txt = white > 0 ? 'Weiß setzt bald matt' : 'Schwarz setzt bald matt';
  else if (Math.abs(white) < 60) txt = 'Die Stellung ist ausgeglichen';
  else {
    const v = Math.abs(white);
    txt = `${white > 0 ? 'Weiß' : 'Schwarz'} ${v < 150 ? 'steht etwas besser' : v < 400 ? 'steht besser' : 'steht klar besser'} (${(white > 0 ? '+' : '−') + (v / 100).toFixed(1)})`;
  }
  $('evalText').textContent = '📊 ' + txt;
}

function undo() {
  if (!game.moves.length || ui.busy) return;
  const pop = () => { game.states.pop(); game.moves.pop(); game.sans.pop(); game.quals.pop(); };
  if (twoPlayer()) pop();
  else {
    do { pop(); } while (game.moves.length && curState().turn !== game.player);
  }
  game.over = false; game.hintStep = 0;
  game.lastOpening = openingNameFor(game.sans);
  $('openingName').textContent = game.lastOpening || '';
  ui.selected = -1; ui.targets = []; ui.arrows = []; ui.hintFrom = -1;
  if (!twoPlayer() && curState().turn !== game.player) {
    render(); updatePlayUI();
    later(computerMove, 300);
    return;
  }
  setCoach('<p>Zug zurückgenommen. Versuch es noch einmal – denk daran: Was kann der Gegner nach deinem Zug machen?</p>');
  render(); updatePlayUI();
}

function hint() {
  if (game.over || ui.busy || !playContext().canMove()) return;
  const s = curState();
  setStatus('Trainer sucht einen guten Zug', true);
  ui.busy = true;
  showSub('coach');
  later(() => {
    const r = E.bestMove(s, 3);
    ui.busy = false;
    updatePlayUI();
    if (!r) return;
    const m = r.move;
    const t = E.typeOf(m.piece);
    if (game.hintStep === 0) {
      ui.hintFrom = m.from; ui.arrows = [];
      game.hintStep = 1;
      let txt = `Schau dir ${t === 'q' ? 'die' : 'den'} <b>${NAME[t]}</b> auf ${E.sqName(m.from)} an (orange markiert). Wohin könnte ${t === 'q' ? 'sie' : 'er'} ziehen?`;
      if (r.score > E.MATE - 100) txt = 'Hier gibt es ein Matt! ' + txt;
      appendCoach(`<p>💡 ${txt} <span class="small">Drück nochmal auf Tipp für die Lösung.</span></p>`);
    } else {
      ui.hintFrom = -1; ui.arrows = [{ from: m.from, to: m.to }];
      const san = de(E.toSAN(s, m));
      const ns = E.makeMove(s, m);
      const why = r.score > E.MATE - 100 && !(E.inCheck(ns, ns.turn) && !E.legalMoves(ns).length)
        ? 'Er führt zu einem erzwungenen Matt!' : `Der Zug ${joinReasons(explainMove(s, m))}.`;
      appendCoach(`<p>💡 Mein Vorschlag: <b>${san}</b>. ${why} <span class="small">(Bewertung ${fmtScore(r.score)})</span></p>`);
    }
    render();
  }, 30);
}

function showSub(name) {
  document.querySelectorAll('.subtabs button').forEach(b => b.classList.toggle('active', b.dataset.sub === name));
  for (const n of ['coach', 'moves', 'ask']) $('sub-' + n).hidden = n !== name;
  if (name === 'ask') setTimeout(() => $('askInput').focus(), 50);
}

// ===================== Eröffnungen (mit Varianten) =====================
const lesson = { o: null, idx: 0, states: [], moves: [], sans: [], texts: [], timer: null, done: false, filter: 'all', fixed: null, varName: null };

function openingLines(o) {
  if (o._lines) return o._lines;
  const L = [{ name: 'Hauptvariante', moves: o.moves }];
  for (const v of (typeof OPENING_VARS !== 'undefined' && OPENING_VARS[o.id]) || []) {
    L.push({ name: v.name, at: v.at, moves: o.moves.slice(0, v.at).concat(v.moves) });
  }
  o._lines = L;
  return L;
}

function candidateLines() {
  const played = lesson.sans.map(E.cleanSAN);
  const all = openingLines(lesson.o);
  const pool = lesson.fixed !== null ? [all[lesson.fixed]] : all;
  return pool.filter(l => l.moves.length >= played.length && played.every((x, k) => E.cleanSAN(l.moves[k][0]) === x));
}

function renderOpeningList() {
  const list = $('openingList');
  list.innerHTML = '';
  for (const o of OPENINGS) {
    if (lesson.filter !== 'all' && o.side !== lesson.filter) continue;
    const n = openingLines(o).length;
    const btn = document.createElement('button');
    btn.className = 'card';
    const preview = de(o.moves.slice(0, 4).map((m, k) => (k % 2 ? '' : (k / 2 + 1) + '.') + m[0]).join(' '));
    btn.innerHTML = `<span class="ci ${o.side}">${GLYPH.k}${VS}</span>
      <span class="cb"><span class="t">${o.name}</span><span class="s">${n} Varianten · ${preview} …</span></span>
      <span class="badge">${o.level}</span>`;
    btn.onclick = () => startLesson(o, null);
    list.appendChild(btn);
  }
}

function renderVarChips() {
  const box = $('olVars');
  const lines = openingLines(lesson.o);
  box.innerHTML = '';
  const mk = (label, val) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = lesson.fixed === val ? 'on' : '';
    b.onclick = () => startLesson(lesson.o, val);
    box.appendChild(b);
  };
  mk('🎲 Zufall', null);
  lines.forEach((l, k) => mk(l.name, k));
}

function startLesson(o, fixed) {
  clearTimeout(lesson.timer);
  Object.assign(lesson, { o, idx: 0, states: [E.parseFEN(E.START_FEN)], moves: [], sans: [], texts: [], done: false, fixed: fixed === undefined ? null : fixed, varName: null });
  $('openingListView').hidden = true;
  $('openingLesson').hidden = false;
  $('olTitle').textContent = o.name;
  $('olSide').textContent = `Du spielst ${o.side === 'w' ? 'Weiß' : 'Schwarz'} · ${o.level}`;
  $('olIntro').textContent = o.intro;
  $('olPlay').hidden = true;
  $('olHint').disabled = false;
  renderVarChips();
  ui.orientation = o.side;
  setContext({
    get state() { return lesson.states[lesson.states.length - 1]; },
    get lastMove() { return lesson.moves[lesson.moves.length - 1] || null; },
    me: o.side,
    players: { [o.side]: { name: 'Du' }, [E.other(o.side)]: { name: 'Gegner' } },
    showThreats: () => false,
    canMove: () => !lesson.done && lessonState().turn === o.side,
    onMove: lessonMove,
  });
  renderSteps();
  lessonAdvance();
  updateAskBox();
}

const lessonState = () => lesson.states[lesson.states.length - 1];

function lessonPlay(m, text) {
  const s = lessonState();
  lesson.sans.push(E.toSAN(s, m));
  lesson.texts.push(text);
  lesson.states.push(E.makeMove(s, m));
  lesson.moves.push(m);
  lesson.idx++;
  ui.arrows = []; ui.hintFrom = -1;
  render();
  renderSteps();
}

// Meldet, sobald klar ist, welche Variante gespielt wird
function variationNote() {
  const c = candidateLines();
  if (c.length === 1 && c[0].name !== lesson.varName && (c[0].at !== undefined || lesson.fixed !== null || openingLines(lesson.o).length > 1)) {
    lesson.varName = c[0].name;
    $('olSide').textContent = `Du spielst ${lesson.o.side === 'w' ? 'Weiß' : 'Schwarz'} · ${c[0].name}`;
    return `<p class="small">📚 Variante: <b>${c[0].name}</b></p>`;
  }
  return '';
}

function lessonAdvance() {
  const o = lesson.o;
  const cands = candidateLines();
  const finished = cands.find(l => l.moves.length === lesson.idx);
  if (finished || !cands.length) {
    lesson.done = true;
    const line = finished || openingLines(o)[0];
    $('olMsg').innerHTML = `<p class="good">🎉 Geschafft! ${o.name} – ${line.name}.</p><p>${o.summary}</p>
      <p class="small">Drück „↺ Nochmal“ – dann spielt der Gegner vielleicht eine andere Variante. Oder wähle oben eine bestimmte aus.</p>`;
    $('olPlay').hidden = false;
    $('olHint').disabled = true;
    showToast('🎉 Lektion geschafft!', 1600);
    return;
  }
  const s = lessonState();
  if (s.turn !== o.side) {
    const line = pick(cands);
    const [san, text] = line.moves[lesson.idx];
    lesson.timer = setTimeout(() => {
      const m = E.moveFromSAN(s, san);
      lessonPlay(m, text);
      const note = variationNote();
      const more = candidateLines().some(l => l.moves.length > lesson.idx);
      $('olMsg').innerHTML = `<p>Gegner spielt <b>${de(san)}</b>: ${text}</p>${note}` +
        (more ? `<p class="small">Jetzt du! ${o.side === 'b' ? 'Wie reagiert Schwarz hier?' : 'Finde den nächsten Zug.'}</p>` : '');
      lessonAdvance();
    }, lesson.idx === 0 ? 600 : 900);
  } else if (lesson.idx === 0) {
    $('olMsg').innerHTML = '<p>Du fängst an! Welcher Zug eröffnet diese Partie? Drück auf „💡 Zug zeigen“, wenn du es nicht weißt.</p>';
  }
}

function lessonMove(m) {
  const s = lessonState();
  const cands = candidateLines();
  const legal = E.legalMoves(s);
  const mySan = E.cleanSAN(E.toSAN(s, m, legal));
  const match = cands.find(l => E.cleanSAN(l.moves[lesson.idx][0]) === mySan);
  if (match) {
    const [san, text] = match.moves[lesson.idx];
    lessonPlay(m, text);
    $('olMsg').innerHTML = `<p class="good">✅ Richtig: ${de(san)}</p><p>${text}</p>${variationNote()}`;
    lessonAdvance();
    return;
  }
  shakeBoard();
  const expected = E.moveFromSAN(s, cands[0].moves[lesson.idx][0]);
  const t = E.typeOf(expected.piece);
  const sc = E.scoreMove(s, m, 2), se = E.scoreMove(s, expected, 2);
  const okish = sc >= se - 40;
  $('olMsg').innerHTML = `<p class="warn">Nicht ganz. ${de(E.toSAN(s, m))} ${okish ? 'ist spielbar, aber in dieser Eröffnung spielt man hier etwas anderes.' : 'ist hier nicht gut: Der Zug ' + joinReasons(explainMove(s, m).slice(0, 2)) + '.'}</p>
    <p class="small">Kleiner Hinweis: Ziehe ${t === 'q' ? 'die' : 'den'} <b>${NAME[t]}</b>.</p>`;
  ui.hintFrom = expected.from;
  render();
}

function lessonHintMove() {
  const s = lessonState();
  const c = candidateLines();
  return c.length ? E.moveFromSAN(s, c[0].moves[lesson.idx][0]) : null;
}

function renderSteps() {
  const o = lesson.o;
  const ol = $('olSteps');
  ol.innerHTML = '';
  const maxLen = Math.max(lesson.idx, ...candidateLines().map(l => l.moves.length));
  $('olProg').style.width = (100 * lesson.idx / Math.max(1, maxLen)) + '%';
  for (let k = 0; k < lesson.idx; k++) {
    const li = document.createElement('li');
    const num = Math.floor(k / 2) + 1;
    if ((k % 2 === 0) === (o.side === 'w')) li.className = 'mine';
    li.innerHTML = `<b>${k % 2 ? num + '…' : num + '.'} ${de(lesson.sans[k])}</b> – ${lesson.texts[k]}`;
    ol.appendChild(li);
  }
}

// ===================== Rätsel & Training =====================
const BASE_RATING = { Leicht: 700, Mittel: 1150, Schwer: 1550 };
const ALL_PUZZLES = PUZZLES.map(p => ({ ...p, key: p.title, rating: p.rating || BASE_RATING[p.level] }))
  .concat((typeof GEN_PUZZLES !== 'undefined' ? GEN_PUZZLES : []).map((g, k) => ({ ...g, gen: true, key: 'g' + k, num: k + 1 })));

const puzzle = { idx: 0, state: null, lastMove: null, solved: false, tries: 0, step: 0, filter: 'all', hintShown: false, training: false, rated: false, helped: false };

function loadSolved() {
  try { return JSON.parse(localStorage.getItem('schach-solved') || '[]'); } catch (e) { return []; }
}
function saveSolved(list) {
  try { localStorage.setItem('schach-solved', JSON.stringify(list)); } catch (e) { /* egal */ }
}
const trainer = { r: 800, streak: 0, best: 0 };
try { Object.assign(trainer, JSON.parse(localStorage.getItem('schach-training') || '{}')); } catch (e) { /* egal */ }
function saveTrainer() { try { localStorage.setItem('schach-training', JSON.stringify(trainer)); } catch (e) { /* egal */ } }

const isMateState = s => E.inCheck(s, s.turn) && !E.legalMoves(s).length;
const visiblePuzzles = () => ALL_PUZZLES.map((p, k) => k).filter(k => puzzle.filter === 'all' || ALL_PUZZLES[k].level === puzzle.filter);

// Titel, Ziel, Hinweis und Erklärung – bei generierten Rätseln automatisch aus der Lösung abgeleitet
function puzzleMeta(p) {
  if (p._meta) return p._meta;
  if (!p.gen) return (p._meta = { title: p.title, goal: p.goal, hint: p.hint, explain: p.explain, motif: p.title });
  const s = E.parseFEN(p.fen);
  const m = E.moveFromSAN(s, p.sol[0]);
  const side = s.turn === 'w' ? 'Weiß' : 'Schwarz';
  const t = E.typeOf(m.piece);
  const ns = E.makeMove(s, m);
  const check = E.inCheck(ns, ns.turn);
  const reasons = explainMove(s, m);
  const sacrifice = (m.captured && E.VALUE[E.typeOf(m.captured)] + 100 < E.VALUE[t]) || (!m.captured && t !== 'p' && t !== 'k' && isHanging(ns, m.to));
  let motif;
  if (p.mate) motif = sacrifice ? `Matt in ${p.mate} mit Opfer` : `Matt in ${p.mate}`;
  else if (reasons.some(r => r.includes('Gabel'))) motif = 'Gabel';
  else if (sacrifice) motif = 'Opfer';
  else if (!m.captured && !check) motif = 'Stiller Zug';
  else if (check) motif = 'Schach mit Folgen';
  else motif = 'Kombination';
  const HINTS = {
    Gabel: 'Suche einen Zug, der zwei Dinge gleichzeitig angreift.',
    Opfer: 'Hab keine Angst, etwas zu opfern – danach gewinnst du mehr zurück.',
    'Stiller Zug': 'Kein Schach und kein Schlagzug: Ein ruhiger Zug schafft eine Drohung, gegen die es keine Verteidigung gibt.',
    'Schach mit Folgen': 'Beginne mit einem Schachgebot – danach hat der Gegner keine Zeit, sich zu verteidigen.',
    Kombination: 'Prüfe alle Schlagzüge und rechne aus, was danach passiert.',
  };
  const base = p.mate ? 'Prüfe zuerst alle Schachgebote – auch die, bei denen du etwas opferst.' : HINTS[motif];
  return (p._meta = {
    title: `#${p.num} · ${motif}`,
    motif,
    goal: p.mate ? `${side} setzt Matt in ${p.mate} Zügen.` : `${side} zieht und gewinnt Material.`,
    hint: `${base} Der erste Zug wird mit ${t === 'q' ? 'der' : 'dem'} ${NAME[t] === 'Dame' ? 'Dame' : NAME[t]} gespielt.`,
    explain: `Lösung: ${p.sol.map(de).join(' … ')}. Der erste Zug ${joinReasons(reasons)}.`,
  });
}

function renderPuzzleList() {
  const solved = loadSolved();
  const list = $('puzzleList');
  list.innerHTML = '';
  $('pzProgress').textContent = `${ALL_PUZZLES.filter(p => solved.includes(p.key)).length} von ${ALL_PUZZLES.length} gelöst`;
  $('trRating').textContent = Math.round(trainer.r);
  $('trStreak').textContent = trainer.streak ? `🔥 ${trainer.streak} in Folge` : `Rekord: ${trainer.best}`;
  const vis = visiblePuzzles();
  for (const k of vis.slice(0, puzzle.shown || 40)) {
    const p = ALL_PUZZLES[k];
    const meta = puzzleMeta(p);
    const turn = p.fen.split(' ')[1];
    const done = solved.includes(p.key);
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.innerHTML = `<span class="ci ${turn}">${GLYPH.k}${VS}</span>
      <span class="cb"><span class="t">${meta.title} <span class="rt">${p.rating}</span></span><span class="s">${meta.goal}</span></span>
      <span class="badge ${done ? 'done' : p.level}">${done ? '✓ gelöst' : p.level}</span>`;
    btn.onclick = () => { puzzle.training = false; startPuzzle(k); };
    list.appendChild(btn);
  }
  if (vis.length > (puzzle.shown || 40)) {
    const more = document.createElement('button');
    more.className = 'more';
    more.textContent = `Weitere Rätsel anzeigen (${vis.length - (puzzle.shown || 40)} übrig)`;
    more.onclick = () => { puzzle.shown = (puzzle.shown || 40) + 40; renderPuzzleList(); };
    list.appendChild(more);
  }
}

// Training: ein ungelöstes Rätsel passend zur eigenen Wertung
function nextTrainingPuzzle() {
  const solved = loadSolved();
  let pool = ALL_PUZZLES.map((p, k) => k).filter(k => !solved.includes(ALL_PUZZLES[k].key) && k !== puzzle.idx);
  if (!pool.length) pool = ALL_PUZZLES.map((p, k) => k).filter(k => k !== puzzle.idx);
  pool.sort((a, b) => Math.abs(ALL_PUZZLES[a].rating - trainer.r) - Math.abs(ALL_PUZZLES[b].rating - trainer.r));
  puzzle.training = true;
  startPuzzle(pick(pool.slice(0, 6)));
}

function ratePuzzle(won) {
  if (!puzzle.training || puzzle.rated) return '';
  puzzle.rated = true;
  const pr = ALL_PUZZLES[puzzle.idx].rating;
  const exp = 1 / (1 + Math.pow(10, (pr - trainer.r) / 400));
  const delta = Math.round(28 * ((won ? 1 : 0) - exp));
  trainer.r = Math.max(100, trainer.r + delta);
  trainer.streak = won ? trainer.streak + 1 : 0;
  trainer.best = Math.max(trainer.best, trainer.streak);
  saveTrainer();
  $('pzRatingNow').textContent = `Wertung ${Math.round(trainer.r)} (${delta >= 0 ? '+' : ''}${delta})${trainer.streak > 1 ? ` · 🔥 ${trainer.streak}` : ''}`;
  return delta;
}

function startPuzzle(k) {
  const p = ALL_PUZZLES[k];
  const meta = puzzleMeta(p);
  Object.assign(puzzle, { idx: k, state: E.parseFEN(p.fen), lastMove: null, solved: false, tries: 0, step: 0, hintShown: false, rated: false, helped: false });
  const me = puzzle.state.turn;
  puzzle.me = me;
  $('puzzleListView').hidden = true;
  $('puzzleView').hidden = false;
  $('pzTitle').textContent = meta.title;
  $('pzLevel').textContent = `${p.level} · ${p.rating}`;
  $('pzLevel').className = 'badge ' + p.level;
  $('pzRatingNow').textContent = puzzle.training ? `🎯 Training · deine Wertung ${Math.round(trainer.r)}${trainer.streak ? ` · 🔥 ${trainer.streak}` : ''}` : '';
  $('pzTurn').className = 'turnbox ' + me;
  $('pzTurn').innerHTML = `<span class="piece ${me}">${GLYPH.k}${VS}</span><span>${me === 'w' ? 'Weiß' : 'Schwarz'} am Zug<br><span style="font-weight:400">${meta.goal}</span></span>`;
  $('pzMsg').innerHTML = `<p>Nimm dir Zeit. Prüfe zuerst alle <b>Schachgebote</b>, dann alle <b>Schlagzüge</b>, dann <b>Drohungen</b> – für beide Seiten.</p>`;
  ui.orientation = me;
  ui.mark = null;
  setContext({
    get state() { return puzzle.state; },
    get lastMove() { return puzzle.lastMove; },
    me,
    players: { [me]: { name: 'Du' }, [E.other(me)]: { name: 'Gegner' } },
    showThreats: () => false,
    noCaps: true,
    canMove: () => !puzzle.solved && puzzle.state.turn === me,
    onMove: puzzleMove,
  });
  updateAskBox();
}

function expectedPuzzleMove() {
  const p = ALL_PUZZLES[puzzle.idx];
  const san = p.sol[puzzle.step];
  const m = san ? E.moveFromSAN(puzzle.state, san) : null;
  if (m || !san) return m;
  const r = E.bestMove(puzzle.state, 3); // Gegner ist von der gespeicherten Linie abgewichen
  return r && r.move;
}

function puzzleSolution() {
  return expectedPuzzleMove() || (E.bestMove(puzzle.state, 3) || {}).move;
}

function puzzleMove(m) {
  const p = ALL_PUZZLES[puzzle.idx];
  const meta = puzzleMeta(p);
  const s = puzzle.state;
  const after = E.makeMove(s, m);
  const exp = expectedPuzzleMove();
  const mate = isMateState(after);
  let ok = false;
  if (p.mate && mate) ok = true;
  else if (exp && sameMove(m, exp)) ok = true;
  else if (p.mate) {
    const remaining = p.mate - puzzle.step;
    if (remaining === 2) {
      const replies = E.legalMoves(after);
      ok = replies.length > 0 && replies.every(x => matesInOne(E.makeMove(after, x)).length > 0);
    }
  } else if (exp) {
    ok = E.scoreMove(s, m, 3) >= E.scoreMove(s, exp, 3) - 30;
  }

  if (!ok) {
    puzzle.tries++;
    const d = ratePuzzle(false);
    puzzle.state = after; puzzle.lastMove = m;
    ui.mark = { sq: m.to, cls: 'wrong' };
    render();
    const why = joinReasons(explainMove(s, m).slice(0, 2));
    const reply = E.legalMoves(after).length ? E.bestMove(after, 3) : null;
    const refute = reply ? ` Der Gegner würde mit <b>${de(E.toSAN(after, reply.move))}</b> antworten.` : '';
    $('pzMsg').innerHTML = `<p class="bad">✗ ${de(E.toSAN(s, m))} ist nicht die Lösung.${d !== '' ? ` <span class="small">(${d} Wertung)</span>` : ''}</p><p class="small">Der Zug ${why}.${refute} ${p.mate ? 'Es gibt einen Weg zum Matt!' : 'Es gibt etwas Stärkeres!'}</p>${puzzle.tries >= 2 ? `<p class="small">💡 Hinweis: ${meta.hint}</p>` : ''}`;
    ui.busy = true;
    setTimeout(() => {
      ui.busy = false;
      puzzle.state = s; puzzle.lastMove = null; ui.mark = null;
      render();
    }, 1100);
    return;
  }

  puzzle.state = after; puzzle.lastMove = m; puzzle.step++;
  ui.mark = { sq: m.to, cls: 'ok' };
  ui.arrows = []; ui.hintFrom = -1;
  render();
  const done = mate || (!p.mate && puzzle.step >= p.sol.length);
  if (done) {
    puzzle.solved = true;
    const d = ratePuzzle(!puzzle.helped && puzzle.tries === 0);
    $('pzMsg').innerHTML = `<p class="good">🎉 Gelöst${puzzle.tries || puzzle.helped ? '' : ' – beim ersten Versuch'}!${d !== '' ? ` <span class="small">(${d >= 0 ? '+' : ''}${d} Wertung)</span>` : ''}</p><p>${meta.explain}</p>`;
    showToast(mate ? '♛ Schachmatt – gelöst!' : '🎉 Gelöst!', 1500);
    const solved = loadSolved();
    if (!solved.includes(p.key)) { solved.push(p.key); saveSolved(solved); }
    return;
  }
  $('pzMsg').innerHTML = `<p class="good">✓ ${de(E.toSAN(s, m))} – richtig! Weiter so.</p><p class="small">Mal sehen, wie der Gegner antwortet …</p>`;
  ui.busy = true;
  setTimeout(() => {
    const depth = p.mate ? Math.max(2, 2 * (p.mate - puzzle.step)) : 3;
    const r = E.bestMove(puzzle.state, Math.min(depth, 4));
    ui.busy = false;
    if (!r) return;
    const rs = puzzle.state;
    puzzle.state = E.makeMove(rs, r.move);
    puzzle.lastMove = r.move;
    ui.mark = null;
    render();
    const left = p.mate ? p.mate - puzzle.step : 0;
    $('pzMsg').innerHTML = `<p>Gegner spielt <b>${de(E.toSAN(rs, r.move))}</b>.</p><p>Jetzt du! ${left === 1 ? 'Setz Matt!' : left > 1 ? `Noch ${left} Züge bis Matt.` : 'Hol dir den Gewinn!'}</p>`;
  }, 700);
}

// ===================== KI-Trainer (Fragen stellen) =====================
const chat = { sample: null, tools: false, turns: [], ctl: null, busy: false };
let mode = 'play';

const DE_TO_EN = { S: 'N', L: 'B', T: 'R', D: 'Q', K: 'K' };
// Akzeptiert deutsche (Sf3), englische (Nf3) oder Koordinaten-Notation (g1f3, g1-f3)
function parseUserMove(s, text) {
  const raw = String(text || '').trim().replace(/[!?+#]/g, '').replace(/0-0-0/g, 'O-O-O').replace(/0-0/g, 'O-O');
  const legal = E.legalMoves(s);
  const coord = raw.toLowerCase().match(/^([a-h][1-8])\s*[-x ]?\s*([a-h][1-8])\s*=?([qrbnsdlt])?$/);
  if (coord) {
    const from = E.sqIndex(coord[1]), to = E.sqIndex(coord[2]);
    const promoMap = { q: 'q', d: 'q', r: 'r', t: 'r', b: 'b', l: 'b', n: 'n', s: 'n' };
    const pr = coord[3] ? promoMap[coord[3]] : 'q';
    const c = legal.filter(m => m.from === from && m.to === to);
    return c.find(m => !m.promo || E.typeOf(m.promo) === pr) || null;
  }
  const tryOne = san => legal.find(m => E.cleanSAN(E.toSAN(s, m, legal)) === san) || null;
  const en = raw.replace(/^[SLTDK]/, c => DE_TO_EN[c]).replace(/=([SLTD])$/, (x, c) => '=' + DE_TO_EN[c]);
  return tryOne(en) || tryOne(raw) || null;
}

function pieceListing(s) {
  const L = { w: [], b: [] };
  const order = 'kqrbnp';
  const items = [];
  for (let i = 0; i < 64; i++) if (s.board[i]) items.push(i);
  items.sort((a, b) => order.indexOf(E.typeOf(s.board[a])) - order.indexOf(E.typeOf(s.board[b])));
  for (const i of items) {
    const p = s.board[i];
    L[E.colorOf(p)].push(`${NAME[E.typeOf(p)]} ${E.sqName(i)}`);
  }
  return `Weiß: ${L.w.join(', ')}\nSchwarz: ${L.b.join(', ')}`;
}

function moveListText(sans, first) {
  first = first || E.parseFEN(E.START_FEN);
  let out = '', num = first.full;
  sans.forEach((san, k) => {
    const white = (first.turn === 'w') === (k % 2 === 0);
    if (white) out += `${num}. `;
    else if (k === 0) out += `${num}… `;
    out += de(san) + ' ';
    if (!white) num++;
  });
  return out.trim() || '(noch keine Züge)';
}

function engineFacts(s, me) {
  const lines = [];
  const legal = E.legalMoves(s);
  const side = s.turn === 'w' ? 'Weiß' : 'Schwarz';
  lines.push(`Am Zug: ${side}${E.inCheck(s, s.turn) ? ' (steht im SCHACH)' : ''}`);
  if (!legal.length) {
    lines.push(E.inCheck(s, s.turn) ? 'Die Partie ist vorbei: Schachmatt.' : 'Die Partie ist vorbei: Patt.');
    return lines.join('\n');
  }
  const top = E.analyzeAll(s, 2).slice(0, 4).map(r => ({ move: r.move, score: E.scoreMove(s, r.move, 3) }));
  top.sort((a, b) => b.score - a.score);
  const evWhite = s.turn === 'w' ? top[0].score : -top[0].score;
  lines.push(`Engine-Bewertung der Stellung: ${fmtScore(evWhite)} aus Sicht von Weiß (positiv = Weiß besser)`);
  lines.push(`Beste Züge für ${side} laut Engine (Tiefe 3), Bewertung aus Sicht von ${side}:`);
  for (const r of top.slice(0, 3)) {
    lines.push(`- ${de(E.toSAN(s, r.move, legal))} (${E.sqName(r.move.from)}→${E.sqName(r.move.to)}, ${fmtScore(r.score)}): ${joinReasons(explainMove(s, r.move))}`);
  }
  for (const color of ['w', 'b']) {
    const th = threatSquares(s, color).danger;
    if (th.length) lines.push(`Gefährdete Figuren von ${color === 'w' ? 'Weiß' : 'Schwarz'}: ${th.map(i => `${NAME[E.typeOf(s.board[i])]} ${E.sqName(i)}`).join(', ')}`);
  }
  const other = E.other(s.turn);
  const th = describeThreat(s, other);
  if (th) lines.push(`Drohung von ${other === 'w' ? 'Weiß' : 'Schwarz'} (falls nichts dagegen getan wird): ${th.text}`);
  lines.push(`Alle legalen Züge für ${side}: ${legal.map(m => de(E.toSAN(s, m, legal))).join(' ')}`);
  return lines.join('\n');
}

const plain = html => { const d = document.createElement('div'); d.innerHTML = html.replace(/<\/p>|<br>/g, '\n'); return d.textContent.trim(); };

function buildContext() {
  const parts = [];
  if (mode === 'play') {
    const s = curState();
    parts.push(twoPlayer() ? 'MODUS: Analysebrett. Der Schüler zieht BEIDE Seiten selbst (Weiß und Schwarz), um auszuprobieren, wie man reagiert. Erkläre Züge für die Seite, nach der er fragt, bzw. für die Seite am Zug.' : `MODUS: Partie gegen den Computer (Stufe ${LEVELS[game.level]}). Der Schüler spielt ${game.player === 'w' ? 'Weiß' : 'Schwarz'}, der Computer ${game.player === 'w' ? 'Schwarz' : 'Weiß'}.${game.player === 'b' ? ' Der Schüler will lernen, wie man als Schwarz richtig auf die Züge von Weiß reagiert.' : ''}`);
    if (game.lastOpening) parts.push(`Eröffnung: ${game.lastOpening}`);
    parts.push(`Züge bisher: ${moveListText(game.sans)}`);
    parts.push(`FEN: ${E.toFEN(s)}`);
    parts.push(`Figuren:\n${pieceListing(s)}`);
    parts.push(engineFacts(s, game.player));
    parts.push(`Letzte Hinweise des automatischen Trainers:\n${plain($('coachMsg').innerHTML).slice(0, 1500)}`);
  } else if (mode === 'openings' && lesson.o && !$('openingLesson').hidden) {
    const o = lesson.o, s = lessonState();
    parts.push(`MODUS: Eröffnungstraining „${o.name}“. Der Schüler spielt ${o.side === 'w' ? 'Weiß' : 'Schwarz'}.`);
    parts.push(`Idee der Eröffnung: ${o.intro}\nMerksatz: ${o.summary}`);
    parts.push(`Bisher gespielt, mit Erklärung:\n${o.moves.slice(0, lesson.idx).map((x, k) => `${Math.floor(k / 2) + 1}${k % 2 ? '…' : '.'} ${de(x[0])}: ${x[1]}`).join('\n') || '(noch nichts)'}`);
    if (lesson.idx < o.moves.length) parts.push(`Nächster Zug der Lektion (NICHT direkt verraten, außer der Schüler fragt ausdrücklich nach dem Zug): ${de(o.moves[lesson.idx][0])} – ${o.moves[lesson.idx][1]}`);
    else parts.push('Die Lektion ist abgeschlossen.');
    parts.push(`FEN: ${E.toFEN(s)}`);
    parts.push(`Figuren:\n${pieceListing(s)}`);
    parts.push(engineFacts(s, o.side));
  } else if (mode === 'puzzles' && puzzle.state && !$('puzzleView').hidden) {
    const p = ALL_PUZZLES[puzzle.idx], s = puzzle.state, meta = puzzleMeta(p);
    parts.push(`MODUS: Taktik-Rätsel „${meta.title}“. Aufgabe: ${meta.goal}`);
    parts.push(`Lösung (NICHT verraten! Gib nur schrittweise Hinweise, außer der Schüler bittet ausdrücklich um die Lösung): ${p.sol.map(de).join(', ')} (Gegenzüge spielt die Engine) – ${meta.explain}`);
    parts.push(`Schwierigkeit: ${p.level}. Bisher richtig gespielte Lösungszüge des Schülers: ${puzzle.step}. Der Schüler spielt ${puzzle.me === 'w' ? 'Weiß' : 'Schwarz'}.`);
    parts.push(puzzle.solved ? 'Der Schüler hat das Rätsel bereits gelöst.' : 'Der Schüler hat es noch nicht gelöst.');
    parts.push(`FEN: ${E.toFEN(s)}`);
    parts.push(`Figuren:\n${pieceListing(s)}`);
    parts.push(`Am Zug: ${s.turn === 'w' ? 'Weiß' : 'Schwarz'}`);
  } else {
    parts.push('MODUS: Der Schüler ist im Menü (keine konkrete Stellung). Beantworte allgemeine Schachfragen.');
  }
  return parts.join('\n\n');
}

const INSTRUCTIONS = `Du bist „Eule“, ein geduldiger, freundlicher Schachtrainer in einer Schach-Lern-App. Dein Schüler ist Anfänger und will richtig gut Schach spielen lernen.

So antwortest du:
- Auf Deutsch, in einfacher Sprache, konkret und ermutigend. Normalerweise 3–8 Sätze; wenn der Schüler eine genaue Erklärung möchte, auch ausführlicher.
- Deutsche Notation: K = König, D = Dame, T = Turm, L = Läufer, S = Springer, Bauernzüge ohne Buchstaben (e4). Nenne Züge zusätzlich in Worten, z. B. „der Springer von g1 nach f3 (Sf3)“.
- Erkläre immer das WARUM: Zentrum, Entwicklung, Königssicherheit, ungedeckte Figuren, Drohungen, Taktikmotive (Gabel, Fesselung, Spieß, Abzug), Pläne.
- Schachstellungen im Kopf zu berechnen ist fehleranfällig. Stütze dich daher auf die ENGINE-DATEN unten. Erfinde keine Figuren, Felder oder Züge. Empfiehl nur legale Züge.
- Wenn du einen Zug bewerten willst, der nicht in den Engine-Daten steht (z. B. einen Zug, den der Schüler vorschlägt), prüfe ihn vorher mit dem Werkzeug pruefe_zug.
- Wenn du konkrete Züge erklärst, zeige sie mit dem Werkzeug zeige_pfeile auf dem Brett (höchstens 3 Pfeile).
- Bewertungen: +1.0 bedeutet ungefähr einen Bauern Vorteil.
- Formatierung: nur einfacher Text. **fett** ist erlaubt, Aufzählungen beginnen mit „- “. Keine Tabellen, keine Überschriften.`;

const CHIPS = {
  play: ['Erklär mir die Stellung', 'Was droht gerade?', 'Warum war mein letzter Zug gut oder schlecht?', 'Was ist jetzt ein guter Plan?', 'Erklär den letzten Zug des Computers'],
  openings: ['Warum wird dieser Zug gespielt?', 'Was sind die Hauptideen dieser Eröffnung?', 'Welche typischen Fallen gibt es hier?', 'Was passiert, wenn der Gegner anders spielt?'],
  puzzles: ['Gib mir einen kleinen Hinweis', 'Welches Muster ist das?', 'Erklär mir die Lösung genau'],
  menu: ['Wie werde ich schnell besser?', 'Welche Eröffnung soll ich lernen?', 'Was ist eine Gabel?'],
};

function renderChips() {
  const key = mode === 'openings' && !$('openingLesson').hidden ? 'openings'
    : mode === 'puzzles' && !$('puzzleView').hidden ? 'puzzles'
      : mode === 'play' ? 'play' : 'menu';
  const box = $('chips');
  box.innerHTML = '';
  for (const q of CHIPS[key]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = q;
    b.onclick = () => ask(q);
    box.appendChild(b);
  }
}

function escapeHtml(t) {
  return t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
function formatAnswer(text) {
  const lines = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let html = '', inList = false;
  for (const l of lines) {
    const m = l.match(/^\s*[-•*]\s+(.*)$/);
    if (m) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${m[1]}</li>`; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    if (l.trim()) html += `<p>${l}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

function scrollChat() { const pb = $('askBox').closest('.pbody'); if (pb) pb.scrollTop = pb.scrollHeight; }

function addMsg(role, html) {
  const d = document.createElement('div');
  d.className = 'msg ' + role;
  d.innerHTML = html;
  $('chatLog').appendChild(d);
  scrollChat();
  return d;
}

function currentBoardState() { return ui.ctx ? ui.ctx.state : E.parseFEN(E.START_FEN); }

const CHAT_TOOLS = [
  {
    name: 'pruefe_zug',
    description: 'Prüft einen Zug in der aktuellen Brettstellung mit der Schach-Engine (für die Seite, die am Zug ist). Akzeptiert deutsche (Sf3), englische (Nf3) oder Koordinaten-Notation (g1f3). Liefert, ob er legal ist, seine Bewertung, was er bewirkt, die beste Antwort des Gegners und den besten Zug zum Vergleich.',
    inputSchema: { type: 'object', properties: { zug: { type: 'string', description: 'Der Zug, z. B. "Sf3", "exd5", "O-O" oder "e2e4"' } }, required: ['zug'] },
    execute(input) {
      const s = currentBoardState();
      const m = parseUserMove(s, input.zug);
      if (!m) throw new Error(`"${input.zug}" ist in dieser Stellung kein legaler Zug für ${s.turn === 'w' ? 'Weiß' : 'Schwarz'}.`);
      const legal = E.legalMoves(s);
      const best = E.bestMove(s, 3);
      const sc = sameMove(best.move, m) ? best.score : E.scoreMove(s, m, 3);
      const after = E.makeMove(s, m);
      const reply = E.legalMoves(after).length ? E.bestMove(after, 3) : null;
      return {
        zug: de(E.toSAN(s, m, legal)),
        von_nach: `${E.sqName(m.from)}→${E.sqName(m.to)}`,
        bewertung_fuer_ziehende_seite: fmtScore(sc),
        was_der_zug_bewirkt: explainMove(s, m),
        beste_antwort_des_gegners: reply ? `${de(E.toSAN(after, reply.move))}: ${joinReasons(explainMove(after, reply.move))}` : (E.inCheck(after, after.turn) ? 'keine – Schachmatt' : 'keine – Patt'),
        bester_zug_zum_vergleich: `${de(E.toSAN(s, best.move, legal))} (${fmtScore(best.score)}): ${joinReasons(explainMove(s, best.move))}`,
        verlust_gegenueber_bestem_zug_in_bauern: Math.max(0, (best.score - sc) / 100).toFixed(1),
      };
    },
  },
  {
    name: 'zeige_pfeile',
    description: 'Zeichnet Pfeile auf das Schachbrett, die der Schüler sieht, z. B. um einen Zug oder eine Drohung zu zeigen. Felder in Koordinaten wie "g1" und "f3". Ersetzt vorherige Pfeile. Liefert "ok".',
    inputSchema: {
      type: 'object',
      properties: { pfeile: { type: 'array', items: { type: 'object', properties: { von: { type: 'string' }, nach: { type: 'string' } }, required: ['von', 'nach'] }, maxItems: 3 } },
      required: ['pfeile'],
    },
    execute(input) {
      const list = Array.isArray(input.pfeile) ? input.pfeile.slice(0, 3) : [];
      const ok = /^[a-h][1-8]$/;
      ui.arrows = list
        .map(a => ({ von: String(a && a.von || '').toLowerCase(), nach: String(a && a.nach || '').toLowerCase() }))
        .filter(a => ok.test(a.von) && ok.test(a.nach) && a.von !== a.nach)
        .map(a => ({ from: E.sqIndex(a.von), to: E.sqIndex(a.nach) }));
      ui.hintFrom = -1;
      render();
      return 'ok';
    },
  },
];

async function ask(question) {
  question = String(question || '').trim();
  if (!question || !chat.sample || chat.busy) return;
  $('askInput').value = '';
  addMsg('user', escapeHtml(question));
  const bubble = addMsg('bot thinking', 'Eule denkt nach …');
  chat.busy = true;
  $('askSend').disabled = true;
  $('askStop').hidden = false;
  $('askNote').textContent = '';
  chat.ctl = new AbortController();
  const input = [
    { role: 'user', content: `${INSTRUCTIONS}\n\n===== AKTUELLE SITUATION / ENGINE-DATEN =====\n${buildContext()}` },
    ...chat.turns.slice(-8),
    { role: 'user', content: question },
  ];
  // Die Liste muss mit einer Nutzer-Nachricht beginnen; nach dem Anweisungsblock dürfen Nutzer-Turns direkt folgen.
  const opts = {
    signal: chat.ctl.signal,
    cache: false,
    modelTier: 'default',
    effort: 'low',
    onText: ({ text }) => { bubble.classList.remove('thinking'); bubble.innerHTML = formatAnswer(text); scrollChat(); },
  };
  if (chat.tools) { opts.tools = CHAT_TOOLS; delete opts.cache; }
  try {
    const { text, truncated } = await chat.sample(input, opts);
    bubble.classList.remove('thinking');
    bubble.innerHTML = formatAnswer(text);
    chat.turns.push({ role: 'user', content: question }, { role: 'assistant', content: text });
    if (truncated) $('askNote').textContent = 'Die Antwort wurde abgeschnitten – frag gern genauer nach.';
  } catch (e) {
    const code = e && e.code;
    if (e && e.text) { bubble.classList.remove('thinking'); bubble.innerHTML = formatAnswer(e.text); }
    else bubble.remove();
    if (code === 'cancelled') { /* gestoppt */ }
    else if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) {
      $('askNote').textContent = 'Die KI-Eule ist hier nicht erlaubt oder nicht verfügbar. Der normale Trainer funktioniert weiterhin.';
      $('askForm').hidden = true; $('chips').hidden = true;
    } else if (code === 'tools_unavailable') {
      chat.tools = false;
      $('askNote').textContent = 'Bitte frag nochmal – ich antworte jetzt ohne Brett-Werkzeuge.';
    } else if (code === 'rate_limited') $('askNote').textContent = 'Gerade zu viele Fragen – warte kurz und versuch es dann nochmal.';
    else if (code === 'session_expired') $('askNote').textContent = 'Bitte melde dich bei Claude neu an.';
    else if (code === 'refused') $('askNote').textContent = 'Darauf kann ich nicht antworten. Frag gern etwas anderes zum Schach.';
    else $('askNote').textContent = 'Da ist etwas schiefgegangen. Versuch es bitte nochmal.';
  } finally {
    chat.busy = false;
    $('askSend').disabled = false;
    $('askStop').hidden = true;
  }
}

async function initChat() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  let sample = null;
  try { sample = await window.claude.use('sample'); } catch (e) { sample = null; }
  if (!sample) return;
  chat.sample = sample;
  try { const lim = await sample.limits(); chat.tools = !!(lim && lim.tools); } catch (e) { chat.tools = false; }
  $('askForm').addEventListener('submit', ev => { ev.preventDefault(); ask($('askInput').value); });
  $('askStop').onclick = () => chat.ctl && chat.ctl.abort();
  updateAskBox();
}

function updateAskBox() {
  const box = $('askBox');
  $('subAskBtn').hidden = !chat.sample;
  let host = null;
  if (mode === 'play') host = $('sub-ask');
  else if (mode === 'openings' && !$('openingLesson').hidden) host = $('olAsk');
  else if (mode === 'puzzles' && !$('puzzleView').hidden) host = $('pzAsk');
  if (host && box.parentElement !== host) host.appendChild(box);
  box.hidden = !chat.sample || !host;
  if (chat.sample) renderChips();
}

// ===================== Bereiche & Start =====================
function showTab(tab) {
  mode = tab;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  for (const t of ['play', 'openings', 'puzzles']) $('panel-' + t).hidden = t !== tab;
  $('panel-tips').hidden = tab !== 'tips';
  $('boardArea').hidden = tab === 'tips';
  $('panel').hidden = tab === 'tips';
  clearTimeout(lesson.timer);
  ui.mark = null;
  $('evalV').style.visibility = tab === 'play' ? 'visible' : 'hidden';
  $('toast').hidden = true;
  if (tab === 'play') {
    ui.orientation = twoPlayer() ? ui.orientation : game.player;
    setContext(playContext());
    updatePlayUI();
    if (!game.over && !twoPlayer() && curState().turn !== game.player && !ui.busy) later(computerMove, 300);
  } else if (tab === 'openings') {
    $('openingListView').hidden = false; $('openingLesson').hidden = true;
    renderOpeningList();
    ui.orientation = 'w';
    setContext({ state: E.parseFEN(E.START_FEN), lastMove: null, canMove: () => false, onMove() {}, showThreats: () => false });
  } else if (tab === 'puzzles') {
    $('puzzleListView').hidden = false; $('puzzleView').hidden = true;
    renderPuzzleList();
    const first = ALL_PUZZLES[visiblePuzzles()[0] || 0];
    const s = E.parseFEN(first.fen);
    ui.orientation = s.turn;
    setContext({ state: s, lastMove: null, canMove: () => false, onMove() {}, showThreats: () => false, noCaps: true });
  }
  window.scrollTo(0, 0);
  updateAskBox();
}

function openNewGame() {
  const sel = { color: settings.color, level: settings.level, board: settings.board };
  const sync = () => {
    document.querySelectorAll('#ngColor button').forEach(b => b.classList.toggle('on', b.dataset.color === sel.color));
    document.querySelectorAll('#ngLevel button').forEach(b => b.classList.toggle('on', Number(b.dataset.level) === sel.level));
    document.querySelectorAll('#ngTheme button').forEach(b => b.classList.toggle('on', b.dataset.themeBoard === sel.board));
    $('ngColor').style.opacity = sel.level === 0 ? '.45' : '1';
  };
  document.querySelectorAll('#ngColor button').forEach(b => { b.onclick = () => { sel.color = b.dataset.color; sync(); }; });
  document.querySelectorAll('#ngLevel button').forEach(b => { b.onclick = () => { sel.level = Number(b.dataset.level); sync(); }; });
  document.querySelectorAll('#ngTheme button').forEach(b => { b.onclick = () => { sel.board = b.dataset.themeBoard; settings.board = sel.board; applyBoardTheme(); sync(); }; });
  $('ngCancel').onclick = () => { $('newGameModal').hidden = true; };
  $('ngStart').onclick = () => {
    Object.assign(settings, sel);
    saveSettings();
    applyBoardTheme();
    $('newGameModal').hidden = true;
    if (mode !== 'play') showTab('play');
    newGame(null, null, null, sel.level === 0 ? 'w' : sel.color, sel.level);
  };
  sync();
  $('newGameModal').hidden = false;
}

function init() {
  $('panel-tips').innerHTML = TIPS_HTML;
  applyBoardTheme();
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
  document.querySelectorAll('.subtabs button').forEach(b => b.addEventListener('click', () => showSub(b.dataset.sub)));
  $('newGameBtn').onclick = () => { if (!ui.busy) openNewGame(); };
  $('undoBtn').onclick = undo;
  $('hintBtn').onclick = hint;
  $('flipBtn').onclick = () => { ui.orientation = E.other(ui.orientation); render(); updateEval(); };
  $('threatChk').onchange = render;
  $('newGameModal').addEventListener('click', e => { if (e.target === $('newGameModal')) $('newGameModal').hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('newGameModal').hidden = true; });

  document.querySelectorAll('#openingFilter button').forEach(b => b.addEventListener('click', () => {
    lesson.filter = b.dataset.f;
    document.querySelectorAll('#openingFilter button').forEach(x => x.classList.toggle('on', x === b));
    renderOpeningList();
  }));
  $('openingBack').onclick = () => showTab('openings');
  $('olRestart').onclick = () => startLesson(lesson.o, lesson.fixed);
  $('olHint').onclick = () => {
    if (lesson.done) return;
    const s = lessonState();
    if (s.turn !== lesson.o.side) return;
    const m = lessonHintMove();
    if (!m) return;
    ui.arrows = [{ from: m.from, to: m.to }]; ui.hintFrom = -1;
    render();
  };
  $('olPlay').onclick = () => {
    const lv = settings.level || 2;
    showTab('play');
    newGame(lesson.states, lesson.moves, lesson.sans, lesson.o.side, lv);
  };

  document.querySelectorAll('#puzzleFilter button').forEach(b => b.addEventListener('click', () => {
    puzzle.filter = b.dataset.f;
    puzzle.shown = 40;
    document.querySelectorAll('#puzzleFilter button').forEach(x => x.classList.toggle('on', x === b));
    renderPuzzleList();
  }));
  $('puzzleBack').onclick = () => showTab('puzzles');
  $('pzHint').onclick = () => {
    const meta = puzzleMeta(ALL_PUZZLES[puzzle.idx]);
    puzzle.helped = true;
    if (!puzzle.hintShown) { $('pzMsg').insertAdjacentHTML('beforeend', `<p class="small">💡 ${meta.hint}</p>`); puzzle.hintShown = true; }
    else { const m = puzzleSolution(); if (m) { ui.hintFrom = m.from; render(); } }
  };
  $('pzSolve').onclick = () => {
    if (puzzle.solved || ui.busy) return;
    puzzle.helped = true;
    ratePuzzle(false);
    const m = puzzleSolution();
    if (m) { ui.arrows = [{ from: m.from, to: m.to }]; ui.hintFrom = -1; render(); }
    $('pzMsg').innerHTML = `<p>Der Pfeil zeigt den nächsten Lösungszug. Spiel ihn selbst!</p><p class="small">${puzzleMeta(ALL_PUZZLES[puzzle.idx]).explain}</p>`;
  };
  $('pzRetry').onclick = () => startPuzzle(puzzle.idx);
  $('trStart').onclick = () => nextTrainingPuzzle();
  $('pzNext').onclick = () => {
    if (puzzle.training) { nextTrainingPuzzle(); return; }
    const vis = visiblePuzzles();
    const pos = vis.indexOf(puzzle.idx);
    if (pos >= 0 && pos < vis.length - 1) startPuzzle(vis[pos + 1]);
    else showTab('puzzles');
  };

  // Laufende Partie über ein Neuladen der Seite retten
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) {
    try { hot.snapshot(() => ({ player: game.player, level: game.level, sans: game.sans.slice() })); } catch (e) { /* egal */ }
  }
  const start = data => {
    if (data && Array.isArray(data.sans) && data.sans.length && (data.player === 'w' || data.player === 'b')) {
      const states = [E.parseFEN(E.START_FEN)], moves = [], sans = [];
      for (const san of data.sans) {
        const st = states[states.length - 1];
        const m = E.moveFromSAN(st, String(san));
        if (!m) break;
        sans.push(E.toSAN(st, m)); moves.push(m); states.push(E.makeMove(st, m));
      }
      newGame(states, moves, sans, data.player, Number(data.level) || 0);
    } else newGame();
    initChat();
  };
  if (hot && typeof hot.ready === 'function') hot.ready(start);
  else start(hot && hot.data ? hot.data : {});
}

init();
