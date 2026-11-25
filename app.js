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
for (const o of OPENINGS) OPENING_NAMES.push([o.moves.map(m => m[0]).join(' '), o.name]);

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
  arrows: [], hintFrom: -1, busy: false,
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
  const capturedBy = color => { // Figuren, die `color` geschlagen hat
    const opp = E.other(color);
    let out = '';
    for (const t of ['q', 'r', 'b', 'n', 'p']) {
      const n = Math.max(0, start[t] - count[opp][t]);
      out += (GLYPH[t] + VS).repeat(n);
    }
    return out;
  };
  const label = color => {
    const who = ctx.labels ? ctx.labels[color] : (color === 'w' ? 'Weiß' : 'Schwarz');
    const adv = color === 'w' ? mat : -mat;
    const advStr = adv > 0 ? `<span class="adv">+${Math.round(adv / 100)}</span>` : '';
    return `<span>${who}</span><span class="caps">${capturedBy(color)}${advStr}</span>`;
  };
  const top = ui.orientation === 'w' ? 'b' : 'w';
  $('topBar').innerHTML = label(top);
  $('bottomBar').innerHTML = label(E.other(top));
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
const game = {
  states: [], moves: [], sans: [], player: 'w', level: 2, over: false, hintStep: 0, lastOpening: null,
};

function setCoach(html) { $('coachMsg').innerHTML = html; }

function newGame(fromStates, fromMoves, fromSans, playerColor) {
  let col = playerColor || $('colorSel').value;
  if (col === 'r') col = Math.random() < 0.5 ? 'w' : 'b';
  game.player = col;
  game.level = parseInt($('levelSel').value, 10);
  game.states = fromStates ? fromStates.slice() : [E.parseFEN(E.START_FEN)];
  game.moves = fromMoves ? fromMoves.slice() : [];
  game.sans = fromSans ? fromSans.slice() : [];
  game.over = false; game.hintStep = 0;
  game.lastOpening = openingNameFor(game.sans);
  ui.orientation = col;
  setContext(playContext());
  $('openingName').textContent = game.lastOpening || '';
  setCoach(fromStates
    ? '<p>Weiter geht’s! Spiel die Partie aus dieser Stellung gegen mich weiter.</p>'
    : `<p>Hallo! Ich bin dein Trainer. Du spielst <b>${col === 'w' ? 'Weiß' : 'Schwarz'}</b>. Nach jedem Zug sage ich dir, wie gut er war.</p>
       <p class="small">Klicke auf eine Figur, dann auf das Zielfeld. Mit „💡 Tipp“ helfe ich dir.</p>`);
  $('tipOfDay').textContent = pick(TIPS_OF_THE_DAY);
  updatePlayUI();
  if (curState().turn !== game.player) later(computerMove, 400);
}

const curState = () => game.states[game.states.length - 1];

function playContext() {
  return {
    get state() { return curState(); },
    get lastMove() { return game.moves[game.moves.length - 1] || null; },
    get me() { return game.player; },
    get labels() { return { [game.player]: 'Du', [E.other(game.player)]: 'Computer' }; },
    showThreats: () => $('threatChk').checked && !game.over,
    canMove: () => !game.over && curState().turn === game.player,
    onMove: playerMove,
  };
}

function pushMove(m) {
  const s = curState();
  const san = E.toSAN(s, m);
  game.states.push(E.makeMove(s, m));
  game.moves.push(m);
  game.sans.push(san);
  return san;
}

function playerMove(m) {
  const before = curState();
  const histBefore = game.moves.slice();
  pushMove(m);
  game.hintStep = 0;
  render();
  updatePlayUI();
  ui.busy = true;
  setStatus('Trainer denkt nach', true);
  later(() => {
    const fb = coachFeedback(before, m, histBefore);
    setCoach(fb);
    ui.busy = false;
    if (!checkGameOver()) later(computerMove, 350);
  }, 30);
}

function computerMove() {
  if (game.over || curState().turn === game.player) return;
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
      appendCoach(`<p class="small">Computer spielt <b>${de(san)}</b>.${extra}</p>`);
    }
    updatePlayUI();
  }, 60);
}

function appendCoach(html) { $('coachMsg').insertAdjacentHTML('beforeend', html); }

