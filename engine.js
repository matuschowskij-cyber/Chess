// Kleine Schach-Engine: Zuggenerator, Bewertung, Suche.
// Brett: Array mit 64 Feldern, Index 0 = a8, 63 = h1.
// Figuren: Großbuchstaben = Weiß (PNBRQK), Kleinbuchstaben = Schwarz.
(function (root) {
  'use strict';

  const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const MATE = 100000;
  const INF = 1e9;

  // Feldtabellen (aus Sicht von Weiß, Index 0 = a8)
  const PST = {
    p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
        0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
        -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
        -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
        -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
        0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
    kEnd: [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30,
        -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50],
  };

  const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const KING = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const BISHOP = [[-1,-1],[-1,1],[1,-1],[1,1]];
  const ROOK = [[-1,0],[1,0],[0,-1],[0,1]];

  const colorOf = p => (p ? (p === p.toUpperCase() ? 'w' : 'b') : null);
  const typeOf = p => (p ? p.toLowerCase() : null);
  const other = c => (c === 'w' ? 'b' : 'w');
  const sqName = i => 'abcdefgh'[i % 8] + (8 - (i >> 3));
  const sqIndex = n => (8 - parseInt(n[1], 10)) * 8 + 'abcdefgh'.indexOf(n[0]);

  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  function parseFEN(fen) {
    const [pos, turn, castle, ep, half, full] = fen.trim().split(/\s+/);
    const board = new Array(64).fill(null);
    let i = 0;
    for (const ch of pos) {
      if (ch === '/') continue;
      if (/\d/.test(ch)) i += parseInt(ch, 10);
      else board[i++] = ch;
    }
    return {
      board,
      turn: turn || 'w',
      castling: {
        K: !!castle && castle.includes('K'), Q: !!castle && castle.includes('Q'),
        k: !!castle && castle.includes('k'), q: !!castle && castle.includes('q'),
      },
      ep: ep && ep !== '-' ? sqIndex(ep) : -1,
      half: parseInt(half || '0', 10),
      full: parseInt(full || '1', 10),
    };
  }

  function toFEN(s) {
    let out = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = s.board[r * 8 + c];
        if (!p) empty++;
        else { if (empty) out += empty; empty = 0; out += p; }
      }
      if (empty) out += empty;
      if (r < 7) out += '/';
    }
    let cs = (s.castling.K ? 'K' : '') + (s.castling.Q ? 'Q' : '') + (s.castling.k ? 'k' : '') + (s.castling.q ? 'q' : '');
    return `${out} ${s.turn} ${cs || '-'} ${s.ep >= 0 ? sqName(s.ep) : '-'} ${s.half} ${s.full}`;
  }

  // Schlüssel für Stellungswiederholung
  function positionKey(s) {
    return s.board.map(p => p || '.').join('') + s.turn +
      (s.castling.K ? 'K' : '') + (s.castling.Q ? 'Q' : '') + (s.castling.k ? 'k' : '') + (s.castling.q ? 'q' : '') + s.ep;
  }

  // Liefert die Felder der Figuren von Farbe `by`, die Feld `sq` angreifen.
  // Mit any=true wird schon beim ersten Treffer abgebrochen.
  function attackers(b, sq, by, any) {
    const res = [];
    const r = sq >> 3, c = sq % 8;
    const up = by === 'w';
    // Bauern
    const pr = up ? r + 1 : r - 1;
    if (pr >= 0 && pr < 8) {
      for (const dc of [-1, 1]) {
        const cc = c + dc;
        if (cc < 0 || cc > 7) continue;
        const p = b[pr * 8 + cc];
        if (p === (up ? 'P' : 'p')) { res.push(pr * 8 + cc); if (any) return res; }
      }
    }
    const N = up ? 'N' : 'n', K = up ? 'K' : 'k', B = up ? 'B' : 'b', R = up ? 'R' : 'r', Q = up ? 'Q' : 'q';
    for (const [dr, dc] of KNIGHT) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
      if (b[rr * 8 + cc] === N) { res.push(rr * 8 + cc); if (any) return res; }
    }
    for (const [dr, dc] of KING) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
      if (b[rr * 8 + cc] === K) { res.push(rr * 8 + cc); if (any) return res; }
    }
    for (const [dirs, a] of [[BISHOP, B], [ROOK, R]]) {
      for (const [dr, dc] of dirs) {
        let rr = r + dr, cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
          const p = b[rr * 8 + cc];
          if (p) {
            if (p === a || p === Q) { res.push(rr * 8 + cc); if (any) return res; }
            break;
          }
          rr += dr; cc += dc;
        }
      }
    }
    return res;
  }

  const isAttacked = (b, sq, by) => attackers(b, sq, by, true).length > 0;

  function kingSquare(b, color) {
    const k = color === 'w' ? 'K' : 'k';
    for (let i = 0; i < 64; i++) if (b[i] === k) return i;
    return -1;
  }

  function inCheck(s, color) {
    const k = kingSquare(s.board, color);
    return k >= 0 && isAttacked(s.board, k, other(color));
  }

  // Pseudolegale Züge (König kann evtl. im Schach stehen)
  function pseudoMoves(s, capturesOnly) {
    const b = s.board, us = s.turn, them = other(us);
    const moves = [];
    const add = (from, to, flag, promo) => {
      const captured = flag === 'ep' ? (us === 'w' ? 'p' : 'P') : b[to];
      moves.push({ from, to, piece: b[from], captured: captured || null, flag: flag || null, promo: promo || null });
    };
    for (let i = 0; i < 64; i++) {
      const p = b[i];
      if (!p || colorOf(p) !== us) continue;
      const t = typeOf(p), r = i >> 3, c = i % 8;
      if (t === 'p') {
        const dir = us === 'w' ? -1 : 1;
        const startRow = us === 'w' ? 6 : 1;
        const lastRow = us === 'w' ? 0 : 7;
        const one = i + dir * 8;
        const pushPromo = (from, to) => {
          if ((to >> 3) === lastRow) for (const pr of ['q', 'r', 'b', 'n']) add(from, to, null, us === 'w' ? pr.toUpperCase() : pr);
          else add(from, to);
        };
        if (!capturesOnly || (one >> 3) === lastRow) {
          if (one >= 0 && one < 64 && !b[one]) {
            pushPromo(i, one);
            const two = i + dir * 16;
            if (!capturesOnly && r === startRow && !b[two]) add(i, two, 'double');
          }
        }
        for (const dc of [-1, 1]) {
          const cc = c + dc;
          if (cc < 0 || cc > 7) continue;
          const to = (r + dir) * 8 + cc;
          if (to < 0 || to > 63) continue;
          if (b[to] && colorOf(b[to]) === them) pushPromo(i, to);
          else if (to === s.ep) add(i, to, 'ep');
        }
      } else if (t === 'n' || t === 'k') {
        for (const [dr, dc] of t === 'n' ? KNIGHT : KING) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
          const to = rr * 8 + cc;
          if (b[to] && colorOf(b[to]) === us) continue;
          if (capturesOnly && !b[to]) continue;
          add(i, to);
        }
        if (t === 'k' && !capturesOnly) {
          if (us === 'w' && i === 60) {
            if (s.castling.K && !b[61] && !b[62] && b[63] === 'R' &&
              !isAttacked(b, 60, 'b') && !isAttacked(b, 61, 'b') && !isAttacked(b, 62, 'b')) add(60, 62, 'K');
            if (s.castling.Q && !b[59] && !b[58] && !b[57] && b[56] === 'R' &&
              !isAttacked(b, 60, 'b') && !isAttacked(b, 59, 'b') && !isAttacked(b, 58, 'b')) add(60, 58, 'Q');
          }
          if (us === 'b' && i === 4) {
            if (s.castling.k && !b[5] && !b[6] && b[7] === 'r' &&
              !isAttacked(b, 4, 'w') && !isAttacked(b, 5, 'w') && !isAttacked(b, 6, 'w')) add(4, 6, 'K');
            if (s.castling.q && !b[3] && !b[2] && !b[1] && b[0] === 'r' &&
              !isAttacked(b, 4, 'w') && !isAttacked(b, 3, 'w') && !isAttacked(b, 2, 'w')) add(4, 2, 'Q');
          }
        }
      } else {
        const dirs = t === 'b' ? BISHOP : t === 'r' ? ROOK : BISHOP.concat(ROOK);
        for (const [dr, dc] of dirs) {
          let rr = r + dr, cc = c + dc;
          while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
            const to = rr * 8 + cc;
            if (b[to]) {
              if (colorOf(b[to]) === them) add(i, to);
              break;
            }
            if (!capturesOnly) add(i, to);
            rr += dr; cc += dc;
          }
        }
      }
    }
    return moves;
  }

  function makeMove(s, m) {
    const b = s.board.slice();
    const us = s.turn;
    const piece = b[m.from];
    b[m.to] = m.promo || piece;
    b[m.from] = null;
    if (m.flag === 'ep') b[(m.from >> 3) * 8 + (m.to % 8)] = null;
    if (m.flag === 'K') { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = null; }
    if (m.flag === 'Q') { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = null; }
    const castling = { ...s.castling };
    if (piece === 'K') { castling.K = false; castling.Q = false; }
    if (piece === 'k') { castling.k = false; castling.q = false; }
    if (m.from === 63 || m.to === 63) castling.K = false;
    if (m.from === 56 || m.to === 56) castling.Q = false;
    if (m.from === 7 || m.to === 7) castling.k = false;
    if (m.from === 0 || m.to === 0) castling.q = false;
    return {
      board: b,
      turn: other(us),
      castling,
      ep: m.flag === 'double' ? (m.from + m.to) / 2 : -1,
      half: typeOf(piece) === 'p' || m.captured ? 0 : s.half + 1,
      full: us === 'b' ? s.full + 1 : s.full,
    };
  }

  function legalMoves(s, capturesOnly) {
    const us = s.turn;
    return pseudoMoves(s, capturesOnly).filter(m => !inCheck(makeMove(s, m), us));
  }

  function toSAN(s, m, legal) {
    legal = legal || legalMoves(s);
    let str;
    if (m.flag === 'K') str = 'O-O';
    else if (m.flag === 'Q') str = 'O-O-O';
    else {
      const t = typeOf(m.piece);
      if (t === 'p') {
        str = m.captured ? 'abcdefgh'[m.from % 8] + 'x' : '';
        str += sqName(m.to);
        if (m.promo) str += '=' + m.promo.toUpperCase();
      } else {
        str = t.toUpperCase();
        const others = legal.filter(o => o.to === m.to && o.from !== m.from && o.piece === m.piece);
        if (others.length) {
          const sameFile = others.some(o => o.from % 8 === m.from % 8);
          const sameRank = others.some(o => (o.from >> 3) === (m.from >> 3));
          if (!sameFile) str += 'abcdefgh'[m.from % 8];
          else if (!sameRank) str += String(8 - (m.from >> 3));
          else str += sqName(m.from);
        }
        if (m.captured) str += 'x';
        str += sqName(m.to);
      }
    }
    const ns = makeMove(s, m);
    if (inCheck(ns, ns.turn)) str += legalMoves(ns).length ? '+' : '#';
    return str;
  }

  const cleanSAN = san => san.replace(/[+#!?]/g, '');

  function moveFromSAN(s, san) {
    const legal = legalMoves(s);
    const want = cleanSAN(san);
    return legal.find(m => cleanSAN(toSAN(s, m, legal)) === want) || null;
  }

  // ---------- Bewertung ----------
  function isEndgame(b) {
    let queens = 0, minors = 0;
    for (const p of b) {
      if (!p) continue;
      const t = typeOf(p);
      if (t === 'q') queens++;
      else if (t === 'n' || t === 'b' || t === 'r') minors++;
    }
    return queens === 0 || (queens <= 2 && minors <= 2);
  }

  // Bewertung aus Sicht von Weiß in Centibauern
  function evaluateWhite(s) {
    const b = s.board;
    const end = isEndgame(b);
    let score = 0, matW = 0, matB = 0;
    let bishopsW = 0, bishopsB = 0;
    for (let i = 0; i < 64; i++) {
      const p = b[i];
      if (!p) continue;
      const t = typeOf(p);
      const white = p === p.toUpperCase();
      const idx = white ? i : i ^ 56;
      const table = t === 'k' && end ? PST.kEnd : PST[t];
      const v = VALUE[t] + table[idx];
      if (white) { score += v; matW += VALUE[t]; if (t === 'b') bishopsW++; }
      else { score -= v; matB += VALUE[t]; if (t === 'b') bishopsB++; }
    }
    if (bishopsW >= 2) score += 30;
    if (bishopsB >= 2) score -= 30;
    // Im Endspiel den gegnerischen König an den Rand drängen
    if (end && Math.abs(matW - matB) >= 300) {
      const winner = matW > matB ? 'w' : 'b';
      const wk = kingSquare(b, winner), lk = kingSquare(b, other(winner));
      if (wk >= 0 && lk >= 0) {
        const lr = lk >> 3, lc = lk % 8;
        const centerDist = Math.max(3 - lr, lr - 4) + Math.max(3 - lc, lc - 4);
        const kd = Math.abs((wk >> 3) - lr) + Math.abs((wk % 8) - lc);
        const bonus = centerDist * 10 + (14 - kd) * 4;
        score += winner === 'w' ? bonus : -bonus;
      }
    }
    return score;
  }

  const evaluate = s => (s.turn === 'w' ? 1 : -1) * evaluateWhite(s);

  function orderMoves(moves) {
    for (const m of moves) {
      let o = 0;
      if (m.captured) o += 10 * VALUE[typeOf(m.captured)] - VALUE[typeOf(m.piece)] + 1000;
      if (m.promo) o += VALUE[typeOf(m.promo)] + 900;
      if (m.flag === 'K' || m.flag === 'Q') o += 50;
      m._o = o;
    }
    moves.sort((a, b) => b._o - a._o);
    return moves;
  }

  function quiesce(s, alpha, beta, ctx, qd) {
    ctx.nodes++;
    const stand = evaluate(s);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (qd > 6) return alpha;
    const moves = orderMoves(pseudoMoves(s, true));
    const us = s.turn;
    for (const m of moves) {
      // Delta-Pruning: hoffnungslose Schlagzüge überspringen
      if (!m.promo && stand + VALUE[typeOf(m.captured)] + 200 < alpha) continue;
      const ns = makeMove(s, m);
      if (inCheck(ns, us)) continue;
      const sc = -quiesce(ns, -beta, -alpha, ctx, qd + 1);
      if (sc >= beta) return beta;
      if (sc > alpha) alpha = sc;
    }
    return alpha;
  }

  function negamax(s, depth, alpha, beta, ply, ctx) {
    if (depth <= 0) return quiesce(s, alpha, beta, ctx, 0);
    ctx.nodes++;
    const moves = orderMoves(legalMoves(s));
    if (!moves.length) return inCheck(s, s.turn) ? -MATE + ply : 0;
    if (s.half >= 100) return 0;
    for (const m of moves) {
      const ns = makeMove(s, m);
      // Schach-Verlängerung: Schachgebote eine Stufe tiefer prüfen
      const ext = inCheck(ns, ns.turn) && ply < 6 ? 1 : 0;
      const sc = -negamax(ns, depth - 1 + ext, -beta, -alpha, ply + 1, ctx);
      if (sc >= beta) return beta;
      if (sc > alpha) alpha = sc;
    }
    return alpha;
  }

  // Bewertet jeden legalen Zug genau (für den Trainer). Sortiert, bester zuerst.
  function analyzeAll(s, depth) {
    const ctx = { nodes: 0 };
    const moves = orderMoves(legalMoves(s));
    const res = moves.map(m => ({ move: m, score: -negamax(makeMove(s, m), depth - 1, -INF, INF, 1, ctx) }));
    res.sort((a, b) => b.score - a.score);
    return res;
  }

  // Bester Zug mit Alpha-Beta und iterativer Vertiefung
  function bestMove(s, depth) {
    const ctx = { nodes: 0 };
    let moves = orderMoves(legalMoves(s));
    if (!moves.length) return null;
    let best = moves[0], bestScore = -INF;
    for (let d = 1; d <= depth; d++) {
      let alpha = -INF;
      const scored = [];
      for (const m of moves) {
        const sc = -negamax(makeMove(s, m), d - 1, -INF, -alpha, 1, ctx);
        scored.push([m, sc]);
        if (sc > alpha) { alpha = sc; best = m; bestScore = sc; }
      }
      // Bester Zug zuerst für die nächste Tiefe
      scored.sort((a, b) => b[1] - a[1]);
      moves = scored.map(x => x[0]);
      if (bestScore > MATE - 100) break;
    }
    return { move: best, score: bestScore, nodes: ctx.nodes };
  }

  function insufficientMaterial(b) {
    const pieces = b.filter(p => p && typeOf(p) !== 'k');
    if (pieces.length === 0) return true;
    if (pieces.length === 1 && (typeOf(pieces[0]) === 'n' || typeOf(pieces[0]) === 'b')) return true;
    return false;
  }

  const Engine = {
    VALUE, MATE, START_FEN, parseFEN, toFEN, positionKey, legalMoves, makeMove, inCheck,
    toSAN, cleanSAN, moveFromSAN, evaluateWhite, analyzeAll, bestMove, attackers, isAttacked,
    colorOf, typeOf, other, sqName, sqIndex, insufficientMaterial, kingSquare,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(this);