function bookMove(s) {
  if (game.sans.length > 14) return null;
  const line = game.sans.map(E.cleanSAN);
  const cands = [];
  for (const o of OPENINGS) {
    const seq = o.moves.map(x => x[0]);
    if (seq.length > line.length && line.every((x, k) => x === seq[k])) cands.push(seq[line.length]);
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
  const r = E.bestMove(s, lvl === 3 ? 3 : 4);
  return r ? r.move : null;
}

// ---------- Trainer-Feedback ----------
function describeCapture(m, whose) {
  const t = E.typeOf(m.captured);
  return `${whose === 'mine' ? NAME_ACC[t] : NAME_THEIR[t]} auf ${E.sqName(m.to)}`;
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

  const res = E.analyzeAll(before, 2);
  const best = res[0];
  const mine = res.find(r => sameMove(r.move, m)) || best;
  const loss = best.score - mine.score;
  const bestSan = de(E.toSAN(before, best.move, legal));
  let quality;

  if (sameMove(best.move, m) || loss <= 10) quality = 'best';
  else if (loss <= 50) quality = 'good';
  else if (loss <= 130) quality = 'inaccurate';
  else if (loss <= 300) quality = 'mistake';
  else quality = 'blunder';

  // Warum war der Zug schlecht?
  let why = '';
  if (quality === 'mistake' || quality === 'blunder') {
    const reply = E.bestMove(after, 2);
    if (reply && reply.move) {
      const rsan = de(E.toSAN(after, reply.move));
      if (reply.score > E.MATE - 100) why = `Der Gegner kann jetzt <b>Matt</b> setzen (${rsan})!`;
      else if (reply.move.captured) why = `Der Gegner kann ${describeCapture(reply.move, 'mine')} schlagen (${rsan}).`;
      else why = `Der Gegner hat jetzt den starken Zug <b>${rsan}</b>.`;
    }
    if (best.score > E.MATE - 100) why += ` Du hättest mit <b>${bestSan}</b> Matt setzen können!`;
    else if (best.move.captured && !m.captured) why += ` Du hättest ${describeCapture(best.move, 'theirs')} schlagen können.`;
  }

  const praise = ['Sehr gut!', 'Stark!', 'Top-Zug!', 'Genau richtig!', 'Prima!'];
  if (quality === 'best') parts.push(`<p class="good">⭐ ${de(san)} – ${pick(praise)} Das ist der beste Zug.</p>`);
  else if (quality === 'good') parts.push(`<p class="good">👍 ${de(san)} – Guter Zug.</p>`);
  else if (quality === 'inaccurate') parts.push(`<p class="warn">🤔 ${de(san)} – Etwas ungenau. Besser war <b>${bestSan}</b>.</p>`);
  else if (quality === 'mistake') parts.push(`<p class="warn">❗ ${de(san)} – Ein Fehler. ${why} Besser war <b>${bestSan}</b>.</p>`);
  else parts.push(`<p class="bad">❌ ${de(san)} – Grober Fehler! ${why} Besser war <b>${bestSan}</b>. <br><span class="small">Tipp: Mit „↶ Zurück“ kannst du den Zug zurücknehmen.</span></p>`);

  if (quality === 'best' || quality === 'good' || quality === 'inaccurate') {
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
  let msg = null;
  if (!legal.length) {
    if (E.inCheck(s, s.turn)) msg = s.turn === game.player
      ? '<p class="bad">Schachmatt – der Computer hat gewonnen.</p><p class="small">Nicht schlimm! Nimm Züge zurück und schau, wo es schiefging, oder starte ein neues Spiel.</p>'
      : '<p class="good">♛ Schachmatt! Du hast gewonnen – großartig!</p>';
    else msg = '<p class="warn">Patt – Remis! Wer am Zug ist, hat keinen legalen Zug, steht aber nicht im Schach.</p>';
  } else if (E.insufficientMaterial(s.board)) msg = '<p class="warn">Remis – niemand hat mehr genug Material, um Matt zu setzen.</p>';
  else if (s.half >= 100) msg = '<p class="warn">Remis durch die 50-Züge-Regel.</p>';
  else {
    const key = E.positionKey(s);
    if (game.states.filter(x => E.positionKey(x) === key).length >= 3) msg = '<p class="warn">Remis durch dreifache Stellungswiederholung.</p>';
  }
  if (msg) {
    game.over = true;
    setCoach(msg);
    render();
    updatePlayUI();
    return true;
  }
  return false;
}

function setStatus(text, thinking) {
  const el = $('status');
  el.textContent = text;
  el.classList.toggle('thinking', !!thinking);
}

function updatePlayUI() {
  const s = curState();
  if (game.over) setStatus('Spiel beendet');
  else if (s.turn === game.player) setStatus(E.inCheck(s, s.turn) ? 'Du bist am Zug – Schach!' : 'Du bist am Zug');
  else setStatus('Computer ist am Zug', true);

  // Zugliste
  const list = $('moveList');
  list.innerHTML = '';
  const first = game.states[0];
  let ply = 0;
  let num = first.full;
  if (first.turn === 'b' && game.sans.length) {
    list.insertAdjacentHTML('beforeend', `<span class="n">${num}.</span><span>…</span>`);
  }
  for (let k = 0; k < game.sans.length; k++) {
    const color = (first.turn === 'w') === (k % 2 === 0) ? 'w' : 'b';
    if (color === 'w') list.insertAdjacentHTML('beforeend', `<span class="n">${num}.</span>`);
    const cls = k === game.sans.length - 1 ? 'cur' : '';
    list.insertAdjacentHTML('beforeend', `<span class="${cls}">${de(game.sans[k])}</span>`);
    if (color === 'b') num++;
    ply++;
  }
  list.scrollTop = list.scrollHeight;

  $('undoBtn').disabled = game.moves.length === 0;
  $('hintBtn').disabled = game.over || s.turn !== game.player;
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
  $('evalFill').style.width = pct + '%';
  let txt;
  if (Math.abs(white) > E.MATE - 100) txt = white > 0 ? 'Weiß setzt bald matt' : 'Schwarz setzt bald matt';
  else if (Math.abs(white) < 60) txt = 'Ausgeglichen';
  else {
    const side = white > 0 ? 'Weiß' : 'Schwarz';
    const v = Math.abs(white);
    txt = `${side} ${v < 150 ? 'steht etwas besser' : v < 400 ? 'steht besser' : 'steht klar besser'} (${(white > 0 ? '+' : '−') + (v / 100).toFixed(1)})`;
  }
  $('evalText').textContent = txt;
}

function undo() {
  if (!game.moves.length || ui.busy) return;
  do {
    game.states.pop(); game.moves.pop(); game.sans.pop();
  } while (game.moves.length && curState().turn !== game.player);
  if (curState().turn !== game.player) { // Computer hatte angefangen
    game.over = false;
    render(); updatePlayUI();
    later(computerMove, 300);
    return;
  }
  game.over = false; game.hintStep = 0;
  game.lastOpening = openingNameFor(game.sans);
  $('openingName').textContent = game.lastOpening || '';
  setCoach('<p>Zug zurückgenommen. Versuch es noch einmal – denk daran: Was kann der Gegner nach deinem Zug machen?</p>');
  ui.selected = -1; ui.targets = []; ui.arrows = []; ui.hintFrom = -1;
  render(); updatePlayUI();
}

function hint() {
  if (game.over || ui.busy || curState().turn !== game.player) return;
  const s = curState();
  setStatus('Trainer sucht einen guten Zug', true);
  ui.busy = true;
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
      let txt = `Schau dir ${t === 'q' ? 'deine' : 'deinen'} <b>${NAME[t]}</b> auf ${E.sqName(m.from)} an (blau markiert). Wohin könnte ${t === 'q' ? 'sie' : 'er'} ziehen?`;
      if (r.score > E.MATE - 100) txt = 'Hier gibt es ein Matt! ' + txt;
      appendCoach(`<p>💡 ${txt} <span class="small">Drück nochmal auf Tipp für die Lösung.</span></p>`);
    } else {
      ui.hintFrom = -1; ui.arrows = [{ from: m.from, to: m.to }];
      const san = de(E.toSAN(s, m));
      const ns = E.makeMove(s, m);
      let why = '';
      if (r.score > E.MATE - 100) why = 'Das führt zum Matt!';
      else if (m.captured) why = `So gewinnst du ${NAME_THEIR[E.typeOf(m.captured)]}.`;
      else if (E.inCheck(ns, ns.turn)) why = 'Ein Schachgebot, das dem Gegner Probleme macht.';
      else if (m.flag) why = m.flag === 'K' || m.flag === 'Q' ? 'Bring deinen König in Sicherheit.' : '';
      else {
        const thBefore = threatSquares(s, game.player).danger;
        if (thBefore.includes(m.from)) why = 'Diese Figur war in Gefahr – so bringst du sie in Sicherheit.';
        else why = 'Dieser Zug verbessert deine Stellung am meisten.';
      }
      appendCoach(`<p>💡 Mein Vorschlag: <b>${san}</b>. ${why}</p>`);
    }
    render();
  }, 30);
}

// ===================== Eröffnungen =====================
const lesson = { o: null, idx: 0, states: [], moves: [], sans: [], timer: null, done: false };

function renderOpeningList() {
  const list = $('openingList');
  list.innerHTML = '<p class="small">Wähle eine Eröffnung. Ich zeige dir jeden Zug und erkläre, warum er gespielt wird. Deine Züge spielst du selbst!</p>';
  for (const o of OPENINGS) {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.innerHTML = `<span><span class="t">${o.name}</span><br><span class="s">Du spielst ${o.side === 'w' ? 'Weiß' : 'Schwarz'} · ${de(o.moves.slice(0, 4).map((m, k) => (k % 2 ? '' : (k / 2 + 1) + '.') + m[0]).join(' '))} …</span></span><span class="badge">${o.level}</span>`;
    btn.onclick = () => startLesson(o);
    list.appendChild(btn);
  }
}

function startLesson(o) {
  clearTimeout(lesson.timer);
  Object.assign(lesson, { o, idx: 0, states: [E.parseFEN(E.START_FEN)], moves: [], sans: [], done: false });
  $('openingList').hidden = true;
  $('openingLesson').hidden = false;
  $('olTitle').textContent = o.name;
  $('olIntro').textContent = o.intro;
  $('olPlay').hidden = true;
  $('olHint').disabled = false;
  ui.orientation = o.side;
  setContext({
    get state() { return lesson.states[lesson.states.length - 1]; },
    get lastMove() { return lesson.moves[lesson.moves.length - 1] || null; },
    me: o.side,
    labels: { [o.side]: 'Du', [E.other(o.side)]: 'Gegner' },
    showThreats: () => false,
    canMove: () => !lesson.done && lessonState().turn === o.side,
    onMove: lessonMove,
  });
  renderSteps();
  lessonAdvance();
}

const lessonState = () => lesson.states[lesson.states.length - 1];

function lessonPlay(m) {
  const s = lessonState();
  lesson.sans.push(E.toSAN(s, m));
  lesson.states.push(E.makeMove(s, m));
  lesson.moves.push(m);
  lesson.idx++;
  ui.arrows = []; ui.hintFrom = -1;
  render();
  renderSteps();
}

function lessonAdvance() {
  const o = lesson.o;
  if (lesson.idx >= o.moves.length) {
    lesson.done = true;
    $('olMsg').innerHTML = `<p class="good">🎉 Geschafft! Du kennst jetzt die ${o.name}.</p><p>${o.summary}</p>`;
    $('olPlay').hidden = false;
    $('olHint').disabled = true;
    return;
  }
  const s = lessonState();
  const [san, text] = o.moves[lesson.idx];
  if (s.turn !== o.side) {
    lesson.timer = setTimeout(() => {
      const m = E.moveFromSAN(s, san);
      lessonPlay(m);
      $('olMsg').innerHTML = `<p>Gegner spielt <b>${de(san)}</b>: ${text}</p>` +
        (lesson.idx < o.moves.length ? '<p class="small">Jetzt du! Finde den nächsten Zug der Eröffnung.</p>' : '');
      lessonAdvance();
    }, lesson.idx === 0 ? 500 : 900);
  } else if (lesson.idx === 0) {
    $('olMsg').innerHTML = '<p>Du fängst an! Welcher Zug eröffnet diese Partie? Tipp: Drück auf „💡 Zug zeigen“, wenn du es nicht weißt.</p>';
  }
}

function lessonMove(m) {
  const o = lesson.o;
  const s = lessonState();
  const [san, text] = o.moves[lesson.idx];
  const expected = E.moveFromSAN(s, san);
  if (sameMove(expected, m)) {
    lessonPlay(m);
    $('olMsg').innerHTML = `<p class="good">✅ Richtig: ${de(san)}</p><p>${text}</p>`;
    lessonAdvance();
  } else {
    shakeBoard();
    const t = E.typeOf(expected.piece);
    $('olMsg').innerHTML = `<p class="warn">Nicht ganz. Dein Zug ${de(E.toSAN(s, m))} ist in dieser Eröffnung nicht üblich.</p>
      <p class="small">Kleiner Hinweis: Ziehe ${t === 'q' ? 'die' : 'den'} <b>${NAME[t]}</b>.</p>`;
    ui.hintFrom = expected.from;
    render();
  }
}

function renderSteps() {
  const o = lesson.o;
  const ol = $('olSteps');
  ol.innerHTML = '';
  for (let k = 0; k < lesson.idx; k++) {
    const li = document.createElement('li');
    const num = Math.floor(k / 2) + 1;
    li.innerHTML = `<b>${k % 2 ? num + '…' : num + '.'} ${de(o.moves[k][0])}</b> – ${o.moves[k][1]}`;
    ol.appendChild(li);
  }
  ol.scrollTop = ol.scrollHeight;
}

// ===================== Rätsel =====================
const puzzle = { idx: 0, state: null, lastMove: null, solved: false, tries: 0 };

function loadSolved() {
  try { return JSON.parse(localStorage.getItem('schach-solved') || '[]'); } catch (e) { return []; }
}
function saveSolved(list) {
  try { localStorage.setItem('schach-solved', JSON.stringify(list)); } catch (e) { /* egal */ }
}

function renderPuzzleList() {
  const solved = loadSolved();
  const list = $('puzzleList');
  list.innerHTML = '<p class="small">Taktik-Rätsel trainieren deinen Blick für Matt-Muster, Gabeln und mehr. Finde den besten Zug!</p>';
  PUZZLES.forEach((p, k) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    const done = solved.includes(p.title);
    btn.innerHTML = `<span><span class="t">${k + 1}. ${p.title}</span><br><span class="s">${p.goal}</span></span><span class="badge ${done ? 'done' : ''}">${done ? '✓ gelöst' : 'offen'}</span>`;
    btn.onclick = () => startPuzzle(k);
    list.appendChild(btn);
  });
}

function startPuzzle(k) {
  const p = PUZZLES[k];
  Object.assign(puzzle, { idx: k, state: E.parseFEN(p.fen), lastMove: null, solved: false, tries: 0 });
  $('puzzleList').hidden = true;
  $('puzzleView').hidden = false;
  $('pzTitle').textContent = `${k + 1}. ${p.title}`;
  $('pzGoal').textContent = p.goal;
  $('pzMsg').innerHTML = `<p>${puzzle.state.turn === 'w' ? 'Weiß' : 'Schwarz'} ist am Zug. Schau dir die Stellung genau an!</p>`;
  $('pzNext').textContent = k < PUZZLES.length - 1 ? 'Nächstes ›' : 'Zur Liste';
  ui.orientation = puzzle.state.turn;
  setContext({
    get state() { return puzzle.state; },
    get lastMove() { return puzzle.lastMove; },
    me: puzzle.state.turn,
    showThreats: () => false,
    canMove: () => !puzzle.solved,
    onMove: puzzleMove,
  });
}

function puzzleSolution(s, p) {
  if (p.solution) return E.moveFromSAN(s, p.solution);
  return E.legalMoves(s).find(m => {
    const n = E.makeMove(s, m);
    return E.inCheck(n, n.turn) && !E.legalMoves(n).length;
  });
}

function puzzleMove(m) {
  const p = PUZZLES[puzzle.idx];
  const s = puzzle.state;
  const after = E.makeMove(s, m);
  const ok = p.mate
    ? E.inCheck(after, after.turn) && !E.legalMoves(after).length
    : sameMove(m, E.moveFromSAN(s, p.solution));
  const prev = s;
  puzzle.state = after;
  puzzle.lastMove = m;
  render();
  if (ok) {
    puzzle.solved = true;
    $('pzMsg').innerHTML = `<p class="good">🎉 Richtig!</p><p>${p.explain}</p>`;
    const solved = loadSolved();
    if (!solved.includes(p.title)) { solved.push(p.title); saveSolved(solved); }
  } else {
    puzzle.tries++;
    $('pzMsg').innerHTML = `<p class="warn">Leider nicht. Versuch’s nochmal!</p>${puzzle.tries >= 2 ? `<p class="small">Hinweis: ${p.hint}</p>` : ''}`;
    ui.busy = true;
    setTimeout(() => {
      ui.busy = false;
      puzzle.state = prev; puzzle.lastMove = null;
      render();
    }, 900);
  }
}

// ===================== Tabs & Start =====================
function showTab(tab) {
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  for (const t of ['play', 'openings', 'puzzles']) $('panel-' + t).hidden = t !== tab;
  $('panel-tips').hidden = tab !== 'tips';
  $('boardArea').hidden = tab === 'tips';
  document.querySelector('.panel').hidden = tab === 'tips';
  clearTimeout(lesson.timer);
  if (tab === 'play') {
    ui.orientation = game.player;
    setContext(playContext());
    updatePlayUI();
    if (!game.over && curState().turn !== game.player && !ui.busy) later(computerMove, 300);
  } else if (tab === 'openings') {
    $('openingList').hidden = false; $('openingLesson').hidden = true;
    renderOpeningList();
    ui.orientation = 'w';
    setContext({ state: E.parseFEN(E.START_FEN), lastMove: null, canMove: () => false, onMove() {}, showThreats: () => false });
  } else if (tab === 'puzzles') {
    $('puzzleList').hidden = false; $('puzzleView').hidden = true;
    renderPuzzleList();
    startPuzzlePreview();
  }
}

function startPuzzlePreview() {
  const s = E.parseFEN(PUZZLES[0].fen);
  ui.orientation = s.turn;
  setContext({ state: s, lastMove: null, canMove: () => false, onMove() {}, showThreats: () => false });
}

function init() {
  $('panel-tips').innerHTML = TIPS_HTML;
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
  $('newGameBtn').onclick = () => { if (!ui.busy) newGame(); };
  $('levelSel').onchange = () => { game.level = parseInt($('levelSel').value, 10); };
  $('undoBtn').onclick = undo;
  $('hintBtn').onclick = hint;
  $('flipBtn').onclick = () => { ui.orientation = E.other(ui.orientation); render(); };
  $('threatChk').onchange = render;

  $('openingBack').onclick = () => showTab('openings');
  $('olRestart').onclick = () => startLesson(lesson.o);
  $('olHint').onclick = () => {
    if (lesson.done) return;
    const s = lessonState();
    if (s.turn !== lesson.o.side) return;
    const m = E.moveFromSAN(s, lesson.o.moves[lesson.idx][0]);
    ui.arrows = [{ from: m.from, to: m.to }]; ui.hintFrom = -1;
    render();
  };
  $('olPlay').onclick = () => {
    showTab('play');
    newGame(lesson.states, lesson.moves, lesson.sans, lesson.o.side);
  };

  $('puzzleBack').onclick = () => showTab('puzzles');
  $('pzHint').onclick = () => {
    const p = PUZZLES[puzzle.idx];
    $('pzMsg').insertAdjacentHTML('beforeend', `<p class="small">💡 ${p.hint}</p>`);
  };
  $('pzSolve').onclick = () => {
    if (puzzle.solved || ui.busy) return;
    const p = PUZZLES[puzzle.idx];
    const m = puzzleSolution(puzzle.state, p);
    if (m) { ui.arrows = [{ from: m.from, to: m.to }]; render(); }
    $('pzMsg').innerHTML = `<p>Die Lösung ist der Pfeil auf dem Brett. Spiel den Zug selbst!</p><p class="small">${p.explain}</p>`;
  };
  $('pzNext').onclick = () => {
    if (puzzle.idx < PUZZLES.length - 1) startPuzzle(puzzle.idx + 1);
    else showTab('puzzles');
  };

  newGame();
}

init();
