// =====================================================================
// ia_expert_original.js
// =====================================================================
// Cópia fiel da IA Expert como estava no script.js em 21/set/2026.
// Este arquivo é SOMENTE leitura — não é carregado pelo jogo.
// Serve como:
//   1) Backup de segurança (caso algo se perca na refatoração)
//   2) Base para comparação com a versão futura "1 cérebro"
//
// Estrutura deste arquivo:
//   Região 1 (linhas ~XXX) : IA original (minimax com transposição)
//   Região 2 (linhas ~XXX) : Camadas INVENCIVEL_V1 + STRATEGIC_V1
//   Região 3 (linhas ~XXX) : Camadas ECONOMICA até MELHORIAS_EXTRA
//
// Total original: ~5.730 linhas no script.js
// =====================================================================

// =====================================================================
// REGIÃO 1 — IA original (minimax com transposição)
// Origem: script.js linhas 2609–2859
// =====================================================================

    // ===== IA completa (minimax com transposição) =====
    var transpositionTable = new Map();
    function hashState(pos, pH, pV) {
      var key = pos[0][0]+','+pos[0][1]+','+pos[1][0]+','+pos[1][1];
      key += '|'+pH.length+':'+pH.map(function(w){return w[0]+','+w[1];}).join(';');
      key += '|'+pV.length+':'+pV.map(function(w){return w[0]+','+w[1];}).join(';');
      return key;
    }
    function isRecentState(key) {
      for (var i = Math.max(0, positionHistory.length - 8); i < positionHistory.length; i++) {
        if (positionHistory[i] === key) return true;
      }
      return false;
    }
    function canWinNext(player, pH, pV, positions) {
      var moves = legalMoves(player, pH, pV, positions);
      for (var i = 0; i < moves.length; i++) {
        if (moves[i][0] === WIN[player]) return true;
      }
      return false;
    }
    function evaluateExpert(pos, pH, pV, walls) {
      var d0 = bfsDist(0, pH, pV, pos);
      var d1 = bfsDist(1, pH, pV, pos);
      if (d1 === 0) return 100000;
      if (d0 === 0) return -100000;
      var mob0 = legalMoves(0, pH, pV, pos).length;
      var mob1 = legalMoves(1, pH, pV, pos).length;
      var threat0 = canWinNext(0, pH, pV, pos) ? 5000 : 0;
      var threat1 = canWinNext(1, pH, pV, pos) ? 5000 : 0;
      var playerCol = pos[0][1];
      var playerRow = pos[0][0];
      var centerPenalty = 0;
      if (playerRow >= 2 && playerRow <= 6 && playerCol >= 2 && playerCol <= 6) {
        centerPenalty = 1000;
      }
      var centerDist = Math.abs(playerCol - 4) + Math.abs(playerRow - 4);
      centerPenalty += Math.max(0, 8 - centerDist) * 80;
      var blockadeBonus = mob1 <= 1 ? 800 : mob1 <= 2 ? 500 : mob1 <= 3 ? 250 : 50;
      var wallAdvantage = (walls[1] - walls[0]) * 45;
      var progressPenalty = pos[0][0] * 25;
      var progressBonus = (8 - pos[1][0]) * 20;
      var wallHoardingBonus = walls[1] * 30;
      return (d0 - d1) * 100 + (mob0 - mob1) * 20 + wallAdvantage + threat1 - threat0 + blockadeBonus - progressPenalty + progressBonus - centerPenalty + wallHoardingBonus;
    }
    function wallCandidatesExpert(pH, pV, walls, pos, iaIdx) {
      if (walls[iaIdx] <= 0) return [];
      var cands = [];
      var opp = 1 - iaIdx;
      var or = pos[opp][0], oc = pos[opp][1];
      var playerCenter = (or >= 2 && or <= 6 && oc >= 2 && oc <= 6);
      var minGain = playerCenter ? 1 : 1;
      for (var r = 0; r < N - 1; r++) {
        for (var c = 0; c < N - 1; c++) {
          if (canPlaceIA(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
            var tH = pH.concat([[r, c]]);
            var newDist = bfsDist(opp, tH, pV, pos);
            var gain = newDist - bfsDist(opp, pH, pV, pos);
            if (gain >= minGain) cands.push({r: r, c: c, ori: 'H', gain: gain});
          }
          if (canPlaceIA(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
            var tV = pV.concat([[r, c]]);
            var newDist = bfsDist(opp, pH, tV, pos);
            var gain = newDist - bfsDist(opp, pH, pV, pos);
            if (gain >= minGain) cands.push({r: r, c: c, ori: 'V', gain: gain});
          }
        }
      }
      cands.sort(function(a, b) { return b.gain - a.gain; });
      return cands;
    }
    function minimaxExpert(pos, pH, pV, walls, depth, alpha, beta, maximizing, iaIdx, startTime, timeLimit) {
      var key = hashState(pos, pH, pV);
      if (transpositionTable.has(key)) {
        var stored = transpositionTable.get(key);
        if (stored.depth >= depth) return stored.value;
      }
      var d0 = bfsDist(0, pH, pV, pos), d1 = bfsDist(1, pH, pV, pos);
      if (d1 === 0) return 100000 + depth;
      if (d0 === 0) return -100000 - depth;
      if (depth === 0 || Date.now() - startTime > timeLimit) return evaluateExpert(pos, pH, pV, walls);
      var cur = maximizing ? iaIdx : 1 - iaIdx;
      var moves = legalMoves(cur, pH, pV, pos);
      var wCands = wallCandidatesExpert(pH, pV, walls, pos, cur).slice(0, maximizing ? 80 : 50);
      var actions = [];
      for (var i = 0; i < moves.length; i++) {
        actions.push({type:'move', r:moves[i][0], c:moves[i][1], dist: Math.abs(moves[i][0] - WIN[cur])});
      }
      actions.sort(function(a,b){ return a.dist - b.dist; });
      for (var j = 0; j < wCands.length; j++) {
        actions.push({type:'wall', r:wCands[j].r, c:wCands[j].c, ori:wCands[j].ori});
      }
      if (!actions.length) return evaluateExpert(pos, pH, pV, walls);
      var bestVal = maximizing ? -Infinity : Infinity;
      for (var k = 0; k < actions.length; k++) {
        var act = actions[k];
        var npos = pos.map(function(p){ return p.slice(); });
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (act.type === 'move') npos[cur] = [act.r, act.c];
        else { if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]); else npV = pV.concat([[act.r, act.c]]); nw[cur]--; }
        var newKey = hashState(npos, npH, npV);
        if (isRecentState(newKey)) continue;
        var val = minimaxExpert(npos, npH, npV, nw, depth - 1, alpha, beta, !maximizing, iaIdx, startTime, timeLimit);
        if (maximizing) { if (val > bestVal) bestVal = val; alpha = Math.max(alpha, bestVal); }
        else { if (val < bestVal) bestVal = val; beta = Math.min(beta, bestVal); }
        if (beta <= alpha) break;
      }
      transpositionTable.set(key, {value: bestVal, depth: depth});
      return bestVal;
    }
    function iaJogarExpert() {
      var cfg = {depth: 18, mistakes: 0, wallLimit: 800, timeLimit: 1000};
      var iaIdx = 1;
      var pos = G.pos.map(function(p){ return p.slice(); });
      var pH = G.pH.slice(), pV = G.pV.slice(), walls = G.walls.slice();
      var startTime = Date.now();
      transpositionTable.clear();
      var playerRow = pos[0][0], playerCol = pos[0][1];
      var playerCenter = (playerRow >= 2 && playerRow <= 6 && playerCol >= 2 && playerCol <= 6);
      var wallsUsed = WALLS - walls[iaIdx];
      var maxWallsToUse = playerCenter ? 10 : 4;
      var bestAction = null, bestScore = -Infinity;
      for (var depth = 2; depth <= cfg.depth; depth += 2) {
        if (Date.now() - startTime > cfg.timeLimit) break;
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var wCands = wallCandidatesExpert(pH, pV, walls, pos, iaIdx).slice(0, cfg.wallLimit);
        if (!playerCenter && wallsUsed >= maxWallsToUse) wCands = [];
        var actions = [];
        if (canWinNext(0, pH, pV, pos)) {
          for (var i = 0; i < wCands.length; i++) {
            var w = wCands[i];
            var npH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
            var npV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
            if (!canWinNext(0, npH, npV, pos)) { bestAction = {type:'wall', r:w.r, c:w.c, ori:w.ori}; break; }
          }
          if (bestAction) break;
        }
        for (var i = 0; i < moves.length; i++) actions.push({type:'move', r:moves[i][0], c:moves[i][1]});
        for (var j = 0; j < wCands.length; j++) actions.push({type:'wall', r:wCands[j].r, c:wCands[j].c, ori:wCands[j].ori});
        actions.sort(function(a,b){
          if (a.type === 'wall' && b.type === 'move') return -1;
          if (a.type === 'move' && b.type === 'wall') return 1;
          return 0;
        });
        for (var k = 0; k < actions.length; k++) {
          if (Date.now() - startTime > cfg.timeLimit) break;
          var act = actions[k];
          var npos = pos.map(function(p){ return p.slice(); });
          var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
          if (act.type === 'move') npos[iaIdx] = [act.r, act.c];
          else { if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]); else npV = pV.concat([[act.r, act.c]]); nw[iaIdx]--; }
          var newKey = hashState(npos, npH, npV);
          if (isRecentState(newKey)) continue;
          var score = minimaxExpert(npos, npH, npV, nw, depth - 1, -Infinity, Infinity, false, iaIdx, startTime, cfg.timeLimit);
          if (score > bestScore) { bestScore = score; bestAction = act; }
        }
        if (bestScore > 90000) break;
      }
      if (!bestAction) {
        var moves = legalMoves(iaIdx, pH, pV, pos);
        if (moves.length) {
          moves.sort(function(a,b){ return Math.abs(a[0]-WIN[iaIdx]) - Math.abs(b[0]-WIN[iaIdx]); });
          var topMoves = moves.slice(0, Math.min(2, moves.length));
          bestAction = {type:'move', r:topMoves[Math.floor(Math.random()*topMoves.length)][0], c:topMoves[Math.floor(Math.random()*topMoves.length)][1]};
        }
      }
      if (bestAction) {
        var finalPos = pos.map(function(p){ return p.slice(); });
        var finalPH = pH.slice(), finalPV = pV.slice();
        if (bestAction.type === 'move') finalPos[iaIdx] = [bestAction.r, bestAction.c];
        else if (bestAction.ori === 'H') finalPH = pH.concat([[bestAction.r, bestAction.c]]);
        else finalPV = pV.concat([[bestAction.r, bestAction.c]]);
        positionHistory.push(hashState(finalPos, finalPH, finalPV));
        if (positionHistory.length > 8) positionHistory.shift();
      }
      return bestAction;
    }
    function nivelConfig() {
      switch (G.nivelIA) {
        case 'facil': return {depth:1, wallChance:0.15, mistakes:0.45, wallLimit:6, timeLimit:200};
        case 'medio': return {depth:3, wallChance:0.35, mistakes:0.15, wallLimit:12, timeLimit:500};
        case 'dificil': return {depth:4, wallChance:0.55, mistakes:0.05, wallLimit:18, timeLimit:800};
        case 'expert': return {depth:18, wallChance:1.0, mistakes:0.0, wallLimit:800, timeLimit:1000};
        default: return {depth:2, wallChance:0.35, mistakes:0.15, wallLimit:12, timeLimit:400};
      }
    }
    function iaJogar() {
      if (G.nivelIA === 'expert') return iaJogarExpert();
      var cfg = nivelConfig();
      var iaIdx = 1;
      var pos = G.pos.map(function(p){ return p.slice(); });
      var pH = G.pH.slice(), pV = G.pV.slice(), walls = G.walls.slice();
      var startTime = Date.now();
      transpositionTable.clear();
      if (Math.random() < cfg.mistakes) {
        var moves = legalMoves(iaIdx, pH, pV, pos);
        if (moves.length) {
          var m = moves[Math.floor(Math.random() * moves.length)];
          return {type:'move', r:m[0], c:m[1]};
        }
      }
      var bestAction = null, bestScore = -Infinity;
      for (var depth = 2; depth <= cfg.depth; depth += 2) {
        if (Date.now() - startTime > cfg.timeLimit) break;
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var wCands = wallCandidates(pH, pV, walls, pos, iaIdx).slice(0, cfg.wallLimit);
        var actions = [];
        if (canWinNext(0, pH, pV, pos)) {
          for (var i = 0; i < wCands.length; i++) {
            var w = wCands[i];
            var npH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
            var npV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
            if (!canWinNext(0, npH, npV, pos)) { bestAction = {type:'wall', r:w.r, c:w.c, ori:w.ori}; break; }
          }
          if (bestAction) break;
        }
        for (var i = 0; i < moves.length; i++) actions.push({type:'move', r:moves[i][0], c:moves[i][1]});
        for (var j = 0; j < wCands.length; j++) actions.push({type:'wall', r:wCands[j].r, c:wCands[j].c, ori:wCands[j].ori});
        for (var k = 0; k < actions.length; k++) {
          if (Date.now() - startTime > cfg.timeLimit) break;
          var act = actions[k];
          var npos = pos.map(function(p){ return p.slice(); });
          var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
          if (act.type === 'move') npos[iaIdx] = [act.r, act.c];
          else { if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]); else npV = pV.concat([[act.r, act.c]]); nw[iaIdx]--; }
          var newKey = hashState(npos, npH, npV);
          if (isRecentState(newKey)) continue;
          var score = minimax(npos, npH, npV, nw, depth - 1, -Infinity, Infinity, false, iaIdx, startTime, cfg.timeLimit);
          if (score > bestScore) { bestScore = score; bestAction = act; }
        }
        if (bestScore > 90000) break;
      }
      if (!bestAction) {
        var moves = legalMoves(iaIdx, pH, pV, pos);
        if (moves.length) {
          moves.sort(function(a,b){ return Math.abs(a[0]-WIN[iaIdx]) - Math.abs(b[0]-WIN[iaIdx]); });
          bestAction = {type:'move', r:moves[0][0], c:moves[0][1]};
        }
      }
      if (bestAction) {
        var finalPos = pos.map(function(p){ return p.slice(); });
        var finalPH = pH.slice(), finalPV = pV.slice();
        if (bestAction.type === 'move') finalPos[iaIdx] = [bestAction.r, bestAction.c];
        else if (bestAction.ori === 'H') finalPH = pH.concat([[bestAction.r, bestAction.c]]);
        else finalPV = pV.concat([[bestAction.r, bestAction.c]]);
        positionHistory.push(hashState(finalPos, finalPH, finalPV));
        if (positionHistory.length > 8) positionHistory.shift();
      }
      return bestAction;
    }


// =====================================================================
// REGIÃO 2 — Camadas INVENCIVEL_V1 + STRATEGIC_V1
// Origem: script.js linhas 4119–4652
// =====================================================================

/* ===== IA_EXPERT_INVENCIVEL_V1 ===== */
/* Expert: prioriza bloquear caminho do humano, encurtar o próprio, paredes ofensivas/defensivas */
(function () {
  if (typeof window === "undefined") return;

  function pathLen(playerIndex) {
    // usa BFS no grid 9x9 respeitando G.pH / G.pV se existir helper; senao heuristica
    if (typeof shortestPathLength === "function") {
      try { return shortestPathLength(playerIndex); } catch (e) {}
    }
    if (typeof getPathLength === "function") {
      try { return getPathLength(playerIndex); } catch (e) {}
    }
    // fallback: distancia de linha ate a meta
    if (!G || !G.pos) return 99;
    if (playerIndex === 0) return G.pos[0][0]; // P1 sobe -> row 0
    return 8 - G.pos[1][0]; // P2 desce -> row 8
  }

  function cloneWalls() {
    return {
      pH: (G.pH || []).map(function (w) { return [w[0], w[1]]; }),
      pV: (G.pV || []).map(function (w) { return [w[0], w[1]]; }),
      walls: [G.walls[0], G.walls[1]]
    };
  }

  function scorePosition() {
    // AI e index 1 quando vsIA
    var my = 1, opp = 0;
    var myPath = pathLen(my);
    var oppPath = pathLen(opp);
    // quanto menor meu caminho melhor; quanto maior o do oponente melhor
    var s = (oppPath - myPath) * 12;
    s += (G.walls[my] - G.walls[opp]) * 0.5;
    // bonus se oponente esta quase na meta e conseguimos alongar
    if (oppPath <= 2) s += 30;
    if (myPath <= 2) s += 25;
    if (oppPath <= 1) s += 50;
    return s;
  }

  function legalMovesAI() {
    if (typeof getValidMoves === "function") {
      try { return getValidMoves(1) || []; } catch (e) {}
    }
    if (typeof computeValid === "function") {
      try {
        var t = G.turn;
        G.turn = 1;
        computeValid();
        var moves = (G.validMoves || G.moves || []).slice();
        G.turn = t;
        return moves;
      } catch (e) {}
    }
    // fallback 4 direcoes
    var r = G.pos[1][0], c = G.pos[1][1];
    var out = [];
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
      if (p[0] >= 0 && p[0] < 9 && p[1] >= 0 && p[1] < 9) out.push(p);
    });
    return out;
  }

  function tryMove(r, c) {
    if (typeof doMove === "function") return doMove(r, c);
    if (typeof movePawn === "function") return movePawn(1, r, c);
    G.pos[1][0] = r; G.pos[1][1] = c;
    return true;
  }

  function tryWall(r, c, ori) {
    if (typeof placeWall === "function") return placeWall(r, c, ori);
    if (typeof canPlaceWall === "function" && !canPlaceWall(r, c, ori)) return false;
    if (ori === "H" || ori === "h") {
      G.pH.push([r, c]);
      if (G.wallOwnerH) G.wallOwnerH.push(1);
    } else {
      G.pV.push([r, c]);
      if (G.wallOwnerV) G.wallOwnerV.push(1);
    }
    G.walls[1]--;
    return true;
  }

  function undoLastWall(ori) {
    if (ori === "H" || ori === "h") {
      G.pH.pop();
      if (G.wallOwnerH) G.wallOwnerH.pop();
    } else {
      G.pV.pop();
      if (G.wallOwnerV) G.wallOwnerV.pop();
    }
    G.walls[1]++;
  }

  function evaluateWallCandidates() {
    var best = null;
    var bestScore = -1e9;
    if (G.walls[1] <= 0) return null;
    var r, c, ori, ok, sc;
    var oris = ["H", "V"];
    // varre intersecoes 0..7
    for (r = 0; r < 8; r++) {
      for (c = 0; c < 8; c++) {
        for (var oi = 0; oi < 2; oi++) {
          ori = oris[oi];
          // testa se caminho continua existindo
          var beforeOpp = pathLen(0);
          var beforeMe = pathLen(1);
          var placed = false;
          try {
            if (typeof canPlaceWall === "function") {
              if (!canPlaceWall(r, c, ori)) continue;
            }
            // simula
            if (ori === "H") {
              if ((G.pH || []).some(function (w) { return w[0] === r && w[1] === c; })) continue;
              G.pH.push([r, c]);
              if (G.wallOwnerH) G.wallOwnerH.push(1);
            } else {
              if ((G.pV || []).some(function (w) { return w[0] === r && w[1] === c; })) continue;
              G.pV.push([r, c]);
              if (G.wallOwnerV) G.wallOwnerV.push(1);
            }
            G.walls[1]--;
            placed = true;
            // paths ainda existem?
            var afterOpp = pathLen(0);
            var afterMe = pathLen(1);
            if (afterOpp >= 99 || afterMe >= 99) {
              // invalido se bloqueia totalmente (regras Quoridor)
              undoLastWall(ori);
              placed = false;
              continue;
            }
            sc = (afterOpp - beforeOpp) * 20 + (beforeMe - afterMe) * 14;
            // expert: paredes so se alongam oponente de verdade ou salvam
            if (afterOpp <= beforeOpp && afterMe >= beforeMe) sc -= 40;
            if (beforeOpp <= 3 && afterOpp > beforeOpp) sc += 40;
            if (sc > bestScore) {
              bestScore = sc;
              best = { type: "wall", r: r, c: c, ori: ori, score: sc };
            }
            undoLastWall(ori);
            placed = false;
          } catch (e) {
            if (placed) undoLastWall(ori);
          }
        }
      }
    }
    if (best && best.score >= 8) return best;
    return null;
  }

  function evaluateMoves() {
    var moves = legalMovesAI();
    var best = null;
    var bestScore = -1e9;
    var i, m, pr, pc, sc;
    pr = G.pos[1][0];
    pc = G.pos[1][1];
    for (i = 0; i < moves.length; i++) {
      m = moves[i];
      var nr = Array.isArray(m) ? m[0] : m.r;
      var nc = Array.isArray(m) ? m[1] : m.c;
      G.pos[1][0] = nr;
      G.pos[1][1] = nc;
      sc = scorePosition();
      // preferir avancar em direcao a meta (row 8)
      sc += (nr - pr) * 3;
      if (nr === 8) sc += 1000;
      if (sc > bestScore) {
        bestScore = sc;
        best = { type: "move", r: nr, c: nc, score: sc };
      }
      G.pos[1][0] = pr;
      G.pos[1][1] = pc;
    }
    return best;
  }

  function aiExpertDecide() {
    if (!G || G.over || G.vsIA === false) return null;
    // 1) se posso ganhar andando, ando
    var move = evaluateMoves();
    if (move && move.r === 8) return move;
    // 2) parede se prejudica humano de verdade
    var wall = evaluateWallCandidates();
    var opp = pathLen(0);
    var me = pathLen(1);
    // expert usa parede com frequencia alta quando humano esta na frente ou perto
    if (wall && (opp <= me + 1 || opp <= 4 || G.walls[1] >= 5)) {
      if (!move || wall.score > (move.score || 0) - 5) return wall;
    }
    // 3) movimento otimo
    if (move) return move;
    if (wall) return wall;
    return null;
  }

  function aiExpertPlay() {
    if (!G || !G.vsIA || G.over) return;
    if (G.turn !== 1) return;
    var dec = aiExpertDecide();
    if (!dec) {
      if (typeof nextTurn === "function") nextTurn();
      return;
    }
    if (dec.type === "move") {
      try {
        if (typeof doMove === "function") doMove(dec.r, dec.c);
        else {
          G.pos[1][0] = dec.r;
          G.pos[1][1] = dec.c;
          if (typeof nextTurn === "function") nextTurn();
        }
      } catch (e) { console.warn(e); }
    } else if (dec.type === "wall") {
      try {
        if (typeof placeWall === "function") placeWall(dec.r, dec.c, dec.ori);
        else {
          tryWall(dec.r, dec.c, dec.ori);
          if (typeof nextTurn === "function") nextTurn();
        }
      } catch (e) { console.warn(e); }
    }
    if (typeof draw === "function") draw();
  }

  // expõe e engancha no nivel expert
  window.aiExpertPlay = aiExpertPlay;
  window.aiExpertDecide = aiExpertDecide;

  // se existir iaPlay / playAI / aiMove, envelopa quando nivel expert
  ["iaPlay", "playAI", "aiMove", "fazerJogadaIA", "aiTurn"].forEach(function (name) {
    if (typeof window[name] === "function") {
      var orig = window[name];
      window[name] = function () {
        if (G && G.vsIA && String(G.nivelIA || "").toLowerCase() === "expert") {
          return aiExpertPlay();
        }
        return orig.apply(this, arguments);
      };
    }
  });

  console.log("IA_EXPERT_INVENCIVEL_V1 carregada");
})();



// ===================== IA_EXPERT_STRATEGIC_V1 =====================
(function () {
    // Função auxiliar para obter o caminho BFS de um jogador (usa bfsDist existente)
    function pathLength(player, pH, pV, pos) {
        return bfsDist(player, pH, pV, pos);
    }

    // Nova avaliação: diferença de caminhos + bônus de ameaça
    function evaluateStrategic(pos, pH, pV, walls) {
        var d0 = pathLength(0, pH, pV, pos); // humano
        var d1 = pathLength(1, pH, pV, pos); // IA
        if (d0 === 0) return -100000;
        if (d1 === 0) return 100000;

        var score = d0 - d1;  // positivo = IA melhor

        // Bônus se oponente está a 1-2 passos da vitória e IA pode alongar
        var threatBonus = 0;
        if (d0 <= 2) {
            threatBonus = 2000 * (3 - d0); // maior se mais perto
        }
        score += threatBonus;

        // Bônus de mobilidade (opcional)
        var mob0 = legalMoves(0, pH, pV, pos).length;
        var mob1 = legalMoves(1, pH, pV, pos).length;
        score += (mob1 - mob0) * 10;

        return score;
    }

    // Gera movimentos legais completos (inclui saltos e diagonais)
    function getAllLegalMoves(player, pH, pV, pos) {
        return legalMoves(player, pH, pV, pos);
    }

    // Verifica se uma parede mantém ambos com caminho
    function wallIsLegal(r, c, ori, pH, pV, walls, pos, player) {
        return canPlaceIA(r, c, ori, pH, pV, walls[player], pos);
    }

    // Verifica se pode ganhar agora
    function canWinNow(player, pH, pV, pos) {
        var moves = getAllLegalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            if (moves[i][0] === WIN[player]) return true;
        }
        return false;
    }

    // Paredes candidatas estratégicas
    function getStrategicWalls(pH, pV, walls, pos, iaIdx) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var currentOppDist = pathLength(opp, pH, pV, pos);
        var cands = [];
        for (var r = 0; r < N - 1; r++) {
            for (var c = 0; c < N - 1; c++) {
                if (wallIsLegal(r, c, 'H', pH, pV, walls, pos, iaIdx)) {
                    var tH = pH.concat([[r, c]]);
                    var newOppDist = pathLength(opp, tH, pV, pos);
                    var selfDist = pathLength(iaIdx, tH, pV, pos);
                    var gain = newOppDist - currentOppDist;
                    var selfPenalty = Math.max(0, selfDist - pathLength(iaIdx, pH, pV, pos));
                    var score = gain * 10 - selfPenalty * 5;
                    cands.push({r: r, c: c, ori: 'H', score: score});
                }
                if (wallIsLegal(r, c, 'V', pH, pV, walls, pos, iaIdx)) {
                    var tV = pV.concat([[r, c]]);
                    var newOppDist = pathLength(opp, pH, tV, pos);
                    var selfDist = pathLength(iaIdx, pH, tV, pos);
                    var gain = newOppDist - currentOppDist;
                    var selfPenalty = Math.max(0, selfDist - pathLength(iaIdx, pH, pV, pos));
                    var score = gain * 10 - selfPenalty * 5;
                    cands.push({r: r, c: c, ori: 'V', score: score});
                }
            }
        }
        cands.sort(function(a, b) { return b.score - a.score; });
        return cands;
    }

    // Minimax com profundidade iterativa e alfa-beta
    function minimaxStrategic(pos, pH, pV, walls, depth, alpha, beta, maximizing, iaIdx, startTime, timeLimit) {
        var key = hashState(pos, pH, pV);
        if (transpositionTable.has(key)) {
            var stored = transpositionTable.get(key);
            if (stored.depth >= depth) return stored.value;
        }
        var d0 = pathLength(0, pH, pV, pos);
        var d1 = pathLength(1, pH, pV, pos);
        if (d1 === 0) return 100000 + depth;
        if (d0 === 0) return -100000 - depth;
        if (depth === 0 || Date.now() - startTime > timeLimit) {
            return evaluateStrategic(pos, pH, pV, walls);
        }

        var cur = maximizing ? iaIdx : 1 - iaIdx;
        var moves = getAllLegalMoves(cur, pH, pV, pos);
        var wCands = getStrategicWalls(pH, pV, walls, pos, cur).slice(0, 20);
        var actions = [];
        for (var i = 0; i < moves.length; i++) {
            actions.push({type: 'move', r: moves[i][0], c: moves[i][1], score: null});
        }
        for (var j = 0; j < wCands.length; j++) {
            actions.push({type: 'wall', r: wCands[j].r, c: wCands[j].c, ori: wCands[j].ori, score: null});
        }
        if (!actions.length) return evaluateStrategic(pos, pH, pV, walls);

        var bestVal = maximizing ? -Infinity : Infinity;
        for (var k = 0; k < actions.length; k++) {
            if (Date.now() - startTime > timeLimit) break;
            var act = actions[k];
            var npos = pos.map(function(p){ return p.slice(); });
            var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
            if (act.type === 'move') {
                npos[cur] = [act.r, act.c];
            } else {
                if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]);
                else npV = pV.concat([[act.r, act.c]]);
                nw[cur]--;
            }
            var newKey = hashState(npos, npH, npV);
            if (isRecentState(newKey)) continue;
            var val = minimaxStrategic(npos, npH, npV, nw, depth - 1, alpha, beta, !maximizing, iaIdx, startTime, timeLimit);
            if (maximizing) {
                if (val > bestVal) bestVal = val;
                alpha = Math.max(alpha, bestVal);
            } else {
                if (val < bestVal) bestVal = val;
                beta = Math.min(beta, bestVal);
            }
            if (beta <= alpha) break;
        }
        transpositionTable.set(key, {value: bestVal, depth: depth});
        return bestVal;
    }

    // Função principal da IA Expert Estratégica
    function iaJogarExpertStrategic() {
        var iaIdx = 1;
        var pos = G.pos.map(function(p){ return p.slice(); });
        var pH = G.pH.slice(), pV = G.pV.slice(), walls = G.walls.slice();
        var startTime = Date.now();
        var timeLimit = 400; // ms, para mobile
        transpositionTable.clear();

        // 1. Verifica vitória imediata
        var winMoves = getAllLegalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) {
            // Escolhe o primeiro e registra histórico
            positionHistory.push(hashState(pos, pH, pV));
            if (positionHistory.length > 8) positionHistory.shift();
            return {type: 'move', r: winMoves[0][0], c: winMoves[0][1]};
        }

        // 2. Bloquear ameaça imediata do oponente (caminho dele == 1)
        var oppDist = pathLength(0, pH, pV, pos); // oponente é índice 0 (humano)
        if (oppDist === 1) {
            var blockingWalls = getStrategicWalls(pH, pV, walls, pos, iaIdx).filter(function(w){
                return w.score > 0;
            });
            if (blockingWalls.length > 0) {
                var best = blockingWalls[0];
                positionHistory.push(hashState(pos, pH, pV));
                if (positionHistory.length > 8) positionHistory.shift();
                return {type: 'wall', r: best.r, c: best.c, ori: best.ori};
            }
        }

        // 3. Se oponente a 2 passos, priorizar paredes fortes
        if (oppDist === 2) {
            var strongWalls = getStrategicWalls(pH, pV, walls, pos, iaIdx).filter(function(w){
                return w.score >= 10; // ganho significativo
            });
            if (strongWalls.length > 0) {
                var best2 = strongWalls[0];
                positionHistory.push(hashState(pos, pH, pV));
                if (positionHistory.length > 8) positionHistory.shift();
                return {type: 'wall', r: best2.r, c: best2.c, ori: best2.ori};
            }
        }

        // 4. Minimax iterativo
        var bestAction = null;
        var bestScore = -Infinity;
        var actionsAll = [];
        var moves = getAllLegalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            actionsAll.push({type: 'move', r: moves[i][0], c: moves[i][1]});
        }
        var wCands = getStrategicWalls(pH, pV, walls, pos, iaIdx).slice(0, 30);
        for (var j = 0; j < wCands.length; j++) {
            actionsAll.push({type: 'wall', r: wCands[j].r, c: wCands[j].c, ori: wCands[j].ori});
        }

        for (var depth = 1; depth <= 4; depth++) {
            if (Date.now() - startTime > timeLimit) break;
            var localBest = null;
            var localScore = -Infinity;
            var localTop = [];

            for (var k = 0; k < actionsAll.length; k++) {
                if (Date.now() - startTime > timeLimit) break;
                var act = actionsAll[k];
                var npos = pos.map(function(p){ return p.slice(); });
                var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
                if (act.type === 'move') {
                    npos[iaIdx] = [act.r, act.c];
                } else {
                    if (act.ori === 'H') npH = pH.concat([[act.r, act.c]]);
                    else npV = pV.concat([[act.r, act.c]]);
                    nw[iaIdx]--;
                }
                var newKey = hashState(npos, npH, npV);
                if (isRecentState(newKey)) continue;
                var val = minimaxStrategic(npos, npH, npV, nw, depth - 1, -Infinity, Infinity, false, iaIdx, startTime, timeLimit);
                if (val > localScore) {
                    localScore = val;
                    localBest = act;
                    localTop = [{act: act, score: val}];
                } else if (localTop.length < 3 && val > localScore - 100) {
                    localTop.push({act: act, score: val});
                }
            }

            if (localBest) {
                bestAction = localBest;
                bestScore = localScore;
                // guarda top 3 para imprevisibilidade
                window._iaTopActions = localTop;
            }
            if (bestScore > 90000) break;
        }

        // 5. Fallback: avanço no menor caminho
        if (!bestAction) {
            var avancos = moves.filter(function(m){ return m[0] > pos[1][0]; });
            if (avancos.length) {
                avancos.sort(function(a,b){ return a[0] - b[0]; });
                bestAction = {type: 'move', r: avancos[0][0], c: avancos[0][1]};
            } else if (moves.length) {
                bestAction = {type: 'move', r: moves[0][0], c: moves[0][1]};
            }
        }

        // 6. Imprevisibilidade: escolher entre top 3
        if (window._iaTopActions && window._iaTopActions.length > 1) {
            var total = 0;
            for (var i = 0; i < window._iaTopActions.length; i++) {
                total += Math.max(1, window._iaTopActions[i].score + 10000);
            }
            var rand = Math.random() * total;
            for (var i = 0; i < window._iaTopActions.length; i++) {
                rand -= Math.max(1, window._iaTopActions[i].score + 10000);
                if (rand <= 0) {
                    bestAction = window._iaTopActions[i].act;
                    break;
                }
            }
        }

        // Atualiza histórico
        if (bestAction) {
            var finalPos = pos.map(function(p){ return p.slice(); });
            var finalPH = pH.slice(), finalPV = pV.slice();
            if (bestAction.type === 'move') finalPos[iaIdx] = [bestAction.r, bestAction.c];
            else if (bestAction.ori === 'H') finalPH = pH.concat([[bestAction.r, bestAction.c]]);
            else finalPV = pV.concat([[bestAction.r, bestAction.c]]);
            positionHistory.push(hashState(finalPos, finalPH, finalPV));
            if (positionHistory.length > 8) positionHistory.shift();
        }
        return bestAction;
    }

    // Sobrescreve globalmente
    iaJogarExpert = iaJogarExpertStrategic;
    
})();
// ===================== FIM IA_EXPERT_STRATEGIC_V1 =====================

// =====================================================================
// REGIÃO 3 — Camadas ECONOMICA até MELHORIAS_EXTRA
// Origem: script.js linhas 5637–10581
// Contém as 15 camadas mais recentes:
//   ECONOMICA, FINAL_ESTAVEL, JUSTA, FORTE, VISAO_REAL, ECONOMICA_V2,
//   GPS, 1000_PERFIS, ANTI_BRECHA, 100_ABERTURAS_100_HIST,
//   ETAPA1_FIM_DE_JOGO, ETAPA2_BLOQUEIO_DUPLO, ETAPA3_GARGALO,
//   ETAPA4_PUNIR_PREVISIVEL, CONSOLIDADA_FINAL, MELHORIAS_EXTRA
// =====================================================================

// ===================== IA_EXPERT_ECONOMICA =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 6) ultimasPosicoes.shift();
    }

    // Funções auxiliares locais (não dependem de funções antigas)
    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function canPlaceIA(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r > 7 || c < 0 || c > 7) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
            for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var iaIdx = 1;
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];

        // 1. Vitória imediata
        var winMoves = legalMoves(1, pH, pV, pos).filter(function(m){ return m[0] === WIN[1]; });
        if (winMoves.length > 0) {
            registrar(winMoves[0][0], winMoves[0][1]);
            return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };
        }

        // 2. Bloqueio obrigatório: oponente a 1 da vitória
        var oppDist = bfsDist(0, pH, pV, pos);
        if (canWinNext(0, pH, pV, pos) || oppDist === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (canPlaceIA(r, c, 'H', pH, pV, walls[1], pos) && !canWinNext(0, pH.concat([[r, c]]), pV, pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (canPlaceIA(r, c, 'V', pH, pV, walls[1], pos) && !canWinNext(0, pH, pV.concat([[r, c]]), pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Prioridade: avançar pelo caminho mais curto (sem recuar, sem repetir)
        var moves = legalMoves(1, pH, pV, pos);
        var avancos = moves.filter(function(m){ return m[0] > pos[1][0]; });
        var laterais = moves.filter(function(m){ return m[0] === pos[1][0]; });

        // Filtra repetidos
        var avancosUnicos = avancos.filter(function(m){ return !jaVisitou(m[0], m[1]); });
        var lateraisUnicas = laterais.filter(function(m){ return !jaVisitou(m[0], m[1]); });
        if (avancosUnicos.length === 0) avancosUnicos = avancos;
        if (lateraisUnicas.length === 0) lateraisUnicas = laterais;

        // Ordena avanços por menor distância BFS
        function ordenarPorDist(lista) {
            lista.sort(function(a, b) {
                var da = bfsDist(1, pH, pV, [[a[0], a[1]], pos[1]]);
                var db = bfsDist(1, pH, pV, [[b[0], b[1]], pos[1]]);
                return da - db;
            });
        }
        ordenarPorDist(avancosUnicos);
        ordenarPorDist(lateraisUnicas);

        // Se houver avanço, usa imediatamente (economia de paredes)
        if (avancosUnicos.length > 0) {
            var m = avancosUnicos[0];
            registrar(m[0], m[1]);
            return { type: 'move', r: m[0], c: m[1] };
        }

        // Se houver lateral que encurta ou mantém, usa
        if (lateraisUnicas.length > 0) {
            var l = lateraisUnicas[0];
            registrar(l[0], l[1]);
            return { type: 'move', r: l[0], c: l[1] };
        }

        // 4. Se não houver movimento (raro), tenta parede curta para desbloquear
        var meuDist = bfsDist(1, pH, pV, pos);
        if (meuDist >= 99) {
            // tenta remover bloqueio do próprio caminho? Regras não permitem remover paredes.
            // então só avança qualquer movimento legal
            if (moves.length > 0) {
                registrar(moves[0][0], moves[0][1]);
                return { type: 'move', r: moves[0][0], c: moves[0][1] };
            }
        }

        // 5. Economia: só coloca parede se oponente estiver perto (dist <= 2)
        // e se a parede atrasar significativamente sem prejudicar a própria IA
        if (oppDist <= 2 && walls[1] > 0) {
            var melhores = [];
            for (var rw = 0; rw < 8; rw++) for (var cw = 0; cw < 8; cw++) {
                if (canPlaceIA(rw, cw, 'H', pH, pV, walls[1], pos)) {
                    var tH = pH.concat([[rw, cw]]);
                    var novoOpp = bfsDist(0, tH, pV, pos);
                    var novoMeu = bfsDist(1, tH, pV, pos);
                    if (novoOpp > oppDist && novoMeu <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'H', score: (novoOpp - oppDist) * 10 - Math.max(0, novoMeu - meuDist) * 5 });
                    }
                }
                if (canPlaceIA(rw, cw, 'V', pH, pV, walls[1], pos)) {
                    var tV = pV.concat([[rw, cw]]);
                    var novoOppV = bfsDist(0, pH, tV, pos);
                    var novoMeuV = bfsDist(1, pH, tV, pos);
                    if (novoOppV > oppDist && novoMeuV <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'V', score: (novoOppV - oppDist) * 10 - Math.max(0, novoMeuV - meuDist) * 5 });
                    }
                }
            }
            if (melhores.length > 0) {
                melhores.sort(function(a, b){ return b.score - a.score; });
                return { type: 'wall', r: melhores[0].r, c: melhores[0].c, ori: melhores[0].ori };
            }
        }

        // 6. Fallback: qualquer movimento
        if (moves.length > 0) {
            registrar(moves[0][0], moves[0][1]);
            return { type: 'move', r: moves[0][0], c: moves[0][1] };
        }

        return null;
    }

    // Substitui a IA Expert global
    
    
    

    console.log('IA_EXPERT_ECONOMICA ATIVO');
})();
// ===================== FIM IA_EXPERT_ECONOMICA =====================

// ===================== IA_EXPERT_FINAL_ESTAVEL =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 4) ultimasPosicoes.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function paredeJaExiste(r, c, ori, pH, pV) {
        if (ori === 'H') return pH.some(function(w){ return w[0] === r && w[1] === c; });
        return pV.some(function(w){ return w[0] === r && w[1] === c; });
    }

    function canPlaceIA(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r > 7 || c < 0 || c > 7) return false;
        // Verifica sobreposição explícita
        if (paredeJaExiste(r, c, ori, pH, pV)) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
            for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];

        // 1. Vitória imediata
        var winMoves = legalMoves(1, pH, pV, pos).filter(function(m){ return m[0] === WIN[1]; });
        if (winMoves.length > 0) {
            registrar(winMoves[0][0], winMoves[0][1]);
            return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };
        }

        // 2. Bloquear ameaça imediata (oponente a 1)
        var oppDist = bfsDist(0, pH, pV, pos);
        if (canWinNext(0, pH, pV, pos) || oppDist === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (canPlaceIA(r, c, 'H', pH, pV, walls[1], pos) && !canWinNext(0, pH.concat([[r, c]]), pV, pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (canPlaceIA(r, c, 'V', pH, pV, walls[1], pos) && !canWinNext(0, pH, pV.concat([[r, c]]), pos)) {
                    return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Movimento por BFS: sempre escolhe o passo que MAIS reduz a distância.
        //    Se nenhum reduz, escolhe o que aumenta menos (contorno natural).
        var meuDist = bfsDist(1, pH, pV, pos);
        var moves = legalMoves(1, pH, pV, pos);

        var melhorMov = null;
        var melhorDist = meuDist;
        var melhorDelta = 999;
        for (var i = 0; i < moves.length; i++) {
            var m = moves[i];
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[1] = [m[0], m[1]];
            var d = bfsDist(1, pH, pV, npos);
            var delta = d - meuDist;
            var repetido = jaVisitou(m[0], m[1]);

            // Prioridade: não repetido + menor distância
            var score = -d * 10 - (repetido ? 50 : 0) - Math.abs(delta) * 0.1;
            if (melhorMov === null || score > melhorDelta) {
                melhorMov = { type: 'move', r: m[0], c: m[1] };
                melhorDist = d;
                melhorDelta = score;
            }
        }

        // Se o melhor movimento reduz a distância, faça-o imediatamente.
        if (melhorMov && melhorDist < meuDist) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }

        // 4. Economia de paredes: só usa parede se oponente próximo E parede realmente atrasa
        if (oppDist <= 2 && walls[1] > 0) {
            var melhores = [];
            for (var rw = 0; rw < 8; rw++) for (var cw = 0; cw < 8; cw++) {
                if (canPlaceIA(rw, cw, 'H', pH, pV, walls[1], pos)) {
                    var tH = pH.concat([[rw, cw]]);
                    var novoOppH = bfsDist(0, tH, pV, pos);
                    var novoMeuH = bfsDist(1, tH, pV, pos);
                    if (novoOppH > oppDist && novoMeuH <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'H', score: (novoOppH - oppDist) * 12 - Math.max(0, novoMeuH - meuDist) * 6 });
                    }
                }
                if (canPlaceIA(rw, cw, 'V', pH, pV, walls[1], pos)) {
                    var tV = pV.concat([[rw, cw]]);
                    var novoOppV = bfsDist(0, pH, tV, pos);
                    var novoMeuV = bfsDist(1, pH, tV, pos);
                    if (novoOppV > oppDist && novoMeuV <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'V', score: (novoOppV - oppDist) * 12 - Math.max(0, novoMeuV - meuDist) * 6 });
                    }
                }
            }
            if (melhores.length > 0) {
                melhores.sort(function(a, b){ return b.score - a.score; });
                var best = melhores[0];
                // Dupla checagem antes de retornar
                if (!paredeJaExiste(best.r, best.c, best.ori, pH, pV)) {
                    return { type: 'wall', r: best.r, c: best.c, ori: best.ori };
                }
            }
        }

        // 5. Fallback: movimento que menos aumenta a distância (contorno)
        if (melhorMov) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }

        return null;
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_FINAL_ESTAVEL ATIVO');
})();
// ===================== FIM IA_EXPERT_FINAL_ESTAVEL =====================

// ===================== IA_EXPERT_JUSTA =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 6) ultimasPosicoes.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    // Mesma lógica do canPlace do player (mas com estado local)
    function canPlaceInternal(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) if (pV[i][0] === r && pV[i][1] === c) return false;
        for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];

        // 1. Vitória imediata
        var winMoves = legalMoves(1, pH, pV, pos).filter(function(m){ return m[0] === WIN[1]; });
        if (winMoves.length > 0) {
            registrar(winMoves[0][0], winMoves[0][1]);
            return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };
        }

        // 2. Bloqueio de ameaça imediata
        var oppDist = bfsDist(0, pH, pV, pos);
        if (canWinNext(0, pH, pV, pos) || oppDist === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (canPlaceInternal(r, c, 'H', pH, pV, walls[1], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(0, tH, pV, pos)) return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (canPlaceInternal(r, c, 'V', pH, pV, walls[1], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(0, pH, tV, pos)) return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Avanço pelo caminho mais curto (prioridade máxima)
        var meuDist = bfsDist(1, pH, pV, pos);
        var moves = legalMoves(1, pH, pV, pos);
        var melhorMov = null, melhorDist = meuDist, melhorScore = -1e15;
        for (var i = 0; i < moves.length; i++) {
            var m = moves[i];
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[1] = [m[0], m[1]];
            var d = bfsDist(1, pH, pV, npos);
            var repetido = jaVisitou(m[0], m[1]);
            var score = -d * 10 - (repetido ? 100 : 0);
            if (score > melhorScore) {
                melhorScore = score;
                melhorDist = d;
                melhorMov = { type: 'move', r: m[0], c: m[1] };
            }
        }

        if (melhorMov && melhorDist < meuDist) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }

        // 4. Bloqueio leve quando oponente passa do meio (linha <= 4)
        var oppRow = pos[0][0];
        if (oppRow <= 4 && walls[1] > 0) {
            var melhores = [];
            for (var rw = 0; rw < 8; rw++) for (var cw = 0; cw < 8; cw++) {
                if (canPlaceInternal(rw, cw, 'H', pH, pV, walls[1], pos)) {
                    var tH2 = pH.concat([[rw, cw]]);
                    var novoOpp = bfsDist(0, tH2, pV, pos);
                    var novoMeu = bfsDist(1, tH2, pV, pos);
                    if (novoOpp > oppDist && novoMeu <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'H', score: (novoOpp - oppDist) * 10 - Math.max(0, novoMeu - meuDist) * 5 });
                    }
                }
                if (canPlaceInternal(rw, cw, 'V', pH, pV, walls[1], pos)) {
                    var tV2 = pV.concat([[rw, cw]]);
                    var novoOppV = bfsDist(0, pH, tV2, pos);
                    var novoMeuV = bfsDist(1, pH, tV2, pos);
                    if (novoOppV > oppDist && novoMeuV <= meuDist) {
                        melhores.push({ r: rw, c: cw, ori: 'V', score: (novoOppV - oppDist) * 10 - Math.max(0, novoMeuV - meuDist) * 5 });
                    }
                }
            }
            if (melhores.length > 0) {
                melhores.sort(function(a, b){ return b.score - a.score; });
                var best = melhores[0];
                if (canPlaceInternal(best.r, best.c, best.ori, pH, pV, walls[1], pos)) {
                    return { type: 'wall', r: best.r, c: best.c, ori: best.ori };
                }
            }
        }

        // 5. Fallback
        if (melhorMov) {
            registrar(melhorMov.r, melhorMov.c);
            return melhorMov;
        }
        if (moves.length > 0) {
            registrar(moves[0][0], moves[0][1]);
            return { type: 'move', r: moves[0][0], c: moves[0][1] };
        }
        return null;
    }

    // ===== OVERRIDE scheduleIA: aplica SEMPRE via canPlace + placeWall do player =====
    if (typeof scheduleIA === 'function') {
        var _origScheduleIA = scheduleIA;
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA) return;
            if (G.turn !== 1) return;
            setIAThinking(true);
            var delay = 300;
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) return;
                stopTimer();

                if (act.type === 'move') {
                    // Revalida o movimento
                    var posA = [G.pos[0].slice(), G.pos[1].slice()];
                    var pHa = (G.pH || []).slice();
                    var pVa = (G.pV || []).slice();
                    var validos = legalMoves(1, pHa, pVa, posA);
                    var okMove = validos.some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!okMove) { nextTurn(); return; }

                    // Aplica via doMove do player
                    if (typeof doMove === 'function') {
                        doMove(act.r, act.c);
                        return;
                    }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin();
                    if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    // Revalida com canPlace (mesma do player)
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        // Parede inválida — joga movimento
                        var posB = [G.pos[0].slice(), G.pos[1].slice()];
                        var mv = legalMoves(1, G.pH, G.pV, posB);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else {
                            nextTurn();
                        }
                        return;
                    }
                    // Aplica via placeWall (que também valida com canPlace)
                    if (typeof placeWall === 'function') {
                        placeWall(act.r + 1, act.c + 1, act.ori);
                        return;
                    }
                    // fallback
                    G.walls[1]--;
                    if (act.ori === 'H') { G.pH.push([act.r, act.c]); if (G.wallOwnerH) G.wallOwnerH.push(1); }
                    else { G.pV.push([act.r, act.c]); if (G.wallOwnerV) G.wallOwnerV.push(1); }
                    checkWin();
                    if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                }
            }, delay);
        };
    }

    window.iaJogarExpert = iaJogarExpert;

    console.log('IA_EXPERT_JUSTA ATIVO');
})();
// ===================== FIM IA_EXPERT_JUSTA =====================

// ===================== IA_EXPERT_FORTE =====================
(function () {
    var WIN = [0, 8];
    var ultimasPosicoes = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return ultimasPosicoes.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        ultimasPosicoes.push(posKey(r, c));
        if (ultimasPosicoes.length > 6) ultimasPosicoes.shift();
    }

    // ===== Auxiliares locais (cópia exata da lógica do player) =====
    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDist(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    // Mesma validação do player
    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    // ===== Avaliação rica =====
    function avaliar(pos, pH, pV, walls) {
        var d0 = bfsDist(0, pH, pV, pos); // oponente (player humano)
        var d1 = bfsDist(1, pH, pV, pos); // IA
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 120;               // prioridade máxima: diferença
        score += (walls[1] - walls[0]) * 30;       // vantagem de paredes
        score += pos[1][0] * 40;                   // progresso da IA
        score -= (8 - pos[0][0]) * 25;             // progresso do oponente

        if (canWinNext(1, pH, pV, pos)) score += 6000;
        if (canWinNext(0, pH, pV, pos)) score -= 6000;

        // Bônus por mobilidade da IA (rotas alternativas)
        var mobIA = legalMoves(1, pH, pV, pos).length;
        if (mobIA >= 3) score += 30;
        else if (mobIA <= 1) score -= 60;

        return score;
    }

    // ===== Geração de ações candidatas =====
    function gerarAcoes(pos, pH, pV, walls, iaIdx) {
        var acoes = [];

        // Movimentos sem recuo (ou com recuo mínimo se bloqueado)
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var avancos = moves.filter(function(m){ return m[0] > pos[iaIdx][0]; });
        var laterais = moves.filter(function(m){ return m[0] === pos[iaIdx][0]; });
        var recuos = moves.filter(function(m){ return m[0] < pos[iaIdx][0]; });

        var usar = avancos.length ? avancos : (laterais.length ? laterais : recuos);
        for (var i = 0; i < usar.length; i++) {
            acoes.push({ tipo: 'move', r: usar[i][0], c: usar[i][1] });
        }

        // Paredes que aumentam caminho do oponente
        if (walls[iaIdx] > 0) {
            var opp = 1 - iaIdx;
            var oppD = bfsDist(opp, pH, pV, pos);
            var meuD = bfsDist(iaIdx, pH, pV, pos);
            var paredes = [];
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                    var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                    if (gH > 0 && mgH <= 1) {
                        paredes.push({ tipo: 'wall', r: r, c: c, ori: 'H', ganho: gH, custo: mgH, score: gH * 15 - mgH * 8 });
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                    var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                    if (gV > 0 && mgV <= 1) {
                        paredes.push({ tipo: 'wall', r: r, c: c, ori: 'V', ganho: gV, custo: mgV, score: gV * 15 - mgV * 8 });
                    }
                }
            }
            paredes.sort(function(a, b){ return b.score - a.score; });
            for (var j = 0; j < Math.min(paredes.length, 10); j++) {
                acoes.push(paredes[j]);
            }
        }

        return acoes;
    }

    // ===== Aplicar ação em estado simulado =====
    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice();
        var npV = pV.slice();
        var nw = walls.slice();
        if (acao.tipo === 'move') {
            npos[cur] = [acao.r, acao.c];
        } else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    // ===== Decisão principal =====
    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1;
        var oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };

        // 2. Bloqueio obrigatório de ameaça imediata
        var oppD = bfsDist(oppIdx, pH, pV, pos);
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var bloqueio = null, bloqueioScore = -1e15;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var sH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        if (sH > bloqueioScore) { bloqueioScore = sH; bloqueio = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var sV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        if (sV > bloqueioScore) { bloqueioScore = sV; bloqueio = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (bloqueio) return bloqueio;
        }

        // 3. Geração de ações + minimax raso
        var acoes = gerarAcoes(pos, pH, pV, walls, iaIdx);
        if (acoes.length === 0) return null;

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);

            // Avaliação 1 ply + resposta do oponente (1 ply extra)
            var val = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);

            // Antecipação: melhor resposta do oponente
            var oppAcoes = gerarAcoes(sim.pos, sim.pH, sim.pV, sim.walls, oppIdx);
            if (oppAcoes.length > 0) {
                var piorResp = 1e15;
                for (var j = 0; j < Math.min(oppAcoes.length, 6); j++) {
                    var oa = oppAcoes[j];
                    var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, oa, oppIdx);
                    var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                    if (v2 < piorResp) piorResp = v2;
                }
                val = val * 0.4 + piorResp * 0.6;
            }

            // Anti-loop
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 80;

            if (val > melhorScore) {
                melhorScore = val;
                melhorAcao = a;
            }
        }

        if (!melhorAcao) melhorAcao = acoes[0];

        // Converte para o formato esperado
        if (melhorAcao.tipo === 'move') {
            return { type: 'move', r: melhorAcao.r, c: melhorAcao.c };
        }
        return { type: 'wall', r: melhorAcao.r, c: melhorAcao.c, ori: melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type: 'move', r: fb[0][0], c: fb[0][1] };
            }
            return null;
        }
    }

    // Override scheduleIA para aplicar SEMPRE via canPlace/placeWall
    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) return;
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_FORTE ATIVO');
})();
// ===================== FIM IA_EXPERT_FORTE =====================

// ===================== IA_EXPERT_VISAO_REAL =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    // BFS que retorna distância E caminho completo
    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                // Reconstruir caminho
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) {
        return bfsPath(player, pH, pV, pos).dist;
    }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    // Avaliação baseada em caminho real
    function avaliar(pos, pH, pV, walls) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;

        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 150;

        // Vantagem de paredes
        score += (walls[1] - walls[0]) * 25;

        // Progresso
        score += pos[1][0] * 40;
        score -= (8 - pos[0][0]) * 30;

        // Ameaças
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;

        // Penalizar se IA está atrás no caminho
        if (d1 > d0) score -= (d1 - d0) * 200;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice();
        var npV = pV.slice();
        var nw = walls.slice();
        if (acao.tipo === 'move') {
            npos[cur] = [acao.r, acao.c];
        } else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    // Gera TODAS as ações (movimentos e paredes válidas)
    function gerarAcoes(pos, pH, pV, walls, iaIdx, limiteParedes) {
        var acoes = [];
        var opp = 1 - iaIdx;
        var oppD = bfsDist(opp, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // Movimentos sem recuo
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var naoRecuam = moves.filter(function(m){ return m[0] >= pos[iaIdx][0]; });
        if (naoRecuam.length === 0) naoRecuam = moves;
        for (var i = 0; i < naoRecuam.length; i++) {
            acoes.push({ tipo: 'move', r: naoRecuam[i][0], c: naoRecuam[i][1] });
        }

        // Paredes que atrasam oponente
        if (walls[iaIdx] > 0) {
            var paredes = [];
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                    var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                    if (gH > 0 && mgH <= 2) {
                        paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                    var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                    if (gV > 0 && mgV <= 2) {
                        paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
                    }
                }
            }
            paredes.sort(function(a, b){ return (b.ganho * 15 - b.custo * 8) - (a.ganho * 15 - a.custo * 8); });
            var lim = limiteParedes || 12;
            for (var j = 0; j < Math.min(paredes.length, lim); j++) acoes.push(paredes[j]);
        }
        return acoes;
    }

    // ===== DECISÃO PRINCIPAL =====
    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        // 2. Bloqueio obrigatório (oponente a 1)
        var oppD = bfsDist(oppIdx, pH, pV, pos);
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorBloqueio = null, melhorGanho = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var selfH = bfsDist(iaIdx, tH, pV, pos) - bfsDist(iaIdx, pH, pV, pos);
                        if (selfH <= 1 && gH > melhorGanho) { melhorGanho = gH; melhorBloqueio = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var selfV = bfsDist(iaIdx, pH, tV, pos) - bfsDist(iaIdx, pH, pV, pos);
                        if (selfV <= 1 && gV > melhorGanho) { melhorGanho = gV; melhorBloqueio = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorBloqueio) return melhorBloqueio;
        }

        // 3. Geração e avaliação com previsão
        var acoes = gerarAcoes(pos, pH, pV, walls, iaIdx, 14);
        if (acoes.length === 0) return null;

        var melhorAcao = null, melhorScore = -1e15;

        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);

            // Avaliação base
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);

            // Se o oponente pode vencer no próximo turno após minha jogada, descarta
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) {
                base -= 20000;
            }

            // Previsão: melhor resposta do oponente (1 ply)
            var respostasOpp = gerarAcoes(sim.pos, sim.pH, sim.pV, sim.walls, oppIdx, 6);
            var piorResp = 1e15;
            for (var j = 0; j < Math.min(respostasOpp.length, 5); j++) {
                var oa = respostasOpp[j];
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, oa, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.35 + piorResp * 0.65) : base;

            // Anti-loop forte
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 200;
            if (a.tipo === 'move' && a.r < pos[iaIdx][0]) val -= 300;

            if (val > melhorScore) {
                melhorScore = val;
                melhorAcao = a;
            }
        }

        if (!melhorAcao) melhorAcao = acoes[0];

        if (melhorAcao.tipo === 'move') {
            return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        }
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    // Override scheduleIA: aplica SEMPRE via canPlace + placeWall do player
    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var valido = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!valido) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin();
                    if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin();
                            if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_VISAO_REAL ATIVO');
})();
// ===================== FIM IA_EXPERT_VISAO_REAL =====================

// ===================== IA_EXPERT_ECONOMICA_V2 =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 150;
        score += (walls[1] - walls[0]) * 45;  // valoriza muito ter mais paredes
        score += pos[1][0] * 40;
        score -= (8 - pos[0][0]) * 30;

        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;

        if (d1 > d0) score -= (d1 - d0) * 200;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') {
            npos[cur] = [acao.r, acao.c];
        } else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    // Paredes candidatas APENAS se tocarem o caminho real do oponente
    function paredesRelevantes(pos, pH, pV, walls, iaIdx) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // Conjunto de células do caminho do oponente (com margem de 1)
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function tocaCaminho(r, c, ori) {
            // Verifica se a parede intercepta alguma célula do caminho do oponente
            if (ori === 'H') {
                // Parede entre (r, c) e (r+1, c) — bloqueia passagem vertical
                return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            } else {
                return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
            }
        }

        var paredes = [];
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!tocaCaminho(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= 2 && mgH <= 1) {
                    paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
                }
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!tocaCaminho(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= 2 && mgV <= 1) {
                    paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
                }
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 5); // no máximo 5 candidatas por turno
    }

    function gerarAcoes(pos, pH, pV, walls, iaIdx, permitirParedes) {
        var acoes = [];
        var moves = legalMoves(iaIdx, pH, pV, pos);
        var naoRecuam = moves.filter(function(m){ return m[0] >= pos[iaIdx][0]; });
        if (naoRecuam.length === 0) naoRecuam = moves;
        for (var i = 0; i < naoRecuam.length; i++) {
            acoes.push({ tipo:'move', r:naoRecuam[i][0], c:naoRecuam[i][1] });
        }
        if (permitirParedes) {
            var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx);
            for (var j = 0; j < paredes.length; j++) acoes.push(paredes[j]);
        }
        return acoes;
    }

    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório (oponente a 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorBloqueio = null, melhorGanho = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var selfH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (selfH <= 2 && gH > melhorGanho) { melhorGanho = gH; melhorBloqueio = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var selfV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (selfV <= 2 && gV > melhorGanho) { melhorGanho = gV; melhorBloqueio = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorBloqueio) return melhorBloqueio;
        }

        // 3. Economia: se IA está claramente à frente e oponente longe, só avança
        var vantagemClara = (meuD + 2 < oppD);
        var oponenteLonge = (oppD >= 5);
        var permitirParedes = !(vantagemClara && oponenteLonge);

        // Se oponente muito perto (≤ 3), SEMPRE permite paredes
        if (oppD <= 3) permitirParedes = true;

        // Se IA está atrás, permite paredes para bloquear
        if (meuD > oppD) permitirParedes = true;

        var acoes = gerarAcoes(pos, pH, pV, walls, iaIdx, permitirParedes);
        if (acoes.length === 0) return null;

        var melhorAcao = null, melhorScore = -1e15;

        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);

            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);

            // Se oponente pode vencer depois da minha jogada, descarta
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 20000;

            // Previsão de 1 resposta do oponente
            var respostasOpp = [];
            var oppMoves = legalMoves(oppIdx, sim.pH, sim.pV, sim.pos);
            for (var j = 0; j < oppMoves.length; j++) respostasOpp.push({ tipo:'move', r:oppMoves[j][0], c:oppMoves[j][1] });
            var piorResp = 1e15;
            for (var j = 0; j < Math.min(respostasOpp.length, 5); j++) {
                var oa = respostasOpp[j];
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, oa, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.4 + piorResp * 0.6) : base;

            // PUNIÇÃO FORTE por gastar parede
            if (a.tipo === 'wall') {
                val -= 800;                          // custo base de usar parede
                val -= (a.custo || 0) * 150;         // pune se atrapalha a própria IA
                val += (a.ganho || 0) * 100;         // bonifica se atrasa oponente
                if (walls[iaIdx] <= 2) val -= 1200;  // economiza as últimas paredes
            }

            // Anti-loop
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;

            if (val > melhorScore) {
                melhorScore = val;
                melhorAcao = a;
            }
        }

        if (!melhorAcao) melhorAcao = acoes[0];

        if (melhorAcao.tipo === 'move') {
            return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        }
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }

                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_ECONOMICA_V2 ATIVO');
})();
// ===================== FIM IA_EXPERT_ECONOMICA_V2 =====================

// ===================== IA_EXPERT_GPS =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    // ===== BFS com caminho completo (GPS) =====
    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * 150;
        score += (walls[1] - walls[0]) * 45;
        score += pos[1][0] * 40;
        score -= (8 - pos[0][0]) * 30;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;
        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= 2 && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= 2 && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 5);
    }

    // ===== GPS: escolhe o próximo passo do caminho mais curto =====
    function proximoPassoGPS(pH, pV, pos, iaIdx) {
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;
        return rota.path[1]; // próxima célula do caminho mínimo
    }

    function decidir() {
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório de ameaça (oponente a 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 2 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 2 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // ===== 3. GPS: seguir o próximo passo do caminho mais curto =====
        // Independente de ser para frente, para o lado ou para trás.
        var passoGPS = proximoPassoGPS(pH, pV, pos, iaIdx);
        if (passoGPS) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                // Se oponente muito perto e temos paredes, considerar bloqueio antes
                if (oppD <= 3 && walls[iaIdx] > 0) {
                    var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx);
                    if (paredes.length > 0 && paredes[0].ganho >= 3) {
                        return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 4. Se GPS falhou, usar geração de ações (fallback)
        var acoes = [];
        var movesAll = legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < movesAll.length; i++) {
            acoes.push({ tipo:'move', r:movesAll[i][0], c:movesAll[i][1] });
        }
        if (walls[iaIdx] > 0 && oppD <= 4) {
            var ps = paredesRelevantes(pos, pH, pV, walls, iaIdx);
            for (var j = 0; j < ps.length; j++) acoes.push(ps[j]);
        }

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls);
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 20000;

            var respostasOpp = legalMoves(oppIdx, sim.pH, sim.pV, sim.pos);
            var piorResp = 1e15;
            for (var j = 0; j < Math.min(respostasOpp.length, 5); j++) {
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, { tipo:'move', r:respostasOpp[j][0], c:respostasOpp[j][1] }, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.4 + piorResp * 0.6) : base;

            if (a.tipo === 'wall') {
                val -= 800;
                val -= (a.custo || 0) * 150;
                val += (a.ganho || 0) * 100;
                if (walls[iaIdx] <= 2) val -= 1200;
            }
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;
            if (val > melhorScore) { melhorScore = val; melhorAcao = a; }
        }

        if (!melhorAcao && acoes.length > 0) melhorAcao = acoes[0];
        if (!melhorAcao) return null;
        if (melhorAcao.tipo === 'move') return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_GPS ATIVO');
})();
// ===================== FIM IA_EXPERT_GPS =====================

// ===================== IA_EXPERT_1000_PERFIS =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    // ===== 1000 PERFIS (gerados por fórmula, mas fixos em runtime) =====
    var PERFIS_EXPERT = (function () {
        var lista = [];
        var pesosDiferenca = [150, 165, 180, 195, 210, 225, 240, 250];
        var pesosParede    = [20, 30, 40, 50, 60, 70, 80];
        var agressividades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        var ganhosMin      = [2, 3, 4, 5];
        var profundidades  = [2, 3, 4, 5];
        var bonusAvancos   = [20, 30, 40, 50, 60];
        var estilos        = ['centro', 'lateral', 'agressivo', 'defensivo', 'equilibrado'];

        for (var i = 0; i < 1000; i++) {
            lista.push({
                pesoDiferenca: pesosDiferenca[i % pesosDiferenca.length],
                pesoParede: pesosParede[(i * 3) % pesosParede.length],
                agressividade: agressividades[(i * 7) % agressividades.length],
                ganhoMinParede: ganhosMin[(i * 11) % ganhosMin.length],
                profundidadePrevisao: profundidades[(i * 13) % profundidades.length],
                bonusAvanco: bonusAvancos[(i * 17) % bonusAvancos.length],
                estilo: estilos[(i * 19) % estilos.length]
            });
        }
        return lista;
    })();

    // Sorteia um perfil por partida (guardado em G._perfilExpert para não mudar no meio)
    function getPerfilAtual() {
        if (!G._perfilExpert) {
            G._perfilExpert = PERFIS_EXPERT[Math.floor(Math.random() * PERFIS_EXPERT.length)];
        }
        return G._perfilExpert;
    }

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls, perfil) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * perfil.pesoDiferenca;
        score += (walls[1] - walls[0]) * perfil.pesoParede;
        score += pos[1][0] * perfil.bonusAvanco;
        score -= (8 - pos[0][0]) * perfil.bonusAvanco * 0.75;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;

        // Estilo: agressividade aumenta valor de atrasar oponente
        if (d0 > d1) score += (d0 - d1) * perfil.agressividade * 40;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= perfil.ganhoMinParede && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= perfil.ganhoMinParede && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 5);
    }

    function proximoPassoGPS(pH, pV, pos, iaIdx, perfil) {
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;

        // Estilo influencia pequenas variações: às vezes escolhe passo alternativo equivalente
        if (perfil.estilo === 'lateral' && rota.path.length > 3 && Math.random() < 0.15) {
            // Escolhe caminho alternativo com mesma distância
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var alternativas = [];
            for (var i = 0; i < moves.length; i++) {
                var m = moves[i];
                var npos = [pos[0].slice(), pos[1].slice()];
                npos[iaIdx] = [m[0], m[1]];
                var d = bfsDist(iaIdx, pH, pV, npos);
                if (d === rota.dist - 1) alternativas.push([m[0], m[1]]);
            }
            if (alternativas.length > 0) {
                return alternativas[Math.floor(Math.random() * alternativas.length)];
            }
        }
        return rota.path[1];
    }

    function decidir() {
        var perfil = getPerfilAtual();
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 2 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 2 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // 3. GPS
        var passoGPS = proximoPassoGPS(pH, pV, pos, iaIdx, perfil);
        if (passoGPS) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                // Estilo "agressivo" ou "defensivo" interfere
                var limiarBloqueio = perfil.estilo === 'agressivo' ? 4 : perfil.estilo === 'defensivo' ? 2 : 3;
                if (oppD <= limiarBloqueio && walls[iaIdx] > 0) {
                    var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
                    if (paredes.length > 0 && paredes[0].ganho >= perfil.ganhoMinParede) {
                        return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 4. Fallback com geração de ações
        var acoes = [];
        var movesAll = legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < movesAll.length; i++) {
            acoes.push({ tipo:'move', r:movesAll[i][0], c:movesAll[i][1] });
        }
        if (walls[iaIdx] > 0 && oppD <= 4) {
            var ps = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            for (var j = 0; j < ps.length; j++) acoes.push(ps[j]);
        }

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls, perfil);
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 20000;

            var respostasOpp = legalMoves(oppIdx, sim.pH, sim.pV, sim.pos);
            var piorResp = 1e15;
            var limite = Math.min(respostasOpp.length, perfil.profundidadePrevisao);
            for (var j = 0; j < limite; j++) {
                var sim2 = simular(sim.pos, sim.pH, sim.pV, sim.walls, { tipo:'move', r:respostasOpp[j][0], c:respostasOpp[j][1] }, oppIdx);
                var v2 = avaliar(sim2.pos, sim2.pH, sim2.pV, sim2.walls, perfil);
                if (v2 < piorResp) piorResp = v2;
            }
            var val = respostasOpp.length > 0 ? (base * 0.4 + piorResp * 0.6) : base;

            if (a.tipo === 'wall') {
                val -= 800;
                val -= (a.custo || 0) * 150;
                val += (a.ganho || 0) * 100;
                if (walls[iaIdx] <= 2) val -= 1200;
                val -= perfil.pesoParede * 5;
            }
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;
            if (val > melhorScore) { melhorScore = val; melhorAcao = a; }
        }

        if (!melhorAcao && acoes.length > 0) melhorAcao = acoes[0];
        if (!melhorAcao) return null;
        if (melhorAcao.tipo === 'move') return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        // Sorteia perfil novo em cada nova partida
        if (!G._perfilExpert) G._perfilExpert = getPerfilAtual();
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    // Limpa o perfil ao iniciar nova partida contra Expert
    if (typeof resetGame === 'function') {
        var _origReset = resetGame;
        window.resetGame = resetGame = function () {
            if (G && G.vsIA) G._perfilExpert = null;
            return _origReset.apply(this, arguments);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    window.PERFIS_EXPERT = PERFIS_EXPERT;
    console.log('IA_EXPERT_1000_PERFIS ATIVO (' + PERFIS_EXPERT.length + ' perfis)');
})();
// ===================== FIM IA_EXPERT_1000_PERFIS =====================

// ===================== IA_EXPERT_ANTI_BRECHA =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    // Reaproveita os perfis já criados, ou gera se não existirem
    var PERFIS_EXPERT = window.PERFIS_EXPERT || (function () {
        var lista = [];
        var pesosDiferenca = [150, 165, 180, 195, 210, 225, 240, 250];
        var pesosParede    = [20, 30, 40, 50, 60, 70, 80];
        var agressividades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        var ganhosMin      = [2, 3, 4, 5];
        var profundidades  = [2, 3, 4, 5];
        var bonusAvancos   = [20, 30, 40, 50, 60];
        var estilos        = ['centro', 'lateral', 'agressivo', 'defensivo', 'equilibrado'];
        for (var i = 0; i < 1000; i++) {
            lista.push({
                pesoDiferenca: pesosDiferenca[i % pesosDiferenca.length],
                pesoParede: pesosParede[(i * 3) % pesosParede.length],
                agressividade: agressividades[(i * 7) % agressividades.length],
                ganhoMinParede: ganhosMin[(i * 11) % ganhosMin.length],
                profundidadePrevisao: profundidades[(i * 13) % profundidades.length],
                bonusAvanco: bonusAvancos[(i * 17) % bonusAvancos.length],
                estilo: estilos[(i * 19) % estilos.length]
            });
        }
        window.PERFIS_EXPERT = lista;
        return lista;
    })();

    function getPerfilAtual() {
        if (!G._perfilExpert) G._perfilExpert = PERFIS_EXPERT[Math.floor(Math.random() * PERFIS_EXPERT.length)];
        return G._perfilExpert;
    }

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrar(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    // Verifica se, na próxima jogada dele, o oponente pode chegar a 1 (ameaça em 2)
    function oponenteAmeacaEm2(pH, pV, pos, oppIdx) {
        var moves = legalMoves(oppIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[oppIdx] = [moves[i][0], moves[i][1]];
            if (moves[i][0] === WIN[oppIdx]) return true; // vence agora
            if (bfsDist(oppIdx, pH, pV, npos) === 1) return true; // chega a 1
        }
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls, perfil) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * perfil.pesoDiferenca;
        score += (walls[1] - walls[0]) * perfil.pesoParede;
        score += pos[1][0] * perfil.bonusAvanco;
        score -= (8 - pos[0][0]) * perfil.bonusAvanco * 0.75;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;
        if (d0 > d1) score += (d0 - d1) * perfil.agressividade * 40;

        // ===== ANTI-BRECHA: oponente próximo ganha bônus de defesa =====
        if (d0 <= 3) score -= (4 - d0) * 2500;  // oponente perto é perigo
        if (d0 === 2) score -= 3000;
        if (d0 === 3) score -= 1500;

        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) {
            celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        }
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        var ganhoMin = oppD <= 3 ? 1 : perfil.ganhoMinParede; // em fase crítica aceita ganho 1
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= ganhoMin && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= ganhoMin && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 6);
    }

    function proximoPassoGPS(pH, pV, pos, iaIdx, perfil) {
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;
        return rota.path[1];
    }

    function decidir() {
        var perfil = getPerfilAtual();
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // ===== FASE DO JOGO =====
        var faseFinal = (oppD <= 3);
        var faseCritica = (oppD <= 2 || oponenteAmeacaEm2(pH, pV, pos, oppIdx));
        var paredesReserva = 2;
        var temReserva = walls[iaIdx] > paredesReserva;

        // 2. Bloqueio obrigatório imediato (oppD == 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 3 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 3 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // 3. BLOQUEIO PREVENTIVO (oppD <= 3 ou ameaça em 2)
        if ((faseFinal || faseCritica) && walls[iaIdx] > 0) {
            var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            if (paredes.length > 0 && paredes[0].ganho >= 1) {
                return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
            }
        }

        // 4. GPS: avanço pelo caminho mais curto
        var passoGPS = proximoPassoGPS(pH, pV, pos, iaIdx, perfil);
        if (passoGPS) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                // Meio-jogo: bloqueio médio se oponente em 4-5
                if (oppD <= 5 && oppD > 3 && temReserva) {
                    var paredesMed = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
                    if (paredesMed.length > 0 && paredesMed[0].ganho >= 3) {
                        return { type:'wall', r:paredesMed[0].r, c:paredesMed[0].c, ori:paredesMed[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 5. Fallback
        var acoes = [];
        var movesAll = legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < movesAll.length; i++) acoes.push({ tipo:'move', r:movesAll[i][0], c:movesAll[i][1] });
        if (walls[iaIdx] > 0 && (oppD <= 5 || !temReserva)) {
            var ps = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            for (var j = 0; j < ps.length; j++) acoes.push(ps[j]);
        }

        var melhorAcao = null, melhorScore = -1e15;
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var sim = simular(pos, pH, pV, walls, a, iaIdx);
            var base = avaliar(sim.pos, sim.pH, sim.pV, sim.walls, perfil);
            if (canWinNext(oppIdx, sim.pH, sim.pV, sim.pos)) base -= 30000;

            var val = base;

            if (a.tipo === 'wall') {
                val -= 800;
                val -= (a.custo || 0) * 150;
                val += (a.ganho || 0) * 100;
                if (walls[iaIdx] <= paredesReserva && !faseFinal) val -= 3000; // guardar reserva
                if (faseFinal) val += 2000; // no final, gastar vale
                val -= perfil.pesoParede * 5;
            }
            if (a.tipo === 'move' && jaVisitou(a.r, a.c)) val -= 250;
            if (val > melhorScore) { melhorScore = val; melhorAcao = a; }
        }

        if (!melhorAcao && acoes.length > 0) melhorAcao = acoes[0];
        if (!melhorAcao) return null;
        if (melhorAcao.tipo === 'move') return { type:'move', r:melhorAcao.r, c:melhorAcao.c };
        return { type:'wall', r:melhorAcao.r, c:melhorAcao.c, ori:melhorAcao.ori };
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        if (!G._perfilExpert) G._perfilExpert = getPerfilAtual();
        try {
            var act = decidir();
            if (act && act.type === 'move') registrar(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrar(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    if (typeof resetGame === 'function') {
        var _origReset = resetGame;
        window.resetGame = resetGame = function () {
            if (G && G.vsIA) G._perfilExpert = null;
            return _origReset.apply(this, arguments);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    console.log('IA_EXPERT_ANTI_BRECHA ATIVO');
})();
// ===================== FIM IA_EXPERT_ANTI_BRECHA =====================

// ===================== IA_EXPERT_100_ABERTURAS_100_HIST =====================
(function () {
    var WIN = [0, 8];
    var historicoIA = [];

    // ===== 100 ABERTURAS ÚNICAS =====
    var OPENINGS_EXPERT = [
        // 30 movimentos centrais
        { type:'move', r:1, c:4 }, { type:'move', r:2, c:4 }, { type:'move', r:3, c:4 },
        { type:'move', r:1, c:3 }, { type:'move', r:1, c:5 }, { type:'move', r:2, c:3 },
        { type:'move', r:2, c:5 }, { type:'move', r:3, c:3 }, { type:'move', r:3, c:5 },
        { type:'move', r:1, c:4 }, { type:'move', r:2, c:4 }, { type:'move', r:3, c:4 },
        { type:'move', r:1, c:2 }, { type:'move', r:1, c:6 }, { type:'move', r:2, c:2 },
        { type:'move', r:2, c:6 }, { type:'move', r:3, c:2 }, { type:'move', r:3, c:6 },
        { type:'move', r:1, c:4 }, { type:'move', r:2, c:3 }, { type:'move', r:2, c:5 },
        { type:'move', r:1, c:3 }, { type:'move', r:1, c:5 }, { type:'move', r:2, c:4 },
        { type:'move', r:3, c:4 }, { type:'move', r:1, c:4 }, { type:'move', r:2, c:4 },
        { type:'move', r:3, c:3 }, { type:'move', r:3, c:5 }, { type:'move', r:1, c:4 },
        // 20 movimentos laterais
        { type:'move', r:1, c:1 }, { type:'move', r:1, c:7 }, { type:'move', r:2, c:1 },
        { type:'move', r:2, c:7 }, { type:'move', r:3, c:1 }, { type:'move', r:3, c:7 },
        { type:'move', r:1, c:0 }, { type:'move', r:1, c:8 }, { type:'move', r:2, c:0 },
        { type:'move', r:2, c:8 }, { type:'move', r:3, c:0 }, { type:'move', r:3, c:8 },
        { type:'move', r:1, c:2 }, { type:'move', r:1, c:6 }, { type:'move', r:2, c:1 },
        { type:'move', r:2, c:7 }, { type:'move', r:3, c:2 }, { type:'move', r:3, c:6 },
        { type:'move', r:2, c:0 }, { type:'move', r:2, c:8 },
        // 25 paredes verticais
        { type:'wall', r:1, c:4, ori:'V' }, { type:'wall', r:2, c:4, ori:'V' },
        { type:'wall', r:3, c:4, ori:'V' }, { type:'wall', r:1, c:3, ori:'V' },
        { type:'wall', r:1, c:5, ori:'V' }, { type:'wall', r:2, c:3, ori:'V' },
        { type:'wall', r:2, c:5, ori:'V' }, { type:'wall', r:3, c:3, ori:'V' },
        { type:'wall', r:3, c:5, ori:'V' }, { type:'wall', r:2, c:2, ori:'V' },
        { type:'wall', r:2, c:6, ori:'V' }, { type:'wall', r:1, c:2, ori:'V' },
        { type:'wall', r:1, c:6, ori:'V' }, { type:'wall', r:3, c:2, ori:'V' },
        { type:'wall', r:3, c:6, ori:'V' }, { type:'wall', r:4, c:4, ori:'V' },
        { type:'wall', r:4, c:3, ori:'V' }, { type:'wall', r:4, c:5, ori:'V' },
        { type:'wall', r:5, c:4, ori:'V' }, { type:'wall', r:0, c:4, ori:'V' },
        { type:'wall', r:0, c:3, ori:'V' }, { type:'wall', r:0, c:5, ori:'V' },
        { type:'wall', r:4, c:2, ori:'V' }, { type:'wall', r:4, c:6, ori:'V' },
        { type:'wall', r:5, c:3, ori:'V' },
        // 20 paredes horizontais
        { type:'wall', r:1, c:4, ori:'H' }, { type:'wall', r:1, c:3, ori:'H' },
        { type:'wall', r:1, c:5, ori:'H' }, { type:'wall', r:2, c:3, ori:'H' },
        { type:'wall', r:2, c:4, ori:'H' }, { type:'wall', r:3, c:3, ori:'H' },
        { type:'wall', r:3, c:4, ori:'H' }, { type:'wall', r:1, c:2, ori:'H' },
        { type:'wall', r:1, c:6, ori:'H' }, { type:'wall', r:2, c:2, ori:'H' },
        { type:'wall', r:2, c:6, ori:'H' }, { type:'wall', r:3, c:2, ori:'H' },
        { type:'wall', r:3, c:6, ori:'H' }, { type:'wall', r:0, c:4, ori:'H' },
        { type:'wall', r:0, c:3, ori:'H' }, { type:'wall', r:0, c:5, ori:'H' },
        { type:'wall', r:4, c:4, ori:'H' }, { type:'wall', r:4, c:3, ori:'H' },
        { type:'wall', r:4, c:5, ori:'H' }, { type:'wall', r:5, c:4, ori:'H' },
        // 5 combinações (movimento seguido de parede no início)
        { type:'move', r:1, c:4, followWall: { r:1, c:3, ori:'V' } },
        { type:'move', r:1, c:4, followWall: { r:1, c:5, ori:'V' } },
        { type:'move', r:1, c:3, followWall: { r:1, c:2, ori:'H' } },
        { type:'move', r:1, c:5, followWall: { r:1, c:6, ori:'H' } },
        { type:'move', r:2, c:4, followWall: { r:2, c:3, ori:'V' } }
    ];

    // ===== HISTÓRICO DO OPONENTE (100 jogadas) =====
    var historicoJogador = [];
    var ultimaPosicaoJogador = null;

    function registrarJogadaJogador() {
        if (!G) return;
        var r = G.pos[0][0];
        var c = G.pos[0][1];
        var turnos = (G.hist && G.hist.length) ? G.hist.length : 0;

        // Detecta se foi movimento ou parede pela última ação em G.hist
        var ultimaAcao = null;
        if (G.hist && G.hist.length > 0) {
            ultimaAcao = G.hist[G.hist.length - 1];
        }

        if (ultimaPosicaoJogador && (ultimaPosicaoJogador[0] !== r || ultimaPosicaoJogador[1] !== c)) {
            historicoJogador.push({ tipo: 'move', r: r, c: c, deR: ultimaPosicaoJogador[0], deC: ultimaPosicaoJogador[1] });
        } else if (ultimaAcao && ultimaAcao.type === 'wall') {
            historicoJogador.push({ tipo: 'wall', r: ultimaAcao.r, c: ultimaAcao.c, ori: ultimaAcao.ori });
        }

        ultimaPosicaoJogador = [r, c];
        if (historicoJogador.length > 100) historicoJogador.shift();
    }

    // ===== DETECÇÃO DE PADRÃO =====
    function detectarPadrao() {
        if (historicoJogador.length < 10) {
            return { tipo: 'inicio', confianca: 0 };
        }

        var janela = historicoJogador.slice(-30);
        var movimentos = janela.filter(function(j){ return j.tipo === 'move'; });
        var paredes = janela.filter(function(j){ return j.tipo === 'wall'; });

        // Coluna preferida
        var somaCol = 0;
        for (var i = 0; i < movimentos.length; i++) somaCol += movimentos[i].c;
        var colMedia = movimentos.length > 0 ? somaCol / movimentos.length : 4;

        // Proporção de paredes
        var propParede = janela.length > 0 ? paredes.length / janela.length : 0;

        // Ritmo (média de turnos entre movimentos)
        // Simplificação: se tem poucas paredes, ritmo é agressivo
        var agressivo = propParede < 0.15;
        var bloqueador = propParede > 0.4;

        // Tendência
        var inicioEsq = colMedia < 3.5;
        var inicioDir = colMedia > 4.5;

        // Padrão dos últimos 10 turnos
        var ultimos10 = historicoJogador.slice(-10);
        var movsU10 = ultimos10.filter(function(j){ return j.tipo === 'move'; });
        var colU10 = 0;
        for (var k = 0; k < movsU10.length; k++) colU10 += movsU10[k].c;
        var colU10Med = movsU10.length > 0 ? colU10 / movsU10.length : 4;

        // Detecta padrão principal
        if (agressivo && colU10Med < 3.5) return { tipo: 'agressivo_esquerda', confianca: 0.8 };
        if (agressivo && colU10Med > 4.5) return { tipo: 'agressivo_direita', confianca: 0.8 };
        if (agressivo && Math.abs(colU10Med - 4) < 1) return { tipo: 'agressivo_centro', confianca: 0.8 };
        if (bloqueador) return { tipo: 'bloqueador', confianca: 0.7 };
        if (inicioEsq) return { tipo: 'esquerda', confianca: 0.6 };
        if (inicioDir) return { tipo: 'direita', confianca: 0.6 };
        return { tipo: 'equilibrado', confianca: 0.4 };
    }

    function aplicarPadrao(perfil, padrao) {
        // Ajusta perfil conforme padrão detectado
        if (padrao.tipo === 'agressivo_esquerda') {
            perfil.pesoParede += 15;
            perfil.agressividade = Math.min(0.95, perfil.agressividade + 0.2);
            perfil._focoLado = 'esquerda';
        } else if (padrao.tipo === 'agressivo_direita') {
            perfil.pesoParede += 15;
            perfil.agressividade = Math.min(0.95, perfil.agressividade + 0.2);
            perfil._focoLado = 'direita';
        } else if (padrao.tipo === 'agressivo_centro') {
            perfil.pesoParede += 20;
            perfil.agressividade = Math.min(0.95, perfil.agressividade + 0.25);
            perfil._focoLado = 'centro';
        } else if (padrao.tipo === 'bloqueador') {
            perfil.pesoParede -= 10;
            perfil.ganhoMinParede = Math.max(2, perfil.ganhoMinParede - 1);
            perfil._focoLado = 'avancar';
        } else if (padrao.tipo === 'esquerda') {
            perfil._focoLado = 'bloquear_esquerda';
        } else if (padrao.tipo === 'direita') {
            perfil._focoLado = 'bloquear_direita';
        }
        return perfil;
    }

    // ===== PERFIS (mesmos 1000) =====
    var PERFIS_EXPERT = window.PERFIS_EXPERT || (function () {
        var lista = [];
        var pesosDiferenca = [150, 165, 180, 195, 210, 225, 240, 250];
        var pesosParede    = [20, 30, 40, 50, 60, 70, 80];
        var agressividades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        var ganhosMin      = [2, 3, 4, 5];
        var profundidades  = [2, 3, 4, 5];
        var bonusAvancos   = [20, 30, 40, 50, 60];
        var estilos        = ['centro', 'lateral', 'agressivo', 'defensivo', 'equilibrado'];
        for (var i = 0; i < 1000; i++) {
            lista.push({
                pesoDiferenca: pesosDiferenca[i % pesosDiferenca.length],
                pesoParede: pesosParede[(i * 3) % pesosParede.length],
                agressividade: agressividades[(i * 7) % agressividades.length],
                ganhoMinParede: ganhosMin[(i * 11) % ganhosMin.length],
                profundidadePrevisao: profundidades[(i * 13) % profundidades.length],
                bonusAvanco: bonusAvancos[(i * 17) % bonusAvanos.length],
                estilo: estilos[(i * 19) % estilos.length]
            });
        }
        window.PERFIS_EXPERT = lista;
        return lista;
    })();

    function getPerfilAtual() {
        if (!G._perfilExpert) G._perfilExpert = PERFIS_EXPERT[Math.floor(Math.random() * PERFIS_EXPERT.length)];
        return G._perfilExpert;
    }

    function posKey(r, c) { return r + ',' + c; }
    function jaVisitou(r, c) { return historicoIA.indexOf(posKey(r, c)) !== -1; }
    function registrarIA(r, c) {
        historicoIA.push(posKey(r, c));
        if (historicoIA.length > 20) historicoIA.shift();
    }

    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsPath(player, pH, pV, pos) {
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var q = [start];
        var parent = {};
        parent[start[0] + ',' + start[1]] = null;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) {
                var path = [];
                var k = cur[0] + ',' + cur[1];
                while (k !== null) {
                    var parts = k.split(',');
                    path.unshift([parseInt(parts[0], 10), parseInt(parts[1], 10)]);
                    k = parent[k];
                }
                return { dist: path.length - 1, path: path };
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    }

    function bfsDist(player, pH, pV, pos) { return bfsPath(player, pH, pV, pos).dist; }

    function canWinNext(player, pH, pV, pos) {
        var moves = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    function oponenteAmeacaEm2(pH, pV, pos, oppIdx) {
        var moves = legalMoves(oppIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[oppIdx] = [moves[i][0], moves[i][1]];
            if (moves[i][0] === WIN[oppIdx]) return true;
            if (bfsDist(oppIdx, pH, pV, npos) === 1) return true;
        }
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    function avaliar(pos, pH, pV, walls, perfil) {
        var p0 = bfsPath(0, pH, pV, pos);
        var p1 = bfsPath(1, pH, pV, pos);
        var d0 = p0.dist, d1 = p1.dist;
        if (d1 === 0) return 100000;
        if (d0 === 0) return -100000;

        var score = (d0 - d1) * perfil.pesoDiferenca;
        score += (walls[1] - walls[0]) * perfil.pesoParede;
        score += pos[1][0] * perfil.bonusAvanco;
        score -= (8 - pos[0][0]) * perfil.bonusAvanco * 0.75;
        if (canWinNext(1, pH, pV, pos)) score += 7000;
        if (canWinNext(0, pH, pV, pos)) score -= 7000;
        if (d1 > d0) score -= (d1 - d0) * 200;
        if (d0 > d1) score += (d0 - d1) * perfil.agressividade * 40;
        if (d0 <= 3) score -= (4 - d0) * 2500;
        return score;
    }

    function simular(pos, pH, pV, walls, acao, cur) {
        var npos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (acao.tipo === 'move') npos[cur] = [acao.r, acao.c];
        else {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[cur]--;
        }
        return { pos: npos, pH: npH, pV: npV, walls: nw };
    }

    function paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil) {
        if (walls[iaIdx] <= 0) return [];
        var opp = 1 - iaIdx;
        var caminhoOpp = bfsPath(opp, pH, pV, pos);
        var oppD = caminhoOpp.dist;
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < caminhoOpp.path.length; k++) celulas[caminhoOpp.path[k][0] + ',' + caminhoOpp.path[k][1]] = true;
        function toca(r, c, ori) {
            if (ori === 'H') return celulas[r + ',' + c] || celulas[(r + 1) + ',' + c];
            return celulas[r + ',' + c] || celulas[r + ',' + (c + 1)];
        }
        var paredes = [];
        var ganhoMin = oppD <= 3 ? 1 : perfil.ganhoMinParede;
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'H')) continue;
                var gH = bfsDist(opp, pH.concat([[r,c]]), pV, pos) - oppD;
                var mgH = bfsDist(iaIdx, pH.concat([[r,c]]), pV, pos) - meuD;
                if (gH >= ganhoMin && mgH <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'H', ganho:gH, custo:mgH });
            }
            if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                if (!toca(r, c, 'V')) continue;
                var gV = bfsDist(opp, pH, pV.concat([[r,c]]), pos) - oppD;
                var mgV = bfsDist(iaIdx, pH, pV.concat([[r,c]]), pos) - meuD;
                if (gV >= ganhoMin && mgV <= 1) paredes.push({ tipo:'wall', r:r, c:c, ori:'V', ganho:gV, custo:mgV });
            }
        }
        paredes.sort(function(a, b){ return (b.ganho * 20 - b.custo * 10) - (a.ganho * 20 - a.custo * 10); });
        return paredes.slice(0, 6);
    }

    function escolherAbertura(perfil, padrao) {
        var candidatas = OPENINGS_EXPERT.slice();

        // Ajusta abertura conforme padrão
        if (padrao.tipo === 'agressivo_esquerda') candidatas = candidatas.filter(function(a){ return a.c <= 3 || (a.ori === 'V' && a.c <= 4); });
        else if (padrao.tipo === 'agressivo_direita') candidatas = candidatas.filter(function(a){ return a.c >= 5 || (a.ori === 'V' && a.c >= 4); });
        else if (padrao.tipo === 'agressivo_centro') candidatas = candidatas.filter(function(a){ return Math.abs(a.c - 4) <= 1; });
        else if (padrao.tipo === 'bloqueador') candidatas = candidatas.filter(function(a){ return a.type === 'move'; });

        if (candidatas.length === 0) candidatas = OPENINGS_EXPERT.slice();
        return candidatas[Math.floor(Math.random() * candidatas.length)];
    }

    function decidir() {
        var perfil = getPerfilAtual();
        var padrao = detectarPadrao();
        perfil = aplicarPadrao(perfil, padrao);

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório (oppD == 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            var melhorB = null, melhorG = -1;
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) {
                        var gH = bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var sH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (sH <= 3 && gH > melhorG) { melhorG = gH; melhorB = { type:'wall', r:r, c:c, ori:'H' }; }
                    }
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) {
                        var gV = bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var sV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (sV <= 3 && gV > melhorG) { melhorG = gV; melhorB = { type:'wall', r:r, c:c, ori:'V' }; }
                    }
                }
            }
            if (melhorB) return melhorB;
        }

        // 3. Abertura (primeiro turno)
        if (pH.length === 0 && pV.length === 0 && pos[1][0] === 0 && pos[1][1] === 4) {
            var ab = escolherAbertura(perfil, padrao);
            if (ab) {
                if (ab.type === 'move') {
                    var okA = legalMoves(iaIdx, pH, pV, pos).some(function(m){ return m[0] === ab.r && m[1] === ab.c; });
                    if (okA) return { type:'move', r:ab.r, c:ab.c };
                } else if (podeColocar(ab.r, ab.c, ab.ori, pH, pV, walls[iaIdx], pos)) {
                    return { type:'wall', r:ab.r, c:ab.c, ori:ab.ori };
                }
            }
        }

        // 4. Bloqueio preventivo
        if ((oppD <= 3 || oponenteAmeacaEm2(pH, pV, pos, oppIdx)) && walls[iaIdx] > 0) {
            var paredes = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
            if (paredes.length > 0 && paredes[0].ganho >= 1) {
                return { type:'wall', r:paredes[0].r, c:paredes[0].c, ori:paredes[0].ori };
            }
        }

        // 5. GPS: próximo passo do caminho mínimo
        var rota = bfsPath(iaIdx, pH, pV, pos);
        if (rota.path && rota.path.length > 1) {
            var passoGPS = rota.path[1];
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var valido = moves.some(function(m){ return m[0] === passoGPS[0] && m[1] === passoGPS[1]; });
            if (valido) {
                if (oppD <= 5 && oppD > 3 && walls[iaIdx] > 2) {
                    var paredesMed = paredesRelevantes(pos, pH, pV, walls, iaIdx, perfil);
                    if (paredesMed.length > 0 && paredesMed[0].ganho >= 3) {
                        return { type:'wall', r:paredesMed[0].r, c:paredesMed[0].c, ori:paredesMed[0].ori };
                    }
                }
                return { type:'move', r:passoGPS[0], c:passoGPS[1] };
            }
        }

        // 6. Fallback
        var movesFb = legalMoves(iaIdx, pH, pV, pos);
        if (movesFb.length > 0) return { type:'move', r:movesFb[0][0], c:movesFb[0][1] };
        return null;
    }

    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;
        if (!G._perfilExpert) G._perfilExpert = getPerfilAtual();
        registrarJogadaJogador();
        try {
            var act = decidir();
            if (act && act.type === 'move') registrarIA(act.r, act.c);
            return act;
        } catch (e) {
            console.error(e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length) {
                registrarIA(fb[0][0], fb[0][1]);
                return { type:'move', r:fb[0][0], c:fb[0][1] };
            }
            return null;
        }
    }

    if (typeof scheduleIA === 'function') {
        window.scheduleIA = scheduleIA = function () {
            if (G.iaThinking || G.over || !gameActive || matchFinished) return;
            if (!G.vsIA || G.turn !== 1) return;
            setIAThinking(true);
            setTimeout(function () {
                if (G.over || G.turn !== 1 || !gameActive || matchFinished) { setIAThinking(false); return; }
                var act = iaJogarExpert();
                setIAThinking(false);
                if (!act) { nextTurn(); return; }
                stopTimer();

                if (act.type === 'move') {
                    var val = legalMoves(1, G.pH, G.pV, G.pos).some(function(m){ return m[0] === act.r && m[1] === act.c; });
                    if (!val) { nextTurn(); return; }
                    if (typeof doMove === 'function') { doMove(act.r, act.c); return; }
                    G.pos[1][0] = act.r; G.pos[1][1] = act.c;
                    checkWin(); if (!G.over) nextTurn();
                    updateWallIndicators(); draw();
                    return;
                }
                if (act.type === 'wall') {
                    if (typeof canPlace !== 'function' || !canPlace(act.r, act.c, act.ori)) {
                        var mv = legalMoves(1, G.pH, G.pV, G.pos);
                        if (mv.length > 0) {
                            if (typeof doMove === 'function') { doMove(mv[0][0], mv[0][1]); return; }
                            G.pos[1][0] = mv[0][0]; G.pos[1][1] = mv[0][1];
                            checkWin(); if (!G.over) nextTurn();
                            updateWallIndicators(); draw();
                        } else nextTurn();
                        return;
                    }
                    if (typeof placeWall === 'function') { placeWall(act.r + 1, act.c + 1, act.ori); return; }
                }
            }, 300);
        };
    }

    if (typeof resetGame === 'function') {
        var _origReset = resetGame;
        window.resetGame = resetGame = function () {
            if (G && G.vsIA) {
                G._perfilExpert = null;
                historicoJogador = [];
                ultimaPosicaoJogador = null;
            }
            return _origReset.apply(this, arguments);
        };
    }

    window.iaJogarExpert = iaJogarExpert;
    window.OPENINGS_EXPERT = OPENINGS_EXPERT;
    console.log('IA_EXPERT_100_ABERTURAS_100_HIST ATIVO — aberturas:' + OPENINGS_EXPERT.length);
})();
// ===================== FIM IA_EXPERT_100_ABERTURAS_100_HIST =====================

// ===================== IA_EXPERT_ETAPA1_FIM_DE_JOGO =====================
(function () {
    // Etapa 1: quando ambos têm ≤ 2 paredes, IA para de bloquear e corre direto.
    // Só bloqueia se oponente estiver a 1 da vitória.
    // Esta é uma camada de decisão que envolve a IA Expert atual (GPS + 1000 perfis + 100 aberturas).

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    function detectarFimDeJogo() {
        if (!G) return false;
        var paredesJogador = (G.walls && typeof G.walls[0] === 'number') ? G.walls[0] : 10;
        var paredesIA = (G.walls && typeof G.walls[1] === 'number') ? G.walls[1] : 10;
        return (paredesJogador <= 2 && paredesIA <= 2);
    }

    // Helpers locais (não alteram estado global)
    function wallBlockLocal(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMovesLocal(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockLocal(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockLocal(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockLocal(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    }

    function bfsDistLocal(player, pH, pV, pos) {
        var WIN = [0, 8];
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMovesLocal(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNextLocal(player, pH, pV, pos) {
        var WIN = [0, 8];
        var moves = legalMovesLocal(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) if (moves[i][0] === WIN[player]) return true;
        return false;
    }

    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        // Se não for fase final, delega para a IA Expert base (sem alteração)
        if (!detectarFimDeJogo()) {
            return _iaExpertBase.apply(this, arguments);
        }

        // ===== Fase final: comportamento simplificado =====
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMovesLocal(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === 8; });
        if (winMoves.length > 0) {
            return { type:'move', r:winMoves[0][0], c:winMoves[0][1] };
        }

        var oppD = bfsDistLocal(oppIdx, pH, pV, pos);

        // 2. Só bloqueia se oponente está a 1 da vitória
        if (canWinNextLocal(oppIdx, pH, pV, pos) || oppD === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (typeof canPlace === 'function' && canPlace(r, c, 'H')) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNextLocal(oppIdx, tH, pV, pos)) {
                        return { type:'wall', r:r, c:c, ori:'H' };
                    }
                }
                if (typeof canPlace === 'function' && canPlace(r, c, 'V')) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNextLocal(oppIdx, pH, tV, pos)) {
                        return { type:'wall', r:r, c:c, ori:'V' };
                    }
                }
            }
        }

        // 3. Correr direto pelo caminho mais curto
        var moves = legalMovesLocal(iaIdx, pH, pV, pos);
        if (moves.length === 0) return null;
        var melhorMov = null, melhorDist = 999;
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[iaIdx] = [moves[i][0], moves[i][1]];
            var d = bfsDistLocal(iaIdx, pH, pV, npos);
            if (d < melhorDist) {
                melhorDist = d;
                melhorMov = { type:'move', r:moves[i][0], c:moves[i][1] };
            }
        }
        return melhorMov;
    };

    console.log('IA_EXPERT_ETAPA1_FIM_DE_JOGO ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA1_FIM_DE_JOGO =====================

// ===================== IA_EXPERT_ETAPA2_BLOQUEIO_DUPLO =====================
(function () {
    // Etapa 2: simula 2 plies (IA → oponente → IA) para fechar brechas.
    // Envolve a IA Expert atual sem alterar as etapas anteriores.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    function wallBlockL(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalL(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockL(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockL(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockL(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    function bfsL(player, pH, pV, pos) {
        var WIN = [0, 8], goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalL(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                if (seen[k]) continue;
                seen[k] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    function canWinNextL(player, pH, pV, pos) {
        var WIN = [0, 8];
        var m = legalL(player, pH, pV, pos);
        for (var i = 0; i < m.length; i++) if (m[i][0] === WIN[player]) return true;
        return false;
    }

    // Melhor movimento do oponente para chegar ao objetivo
    function melhorMovimentoOponente(pH, pV, pos, oppIdx) {
        var moves = legalL(oppIdx, pH, pV, pos);
        if (moves.length === 0) return null;
        var melhor = null, melhorD = 999;
        for (var i = 0; i < moves.length; i++) {
            var npos = [pos[0].slice(), pos[1].slice()];
            npos[oppIdx] = [moves[i][0], moves[i][1]];
            var d = bfsL(oppIdx, pH, pV, npos);
            if (d < melhorD) {
                melhorD = d;
                melhor = { tipo: 'move', r: moves[i][0], c: moves[i][1], dist: d };
            }
        }
        return melhor;
    }

    // Simula aplicar movimento
    function simMove(pos, r, c, idx) {
        var np = [pos[0].slice(), pos[1].slice()];
        np[idx] = [r, c];
        return np;
    }

    // Simula aplicar parede
    function simWall(pH, pV, walls, r, c, ori, idx) {
        var npH = pH.slice(), npV = pV.slice(), nw = walls.slice();
        if (ori === 'H') npH = pH.concat([[r, c]]);
        else npV = pV.concat([[r, c]]);
        nw[idx]--;
        return { pH: npH, pV: npV, walls: nw };
    }

    // ===== Avaliação de um bloqueio considerando 2 plies =====
    function avaliarBloqueioDuplo(acao, pos, pH, pV, walls, iaIdx, oppIdx) {
        // 1. Simula aplicação da minha ação
        var np = pos, npH = pH, npV = pV, nw = walls;
        if (acao.tipo === 'wall') {
            var sw = simWall(pH, pV, walls, acao.r, acao.c, acao.ori, iaIdx);
            npH = sw.pH; npV = sw.pV; nw = sw.walls;
        } else {
            np = simMove(pos, acao.r, acao.c, iaIdx);
        }

        // 2. Oponente faz o melhor movimento dele
        var oppMove = melhorMovimentoOponente(npH, npV, np, oppIdx);
        if (!oppMove) return -1e15; // oponente travado = ruim para ele, bom para nós

        // 3. Avalia distâncias após a resposta
        var oppDistPos = bfsL(oppIdx, npH, npV, np); // distância do oponente atual
        var minhaDistPos = bfsL(iaIdx, npH, npV, np); // distância da IA atual

        // Se oponente ainda está perto da vitória após meu bloqueio, o bloqueio falhou
        if (oppMove.dist <= 1) return -50000; // oponente vence logo
        if (oppMove.dist <= 2) return -10000; // oponente muito perto

        // Ganho = quanto o oponente ficou atrasado
        var ganhoOponente = oppMove.dist - oppDistPos;

        // Diferença de caminhos
        var diff = oppMove.dist - minhaDistPos;

        return diff * 100 + ganhoOponente * 50;
    }

    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        // Chama a base (etapa 1 + IA anterior)
        var acaoBase = _iaExpertBase.apply(this, arguments);
        if (!acaoBase) return null;

        // Só otimiza se for parede (bloqueio) e o oponente está próximo
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        var oppDist = bfsL(oppIdx, pH, pV, pos);
        var meuDist = bfsL(iaIdx, pH, pV, pos);

        // Só ajusta se oponente próximo (≤ 5) e ação base é parede
        if (oppDist > 5 || acaoBase.type !== 'wall') return acaoBase;

        // Compara a ação base com alternativas próximas (mesma categoria)
        var melhorAcao = acaoBase;
        var melhorScore = avaliarBloqueioDuplo(acaoBase, pos, pH, pV, walls, iaIdx, oppIdx);

        // Gera até 12 paredes candidatas para testar
        var candidatas = [];
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (candidatas.length >= 12) break;
                if (typeof canPlace !== 'function') break;
                if (canPlace(r, c, 'H')) {
                    candidatas.push({ type:'wall', r:r, c:c, ori:'H' });
                }
                if (candidatas.length >= 12) break;
                if (canPlace(r, c, 'V')) {
                    candidatas.push({ type:'wall', r:r, c:c, ori:'V' });
                }
            }
            if (candidatas.length >= 12) break;
        }

        for (var i = 0; i < candidatas.length; i++) {
            var cand = candidatas[i];
            var sc = avaliarBloqueioDuplo(cand, pos, pH, pV, walls, iaIdx, oppIdx);
            if (sc > melhorScore) {
                melhorScore = sc;
                melhorAcao = cand;
            }
        }

        return melhorAcao;
    };

    console.log('IA_EXPERT_ETAPA2_BLOQUEIO_DUPLO ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA2_BLOQUEIO_DUPLO =====================

// ===================== IA_EXPERT_ETAPA3_GARGALO =====================
(function () {
    // Etapa 3: encontra a parede que bloqueia MÚLTIPLAS rotas do oponente de uma vez.
    // Envolve a IA Expert atual (etapas 1 e 2) sem alterar as anteriores.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    function wallBlockG(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalG(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockG(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockG(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockG(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    // BFS que conta quantos caminhos DIFERENTES de distância mínima existem
    function bfsContaCaminhos(player, pH, pV, pos, limite) {
        var WIN = [0, 8], goal = WIN[player];
        var start = pos[player][0] + ',' + pos[player][1];
        var dist = {}; dist[start] = 0;
        var caminhos = {}; caminhos[start] = 1;
        var q = [[pos[player][0], pos[player][1]]];
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var curKey = cur[0] + ',' + cur[1];
            var d = dist[curKey];
            if (d >= distFinal) continue;
            if (cur[0] === goal) {
                distFinal = d;
                continue;
            }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalG(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                var nd = d + 1;
                if (dist[k] === undefined || dist[k] > nd) {
                    dist[k] = nd;
                    caminhos[k] = caminhos[curKey];
                    q.push([nb[i][0], nb[i][1]]);
                } else if (dist[k] === nd) {
                    caminhos[k] = Math.min(limite, (caminhos[k] || 0) + caminhos[curKey]);
                }
            }
        }
        var goalKey = goal + ',' + pos[player][1];
        // Busca caminhos para qualquer célula na linha objetivo
        var total = 0;
        for (var c2 = 0; c2 < 9; c2++) {
            var kk = goal + ',' + c2;
            if (dist[kk] === distFinal && distFinal < 999) {
                total += caminhos[kk] || 0;
            }
        }
        return { dist: distFinal, caminhos: Math.min(limite, total) };
    }

    function bfsDistG(player, pH, pV, pos) {
        return bfsContaCaminhos(player, pH, pV, pos, 1).dist;
    }

    // ===== Avaliação de gargalo =====
    function avaliarGargalo(acao, pos, pH, pV, walls, iaIdx, oppIdx) {
        // Simula a parede
        var npH = pH, npV = pV, nw = walls.slice();
        if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
        else npV = pV.concat([[acao.r, acao.c]]);
        nw[iaIdx]--;

        // Antes e depois: distância e número de caminhos do oponente
        var antes = bfsContaCaminhos(oppIdx, pH, pV, pos, 5);
        var depois = bfsContaCaminhos(oppIdx, npH, npV, pos, 5);

        // Distância da IA depois
        var meuD = bfsDistG(iaIdx, npH, npV, pos);

        // Se bloqueou todos os caminhos, é inválido
        if (depois.dist >= 99) return -1e15;

        // Ganho de distância
        var ganhoDist = depois.dist - antes.dist;

        // Redução de caminhos alternativos (gargalo!)
        var reducaoCaminhos = antes.caminhos - depois.caminhos;

        // Score: distância importa, mas redução de caminhos é ouro
        var score = ganhoDist * 60 + reducaoCaminhos * 200;

        // Bônus se ficar com apenas 1 caminho
        if (depois.caminhos <= 1 && antes.caminhos >= 2) score += 500;

        // Se atrapalhar minha IA, penaliza
        var meuAntes = bfsDistG(iaIdx, pH, pV, pos);
        if (meuD > meuAntes + 1) score -= (meuD - meuAntes) * 120;

        return score;
    }

    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var acaoBase = _iaExpertBase.apply(this, arguments);
        if (!acaoBase) return null;

        // Só otimiza quando a ação for parede
        if (acaoBase.type !== 'wall') return acaoBase;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // Só otimiza se oponente está relativamente perto
        var oppDist = bfsDistG(oppIdx, pH, pV, pos);
        if (oppDist > 5) return acaoBase;

        // Compara a base com candidatas
        var melhorAcao = acaoBase;
        var melhorScore = avaliarGargalo(acaoBase, pos, pH, pV, walls, iaIdx, oppIdx);

        // Gera até 20 candidatas
        var cands = [];
        for (var r = 0; r < 8 && cands.length < 20; r++) {
            for (var c = 0; c < 8 && cands.length < 20; c++) {
                if (typeof canPlace !== 'function') break;
                if (canPlace(r, c, 'H')) cands.push({ type:'wall', r:r, c:c, ori:'H' });
                if (cands.length >= 20) break;
                if (canPlace(r, c, 'V')) cands.push({ type:'wall', r:r, c:c, ori:'V' });
            }
        }

        for (var i = 0; i < cands.length; i++) {
            var sc = avaliarGargalo(cands[i], pos, pH, pV, walls, iaIdx, oppIdx);
            if (sc > melhorScore) {
                melhorScore = sc;
                melhorAcao = cands[i];
            }
        }

        return melhorAcao;
    };

    console.log('IA_EXPERT_ETAPA3_GARGALO ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA3_GARGALO =====================

// ===================== IA_EXPERT_ETAPA4_PUNIR_PREVISIVEL =====================
(function () {
    // Etapa 4: memoriza as últimas 5 partidas do oponente e adapta comportamento.
    // Se o oponente repete a abertura, a IA antecipa o bloqueio.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _iaExpertBase = window.iaJogarExpert;

    // ===== MEMÓRIA (localStorage por nickname) =====
    function getChaveMemoria() {
        var nick = (typeof currentUser === 'string' && currentUser) ? currentUser : 'anon';
        return 'quoridor_ia_mem_' + nick.toLowerCase();
    }

    function lerMemoria() {
        try {
            var raw = localStorage.getItem(getChaveMemoria());
            if (!raw) return { aberturas: [], paredesPreferidas: [], total: 0 };
            return JSON.parse(raw);
        } catch (e) {
            return { aberturas: [], paredesPreferidas: [], total: 0 };
        }
    }

    function salvarMemoria(mem) {
        try {
            localStorage.setItem(getChaveMemoria(), JSON.stringify(mem));
        } catch (e) {}
    }

    // Chamado quando o jogador faz a primeira jogada de uma partida
    var aberturaRegistrada = false;

    function registrarAberturaAtual() {
        if (aberturaRegistrada) return;
        if (!G || !G.pos) return;
        // Só registra quando o humano já se moveu pelo menos 1 vez
        var r = G.pos[0][0];
        var c = G.pos[0][1];
        if (r === 8 && c === 4) return; // posição inicial, ainda não se moveu
        var mem = lerMemoria();
        var chave = r + ',' + c;
        mem.aberturas.push(chave);
        if (mem.aberturas.length > 5) mem.aberturas.shift();
        mem.total = (mem.total || 0) + 1;
        salvarMemoria(mem);
        aberturaRegistrada = true;
    }

    // Detecta se o jogador tem abertura previsível
    function aberturaPrevisivel() {
        var mem = lerMemoria();
        if (!mem.aberturas || mem.aberturas.length < 3) return null;
        // Conta repetições
        var contagem = {};
        for (var i = 0; i < mem.aberturas.length; i++) {
            contagem[mem.aberturas[i]] = (contagem[mem.aberturas[i]] || 0) + 1;
        }
        // Se alguma abertura apareceu em 3+ das últimas 5 partidas, é previsível
        for (var k in contagem) {
            if (contagem[k] >= 3) {
                var parts = k.split(',');
                return { r: parseInt(parts[0], 10), c: parseInt(parts[1], 10), repeticoes: contagem[k] };
            }
        }
        return null;
    }

    // ===== HELPERS LOCAIS =====
    function wallBlockP(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalP(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlockP(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlockP(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlockP(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    function bfsP(player, pH, pV, pos) {
        var WIN = [0, 8], goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0] + ',' + pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalP(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                if (seen[k]) continue;
                seen[k] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    }

    // ===== ANTECIPAÇÃO =====
    function acharBloqueioAntecipado(previsao, pH, pV, walls, pos) {
        // previsao = { r, c } a casa que o jogador costuma ir
        if (!previsao) return null;
        var alvo = [previsao.r, previsao.c];
        var candidatas = [];
        // Paredes que bloqueiam o caminho para essa casa
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (typeof canPlace !== 'function') break;
                if (canPlace(r, c, 'H')) {
                    var npH = pH.concat([[r, c]]);
                    var novaDist = bfsP(0, npH, pV, pos);
                    if (novaDist > bfsP(0, pH, pV, pos)) {
                        // Verifica se atrapalha a IA
                        var minhaAntes = bfsP(1, pH, pV, pos);
                        var minhaDepois = bfsP(1, npH, pV, pos);
                        if (minhaDepois <= minhaAntes) {
                            candidatas.push({ type:'wall', r:r, c:c, ori:'H', ganho: novaDist - bfsP(0, pH, pV, pos) });
                        }
                    }
                }
                if (canPlace(r, c, 'V')) {
                    var npV = pV.concat([[r, c]]);
                    var novaDistV = bfsP(0, pH, npV, pos);
                    if (novaDistV > bfsP(0, pH, pV, pos)) {
                        var minhaAntesV = bfsP(1, pH, pV, pos);
                        var minhaDepoisV = bfsP(1, pH, npV, pos);
                        if (minhaDepoisV <= minhaAntesV) {
                            candidatas.push({ type:'wall', r:r, c:c, ori:'V', ganho: novaDistV - bfsP(0, pH, pV, pos) });
                        }
                    }
                }
            }
        }
        candidatas.sort(function(a, b){ return b.ganho - a.ganho; });
        return candidatas.length > 0 ? candidatas[0] : null;
    }

    // ===== WRAPPER FINAL =====
    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        // Registra a abertura do jogador (uma vez por partida)
        registrarAberturaAtual();

        // Se o jogador é previsível, e ainda estamos no início, antecipa o bloqueio
        var previsao = aberturaPrevisivel();
        if (previsao && G.hist && G.hist.length >= 2) {
            var pos = [G.pos[0].slice(), G.pos[1].slice()];
            var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
            var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
            var walls = [G.walls[0], G.walls[1]];

            // Só antecipa se ainda tiver paredes
            if (walls[1] > 2) {
                var bloqueio = acharBloqueioAntecipado(previsao, pH, pV, walls, pos);
                if (bloqueio) {
                    return bloqueio;
                }
            }
        }

        // Caso contrário, delega para as etapas anteriores
        return _iaExpertBase.apply(this, arguments);
    };

    // Reset da flag quando a partida reinicia
    if (typeof resetGame === 'function') {
        var _origReset4 = resetGame;
        window.resetGame = resetGame = function () {
            aberturaRegistrada = false;
            return _origReset4.apply(this, arguments);
        };
    }

    console.log('IA_EXPERT_ETAPA4_PUNIR_PREVISIVEL ATIVO');
})();
// ===================== FIM IA_EXPERT_ETAPA4_PUNIR_PREVISIVEL =====================

// ===================== IA_EXPERT_CONSOLIDADA_FINAL =====================
(function () {
    var WIN = [0, 8];
    var BFS_CACHE = {};
    var COMPLEXIDADE_LIMITE = 400; // ms

    // ===== MEMÓRIA ENTRE PARTIDAS =====
    function chaveEstilo() {
        var nick = (typeof currentUser === 'string' && currentUser) ? currentUser : 'anon';
        return 'quoridor_estilo_' + nick.toLowerCase();
    }
    function lerEstilo() {
        try {
            var raw = localStorage.getItem(chaveEstilo());
            if (!raw) return { partidas: 0, mediaParedes: 5, estilo: 'equilibrado' };
            return JSON.parse(raw);
        } catch (e) { return { partidas: 0, mediaParedes: 5, estilo: 'equilibrado' }; }
    }
    function salvarEstilo(e) {
        try { localStorage.setItem(chaveEstilo(), JSON.stringify(e)); } catch (err) {}
    }

    // ===== HISTÓRICO DE 20 JOGADAS =====
    var memJogadas = [];
    var ultPosHum = null;
    var ultPHS = 0, ultPVS = 0;

    function registrarHumano() {
        if (!G || !G.pos) return;
        var r = G.pos[0][0], c = G.pos[0][1];
        if (ultPosHum && (ultPosHum[0] !== r || ultPosHum[1] !== c)) {
            memJogadas.push({ tipo: 'move', deR: ultPosHum[0], deC: ultPosHum[1], r: r, c: c });
            if (memJogadas.length > 20) memJogadas.shift();
        }
        var pHs = G.pH ? G.pH.length : 0;
        var pVs = G.pV ? G.pV.length : 0;
        if (pHs > ultPHS && G.pH.length > 0) {
            memJogadas.push({ tipo: 'wall', r: G.pH[G.pH.length-1][0], c: G.pH[G.pH.length-1][1], ori: 'H' });
            if (memJogadas.length > 20) memJogadas.shift();
        } else if (pVs > ultPVS && G.pV.length > 0) {
            memJogadas.push({ tipo: 'wall', r: G.pV[G.pV.length-1][0], c: G.pV[G.pV.length-1][1], ori: 'V' });
            if (memJogadas.length > 20) memJogadas.shift();
        }
        ultPosHum = [r, c];
        ultPHS = pHs;
        ultPVS = pVs;
    }

    function analisarPadroes() {
        if (memJogadas.length < 4) return null;
        var movs = memJogadas.filter(function(j){ return j.tipo === 'move'; });
        var paredes = memJogadas.filter(function(j){ return j.tipo === 'wall'; });
        var somaC = 0;
        for (var i = 0; i < movs.length; i++) somaC += movs[i].c;
        var colMedia = movs.length > 0 ? somaC / movs.length : 4;
        var contPos = {};
        for (var i = 0; i < movs.length; i++) {
            var k = movs[i].r + ',' + movs[i].c;
            contPos[k] = (contPos[k] || 0) + 1;
        }
        var cicloDetectado = false;
        for (var k in contPos) if (contPos[k] >= 3) cicloDetectado = true;
        var taxaParede = memJogadas.length > 0 ? paredes.length / memJogadas.length : 0;
        return { colMedia: colMedia, ciclo: cicloDetectado, taxaParede: taxaParede, totalMovs: movs.length };
    }

    // ===== HELPERS BFS =====
    function wallBlock(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
        }
        return false;
    }

    function legalMoves(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > 8 || nc < 0 || nc > 8) continue;
            if (wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8 && !wallBlock(pH, pV, nr, nc, jr, jc)) out.push([jr, jc]);
                else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= 8 && sides[s][1] >= 0 && sides[s][1] <= 8 && !wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) out.push(sides[s]);
                    }
                }
            } else out.push([nr, nc]);
        }
        return out;
    }

    function bfsKey(player, pH, pV, pos) {
        var k = player + '|' + pos[0][0] + ',' + pos[0][1] + '|' + pos[1][0] + ',' + pos[1][1] + '|';
        for (var i = 0; i < pH.length; i++) k += pH[i][0] + ',' + pH[i][1] + ';';
        k += '|';
        for (var i = 0; i < pV.length; i++) k += pV[i][0] + ',' + pV[i][1] + ';';
        return k;
    }

    function bfsInfo(player, pH, pV, pos, contCaminhos) {
        var cacheKey = bfsKey(player, pH, pV, pos) + (contCaminhos ? '|c' : '|d');
        if (BFS_CACHE[cacheKey]) return BFS_CACHE[cacheKey];

        var goal = WIN[player];
        var startKey = pos[player][0] + ',' + pos[player][1];
        var dist = {}; dist[startKey] = 0;
        var cam = {}; cam[startKey] = 1;
        var q = [[pos[player][0], pos[player][1]]];
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var curKey = cur[0] + ',' + cur[1];
            var d = dist[curKey];
            if (d >= distFinal) continue;
            if (cur[0] === goal) { distFinal = d; continue; }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                var nd = d + 1;
                if (dist[k] === undefined || dist[k] > nd) {
                    dist[k] = nd;
                    cam[k] = cam[curKey];
                    q.push([nb[i][0], nb[i][1]]);
                } else if (dist[k] === nd) {
                    cam[k] = Math.min(5, (cam[k] || 0) + cam[curKey]);
                }
            }
        }
        var total = 0;
        for (var c2 = 0; c2 < 9; c2++) {
            var kk = goal + ',' + c2;
            if (dist[kk] === distFinal && distFinal < 999) total += cam[kk] || 0;
        }
        var res = { dist: distFinal, caminhos: Math.min(5, total) };
        BFS_CACHE[cacheKey] = res;
        return res;
    }

    function bfsDist(player, pH, pV, pos) { return bfsInfo(player, pH, pV, pos, false).dist; }

    function canWinNext(player, pH, pV, pos) {
        var m = legalMoves(player, pH, pV, pos);
        for (var i = 0; i < m.length; i++) if (m[i][0] === WIN[player]) return true;
        return false;
    }

    function pathsOk(pH, pV, pos) {
        return bfsDist(0, pH, pV, pos) < 99 && bfsDist(1, pH, pV, pos) < 99;
    }

    function podeColocar(r, c, ori, pH, pV, wallsLeft, pos) {
        if (wallsLeft <= 0 || r < 0 || r >= 8 || c < 0 || c >= 8) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) if (pV[i][1] === c && pV[i][0] === r) return false;
            return pathsOk(pH.concat([[r, c]]), pV, pos);
        }
        for (var i = 0; i < pV.length; i++) {
            if (pV[i][0] === r && pV[i][1] === c) return false;
            if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
        }
        for (var i = 0; i < pH.length; i++) if (pH[i][0] === r && pH[i][1] === c) return false;
        return pathsOk(pH, pV.concat([[r, c]]), pos);
    }

    // ===== MAPA DE CALOR (novo) =====
    function mapaDeCalor(player, pH, pV, pos) {
        var goal = WIN[player];
        var heat = {};
        for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) heat[r+','+c] = 0;
        var inicio = pos[player].slice();
        var q = [[inicio[0], inicio[1], 0]];
        var dist = {}; dist[inicio[0]+','+inicio[1]] = 0;
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var k = cur[0] + ',' + cur[1];
            if (cur[0] === goal) { distFinal = Math.min(distFinal, cur[2]); continue; }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var nk = nb[i][0] + ',' + nb[i][1];
                if (dist[nk] === undefined) {
                    dist[nk] = cur[2] + 1;
                    q.push([nb[i][0], nb[i][1], cur[2] + 1]);
                }
            }
        }
        for (var kk in dist) {
            if (dist[kk] < distFinal) heat[kk] = (heat[kk] || 0) + 1;
        }
        return heat;
    }

    // ===== PREVISÃO DE 2 JOGADAS DO OPONENTE (novo) =====
    function preverDuasJogadas(pH, pV, pos, oppIdx) {
        var m1 = legalMoves(oppIdx, pH, pV, pos);
        if (m1.length === 0) return null;
        var melhor1 = null, d1 = 999;
        for (var i = 0; i < m1.length; i++) {
            var np = [pos[0].slice(), pos[1].slice()];
            np[oppIdx] = [m1[i][0], m1[i][1]];
            var dd = bfsDist(oppIdx, pH, pV, np);
            if (dd < d1) { d1 = dd; melhor1 = [m1[i][0], m1[i][1]]; }
        }
        if (!melhor1) return null;
        var np2 = [pos[0].slice(), pos[1].slice()];
        np2[oppIdx] = melhor1;
        var m2 = legalMoves(oppIdx, pH, pV, np2);
        var melhor2 = null, d2 = 999;
        for (var i = 0; i < m2.length; i++) {
            var np3 = [np2[0].slice(), np2[1].slice()];
            np3[oppIdx] = [m2[i][0], m2[i][1]];
            var dd2 = bfsDist(oppIdx, pH, pV, np3);
            if (dd2 < d2) { d2 = dd2; melhor2 = [m2[i][0], m2[i][1]]; }
        }
        return { primeira: melhor1, segunda: melhor2, distFinal: d2 };
    }

    // ===== GERAÇÃO DE CANDIDATOS (limitada para performance) =====
    function gerarCandidatos(pos, pH, pV, walls, iaIdx, limite) {
        var cands = [];
        var opp = 1 - iaIdx;
        var oppD = bfsDist(opp, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);
        var heat = mapaDeCalor(opp, pH, pV, pos);
        var caminhoOpp = null;
        var rota = bfsInfo(opp, pH, pV, pos, false);
        for (var r = 0; r < 8 && cands.length < limite; r++) {
            for (var c = 0; c < 8 && cands.length < limite; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    var gH = bfsDist(opp, tH, pV, pos) - oppD;
                    var mgH = bfsDist(iaIdx, tH, pV, pos) - meuD;
                    if (gH >= 1 && mgH <= 1) {
                        var heatH = (heat[(r)+','+(c)] || 0) + (heat[(r+1)+','+(c)] || 0);
                        cands.push({ tipo: 'wall', r: r, c: c, ori: 'H', ganho: gH, custo: mgH, heat: heatH });
                    }
                }
                if (cands.length >= limite) break;
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    var gV = bfsDist(opp, pH, tV, pos) - oppD;
                    var mgV = bfsDist(iaIdx, pH, tV, pos) - meuD;
                    if (gV >= 1 && mgV <= 1) {
                        var heatV = (heat[(r)+','+(c)] || 0) + (heat[(r)+','+(c+1)] || 0);
                        cands.push({ tipo: 'wall', r: r, c: c, ori: 'V', ganho: gV, custo: mgV, heat: heatV });
                    }
                }
            }
        }
        cands.sort(function (a, b) {
            var sa = a.ganho * 20 + a.heat * 5 - a.custo * 15;
            var sb = b.ganho * 20 + b.heat * 5 - b.custo * 15;
            return sb - sa;
        });
        return cands;
    }

    // ===== ESCOLHA DA AÇÃO =====
    function escolherAcao() {
        var t0 = Date.now();
        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winMoves = legalMoves(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winMoves.length > 0) return { type: 'move', r: winMoves[0][0], c: winMoves[0][1] };

        var oppD = bfsDist(oppIdx, pH, pV, pos);
        var meuD = bfsDist(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório (oppD == 1)
        if (canWinNext(oppIdx, pH, pV, pos) || oppD === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (!canWinNext(oppIdx, tH, pV, pos)) return { type: 'wall', r: r, c: c, ori: 'H' };
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (!canWinNext(oppIdx, pH, tV, pos)) return { type: 'wall', r: r, c: c, ori: 'V' };
                }
            }
        }

        // 3. Fim de jogo (ambos com poucas paredes): correr direto
        if (walls[0] <= 2 && walls[1] <= 2) {
            var moves = legalMoves(iaIdx, pH, pV, pos);
            var melhor = null, md = 999;
            for (var i = 0; i < moves.length; i++) {
                var np = [pos[0].slice(), pos[1].slice()];
                np[iaIdx] = [moves[i][0], moves[i][1]];
                var dd = bfsDist(iaIdx, pH, pV, np);
                if (dd < md) { md = dd; melhor = moves[i]; }
            }
            if (melhor) return { type: 'move', r: melhor[0], c: melhor[1] };
        }

        // 4. Previsão de 2 jogadas
        var previsao = preverDuasJogadas(pH, pV, pos, oppIdx);
        if (previsao && previsao.distFinal <= 2 && walls[iaIdx] > 0) {
            var bloqueio = gerarCandidatos(pos, pH, pV, walls, iaIdx, 6);
            if (bloqueio.length > 0) {
                return { type: 'wall', r: bloqueio[0].r, c: bloqueio[0].c, ori: bloqueio[0].ori };
            }
        }

        // 5. Aplicar padrão do jogador
        var padrao = analisarPadroes();
        if (padrao && padrao.ciclo && walls[iaIdx] > 2) {
            var blk = gerarCandidatos(pos, pH, pV, walls, iaIdx, 4);
            if (blk.length > 0 && blk[0].ganho >= 2) {
                return { type: 'wall', r: blk[0].r, c: blk[0].c, ori: blk[0].ori };
            }
        }

        // 6. Se oponente próximo, bloqueio com análise de gargalo
        if (oppD <= 4 && walls[iaIdx] > 0) {
            var cands = gerarCandidatos(pos, pH, pV, walls, iaIdx, 8);
            if (cands.length > 0 && cands[0].ganho >= 2) {
                return { type: 'wall', r: cands[0].r, c: cands[0].c, ori: cands[0].ori };
            }
        }

        // 7. GPS: próximo passo do caminho mais curto
        var movs = legalMoves(iaIdx, pH, pV, pos);
        if (movs.length === 0) return null;

        var melhorMov = null, melhorDist = 999, melhorRotas = 0;
        for (var i = 0; i < movs.length; i++) {
            var np2 = [pos[0].slice(), pos[1].slice()];
            np2[iaIdx] = [movs[i][0], movs[i][1]];
            var info = bfsInfo(iaIdx, pH, pV, np2, true);
            var score = -info.dist * 100 + info.caminhos * 20;
            if (score > (melhorMov ? -melhorDist * 100 + melhorRotas * 20 : -99999)) {
                melhorDist = info.dist;
                melhorRotas = info.caminhos;
                melhorMov = movs[i];
            }
        }

        if (melhorMov && Date.now() - t0 < COMPLEXIDADE_LIMITE) {
            return { type: 'move', r: melhorMov[0], c: melhorMov[1] };
        }

        // 8. Fallback
        if (movs.length > 0) return { type: 'move', r: movs[0][0], c: movs[0][1] };
        return null;
    }

    // ===== FUNÇÃO PRINCIPAL =====
    function iaJogarExpert() {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        registrarHumano();

        try {
            var acao = escolherAcao();
            return acao;
        } catch (e) {
            console.error('Erro IA:', e);
            var fb = legalMoves(1, G.pH || [], G.pV || [], G.pos);
            if (fb.length > 0) return { type: 'move', r: fb[0][0], c: fb[0][1] };
            return null;
        }
    }

    // Substitui global
    window.iaJogarExpert = iaJogarExpert;

    // Reset no início da partida
    if (typeof resetGame === 'function') {
        var _origResetC = resetGame;
        window.resetGame = resetGame = function () {
            memJogadas = [];
            ultPosHum = null;
            ultPHS = 0;
            ultPVS = 0;
            BFS_CACHE = {};
            return _origResetC.apply(this, arguments);
        };
    }

    console.log('IA_EXPERT_CONSOLIDADA_FINAL ATIVO');
})();
// ===================== FIM IA_EXPERT_CONSOLIDADA_FINAL =====================

// ===================== IA_EXPERT_MELHORIAS_EXTRA =====================
(function () {
    // Camada única com 8 melhorias novas. Delega para a base quando não se aplica.

    if (typeof window.iaJogarExpert !== 'function') return;
    var _base = window.iaJogarExpert;

    var WIN = [0, 8];

    // ===== MEMÓRIA DE PARTIDAS =====
    function chaveHistoricoDerrotas() {
        var nick = (typeof currentUser === 'string' && currentUser) ? currentUser : 'anon';
        return 'quoridor_derrotas_' + nick.toLowerCase();
    }
    function lerDerrotas() {
        try {
            var raw = localStorage.getItem(chaveHistoricoDerrotas());
            return raw ? JSON.parse(raw) : { aberturas: [], total: 0 };
        } catch (e) { return { aberturas: [], total: 0 }; }
    }
    function salvarDerrotas(d) {
        try { localStorage.setItem(chaveHistoricoDerrotas(), JSON.stringify(d)); } catch (e) {}
    }

    // ===== UTILITÁRIOS =====
    function wb(pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1-c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i=0;i<pV.length;i++) if (pV[i][1]===cMin && (pV[i][0]===r1||pV[i][0]===r1-1)) return true;
        }
        if (c1 === c2 && Math.abs(r1-r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i=0;i<pH.length;i++) if (pH[i][0]===rMin && (pH[i][1]===c1||pH[i][1]===c1-1)) return true;
        }
        return false;
    }

    function lm(player, pH, pV, pos) {
        var r = pos[player][0], c = pos[player][1], other = pos[1-player];
        var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        var out = [];
        for (var i=0;i<4;i++) {
            var nr = r+dirs[i][0], nc = c+dirs[i][1];
            if (nr<0||nr>8||nc<0||nc>8) continue;
            if (wb(pH, pV, r, c, nr, nc)) continue;
            if (nr===other[0] && nc===other[1]) {
                var dr = nr-r, dc = nc-c, jr = nr+dr, jc = nc+dc;
                if (jr>=0&&jr<=8&&jc>=0&&jc<=8&&!wb(pH,pV,nr,nc,jr,jc)) out.push([jr,jc]);
                else {
                    var sides = dr!==0 ? [[nr,nc-1],[nr,nc+1]] : [[nr-1,nc],[nr+1,nc]];
                    for (var s=0;s<2;s++) if (sides[s][0]>=0&&sides[s][0]<=8&&sides[s][1]>=0&&sides[s][1]<=8&&!wb(pH,pV,nr,nc,sides[s][0],sides[s][1])) out.push(sides[s]);
                }
            } else out.push([nr,nc]);
        }
        return out;
    }

    function bfs(player, pH, pV, pos) {
        var goal = WIN[player];
        var q = [[pos[player][0], pos[player][1], 0]];
        var seen = {};
        seen[pos[player][0]+','+pos[player][1]] = 1;
        var qi = 0;
        while (qi < q.length) {
            var cur = q[qi++];
            if (cur[0] === goal) return cur[2];
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = lm(player, pH, pV, tpos);
            for (var i=0;i<nb.length;i++) {
                var k = nb[i][0]+','+nb[i][1];
                if (seen[k]) continue;
                seen[k] = 1;
                q.push([nb[i][0], nb[i][1], cur[2]+1]);
            }
        }
        return 99;
    }

    function podeColocar(r, c, ori, pH, pV, wl, pos) {
        if (wl<=0 || r<0 || r>=8 || c<0 || c>=8) return false;
        if (ori === 'H') {
            for (var i=0;i<pH.length;i++) {
                if (pH[i][0]===r && pH[i][1]===c) return false;
                if (pH[i][0]===r && (pH[i][1]===c-1||pH[i][1]===c+1)) return false;
            }
            for (var i=0;i<pV.length;i++) if (pV[i][1]===c && pV[i][0]===r) return false;
            return bfs(0, pH.concat([[r,c]]), pV, pos) < 99 && bfs(1, pH.concat([[r,c]]), pV, pos) < 99;
        }
        for (var i=0;i<pV.length;i++) {
            if (pV[i][0]===r && pV[i][1]===c) return false;
            if (pV[i][1]===c && (pV[i][0]===r-1||pV[i][0]===r+1)) return false;
        }
        for (var i=0;i<pH.length;i++) if (pH[i][0]===r && pH[i][1]===c) return false;
        return bfs(0, pH, pV.concat([[r,c]]), pos) < 99 && bfs(1, pH, pV.concat([[r,c]]), pos) < 99;
    }

    // ===== MELHORIA 1: Zona morta (caminho muito longo = perdida) =====
    function emZonaMorta(pH, pV, pos) {
        var d1 = bfs(1, pH, pV, pos);
        return d1 >= 14;
    }

    function recuperarZonaMorta(pH, pV, pos) {
        // Se está com caminho enorme, tenta quebrar bloqueio do oponente
        var wl = G.walls[1];
        if (wl <= 0) return null;
        var cand = null, maiorGanho = 0;
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (podeColocar(r, c, 'H', pH, pV, wl, pos)) {
                var tH = pH.concat([[r, c]]);
                var g = bfs(1, pH, pV, pos) - bfs(1, tH, pV, pos);
                if (g > maiorGanho) { maiorGanho = g; cand = { type:'wall', r:r, c:c, ori:'H' }; }
            }
            if (podeColocar(r, c, 'V', pH, pV, wl, pos)) {
                var tV = pV.concat([[r, c]]);
                var gV = bfs(1, pH, pV, pos) - bfs(1, pH, tV, pos);
                if (gV > maiorGanho) { maiorGanho = gV; cand = { type:'wall', r:r, c:c, ori:'V' }; }
            }
        }
        return maiorGanho >= 2 ? cand : null;
    }

    // ===== MELHORIA 2: Reserva dinâmica de paredes =====
    function reservaDinamica(pH, pV, pos) {
        var d0 = bfs(0, pH, pV, pos);
        var d1 = bfs(1, pH, pV, pos);
        // Início (oponente longe): guarda 4
        if (d0 >= 6 && d1 <= 4) return 4;
        // Meio: guarda 3
        if (d0 >= 4) return 3;
        // Final: guarda 0
        return 0;
    }

    // ===== MELHORIA 3: Mapa de estrangulamento =====
    function casasEstrangulamento(player, pH, pV, pos) {
        // Casas por onde TODOS os caminhos mínimos passam
        var contagem = {};
        for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) contagem[r+','+c] = 0;
        var goal = WIN[player];
        var start = [pos[player][0], pos[player][1]];
        var dist = {}; dist[start[0]+','+start[1]] = 0;
        var q = [[start[0], start[1]]];
        var qi = 0;
        var distFinal = 999;
        while (qi < q.length) {
            var cur = q[qi++];
            var k = cur[0]+','+cur[1];
            if (cur[0] === goal) { distFinal = Math.min(distFinal, dist[k]); continue; }
            var tpos = [pos[0].slice(), pos[1].slice()];
            tpos[player] = [cur[0], cur[1]];
            var nb = lm(player, pH, pV, tpos);
            for (var i=0;i<nb.length;i++) {
                var nk = nb[i][0]+','+nb[i][1];
                if (dist[nk] === undefined) {
                    dist[nk] = dist[k]+1;
                    q.push([nb[i][0], nb[i][1]]);
                }
            }
        }
        for (var kk in dist) {
            if (dist[kk] < distFinal) contagem[kk]++;
        }
        return contagem;
    }

    // ===== MELHORIA 4: Simulação de sequência dupla de paredes =====
    function bloqueioDuploEfetivo(pH, pV, pos, iaIdx) {
        var wl = G.walls[iaIdx];
        if (wl < 2) return null;
        var opp = 1 - iaIdx;
        var dOppAntes = bfs(opp, pH, pV, pos);
        var melhor = null, melhorGanho = 0;
        // Tenta cada parede + segunda parede
        var lim1 = 0;
        for (var r1 = 0; r1 < 8 && lim1 < 8; r1++) {
            for (var c1 = 0; c1 < 8 && lim1 < 8; c1++) {
                if (podeColocar(r1, c1, 'H', pH, pV, wl, pos)) {
                    var pH2 = pH.concat([[r1, c1]]);
                    var dH1 = bfs(opp, pH2, pV, pos);
                    var ganho1 = dH1 - dOppAntes;
                    if (ganho1 >= 1) {
                        // Tenta uma segunda parede
                        for (var r2 = 0; r2 < 8; r2 += 2) {
                            for (var c2 = 0; c2 < 8; c2 += 2) {
                                if (podeColocar(r2, c2, 'V', pH2, pV, wl - 1, pos)) {
                                    var pV2 = pV.concat([[r2, c2]]);
                                    var dTotal = bfs(opp, pH2, pV2, pos);
                                    var ganhoTotal = dTotal - dOppAntes;
                                    if (ganhoTotal > melhorGanho) {
                                        melhorGanho = ganhoTotal;
                                        melhor = { type:'wall', r:r1, c:c1, ori:'H', ganho:ganhoTotal };
                                    }
                                }
                            }
                        }
                    }
                }
                lim1++;
            }
        }
        return melhorGanho >= 5 ? melhor : null;
    }

    // ===== MELHORIA 5: Antecipação de salto =====
    function anteciparSalto(pH, pV, pos) {
        var r1 = pos[1][0], c1 = pos[1][1];
        var r0 = pos[0][0], c0 = pos[0][1];
        // Se estão adjacentes
        var adj = (Math.abs(r1-r0) + Math.abs(c1-c0)) === 1;
        if (!adj) return null;
        // Oponente pode saltar 2 casas? Simular
        var dr = r0 - r1, dc = c0 - c1;
        var jr = r0 + dr, jc = c0 + dc;
        if (jr < 0 || jr > 8 || jc < 0 || jc > 8) return null;
        // Verificar se o salto é legal
        if (wb(pH, pV, r0, c0, jr, jc)) return null;
        // O salto é possível: bloquear atrás
        return { r: r0, c: c0, jr: jr, jc: jc };
    }

    // ===== MELHORIA 6: Sinal de pânico do oponente =====
    function oponenteEmPanico() {
        if (!G.hist) return false;
        var ultimas = G.hist.slice(-6);
        var paredesOpp = 0;
        for (var i = 0; i < ultimas.length; i++) {
            if (ultimas[i].type === 'wall' && ultimas[i].turn === 0) paredesOpp++;
        }
        return paredesOpp >= 3;
    }

    // ===== MELHORIA 7: Análise de relógio =====
    function analisarRelogio() {
        if (!G || !G.clock) return 'neutro';
        var tempo = G.clock;
        // Se IA tem muito tempo e oponente pouco, IA pode ser paciente
        // Se IA tem pouco tempo, IA precisa ser agressiva
        if (currentTime < config.time * 0.3) return 'urgente';
        return 'neutro';
    }

    // ===== MELHORIA 8: Simulação do pior caso =====
    function piorRespostaPossivel(pH, pV, pos, oppIdx) {
        var moves = lm(oppIdx, pH, pV, pos);
        var piorD = 999;
        for (var i = 0; i < moves.length; i++) {
            var np = [pos[0].slice(), pos[1].slice()];
            np[oppIdx] = [moves[i][0], moves[i][1]];
            var d = bfs(oppIdx, pH, pV, np);
            if (d < piorD) piorD = d;
        }
        return piorD;
    }

    // ===== WRAPPER FINAL =====
    window.iaJogarExpert = function () {
        if (!G || !G.vsIA || G.over || G.turn !== 1) return null;

        var pos = [G.pos[0].slice(), G.pos[1].slice()];
        var pH = (G.pH || []).map(function(w){ return [w[0], w[1]]; });
        var pV = (G.pV || []).map(function(w){ return [w[0], w[1]]; });
        var walls = [G.walls[0], G.walls[1]];
        var iaIdx = 1, oppIdx = 0;

        // 1. Vitória imediata
        var winM = lm(iaIdx, pH, pV, pos).filter(function(m){ return m[0] === WIN[iaIdx]; });
        if (winM.length > 0) return { type:'move', r:winM[0][0], c:winM[0][1] };

        var d0 = bfs(oppIdx, pH, pV, pos);
        var d1 = bfs(iaIdx, pH, pV, pos);

        // 2. Bloqueio obrigatório
        if (d0 === 1) {
            for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
                if (podeColocar(r, c, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH = pH.concat([[r, c]]);
                    if (bfs(oppIdx, tH, pV, pos) > 1) return { type:'wall', r:r, c:c, ori:'H' };
                }
                if (podeColocar(r, c, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV = pV.concat([[r, c]]);
                    if (bfs(oppIdx, pH, tV, pos) > 1) return { type:'wall', r:r, c:c, ori:'V' };
                }
            }
        }

        // 3. Zona morta: recuperar
        if (emZonaMorta(pH, pV, pos)) {
            var rec = recuperarZonaMorta(pH, pV, pos);
            if (rec) return rec;
        }

        // 4. Antecipar salto: bloquear atrás
        var salto = anteciparSalto(pH, pV, pos);
        if (salto && d0 <= 3 && walls[iaIdx] > 1) {
            // Tenta colocar parede atrás do oponente
            var rA = salto.r, cA = salto.c;
            // Candidatos: paredes ao redor da casa atual
            var possiveis = [
                { r: rA, c: cA, ori: 'H' },
                { r: rA-1, c: cA, ori: 'H' },
                { r: rA, c: cA, ori: 'V' },
                { r: rA, c: cA-1, ori: 'V' }
            ];
            for (var k = 0; k < possiveis.length; k++) {
                var p = possiveis[k];
                if (p.r >= 0 && p.r < 8 && p.c >= 0 && p.c < 8) {
                    if (podeColocar(p.r, p.c, p.ori, pH, pV, walls[iaIdx], pos)) {
                        return { type:'wall', r:p.r, c:p.c, ori:p.ori };
                    }
                }
            }
        }

        // 5. Bloqueio duplo quando oponente está muito perto
        if (d0 <= 2 && walls[iaIdx] >= 2) {
            var duplo = bloqueioDuploEfetivo(pH, pV, pos, iaIdx);
            if (duplo) return duplo;
        }

        // 6. Reserva dinâmica: não gastar além da reserva
        var reserva = reservaDinamica(pH, pV, pos);
        var podeGastar = walls[iaIdx] > reserva;

        // 7. Oponente em pânico: parar de bloquear e correr
        if (oponenteEmPanico() && d0 >= 4) {
            var movs = lm(iaIdx, pH, pV, pos);
            var melhorCorrida = null, menorD = 999;
            for (var i = 0; i < movs.length; i++) {
                var np = [pos[0].slice(), pos[1].slice()];
                np[iaIdx] = [movs[i][0], movs[i][1]];
                var dd = bfs(iaIdx, pH, pV, np);
                if (dd < menorD) { menorD = dd; melhorCorrida = movs[i]; }
            }
            if (melhorCorrida) return { type:'move', r:melhorCorrida[0], c:melhorCorrida[1] };
        }

        // 8. Bloqueio preventivo com estrangulamento
        if (d0 <= 5 && podeGastar) {
            var estrang = casasEstrangulamento(oppIdx, pH, pV, pos);
            var melhorWall = null, melhorScore = 0;
            for (var r2 = 0; r2 < 8; r2++) for (var c2 = 0; c2 < 8; c2++) {
                if (podeColocar(r2, c2, 'H', pH, pV, walls[iaIdx], pos)) {
                    var tH2 = pH.concat([[r2, c2]]);
                    var ganhoH = bfs(oppIdx, tH2, pV, pos) - d0;
                    var custoH = bfs(iaIdx, tH2, pV, pos) - d1;
                    if (ganhoH > 0 && custoH <= 1) {
                        var heatH = (estrang[r2+','+c2] || 0) + (estrang[(r2+1)+','+c2] || 0);
                        var scH = ganhoH * 20 + heatH * 3 - custoH * 10;
                        if (scH > melhorScore) { melhorScore = scH; melhorWall = { type:'wall', r:r2, c:c2, ori:'H' }; }
                    }
                }
                if (podeColocar(r2, c2, 'V', pH, pV, walls[iaIdx], pos)) {
                    var tV2 = pV.concat([[r2, c2]]);
                    var ganhoV = bfs(oppIdx, pH, tV2, pos) - d0;
                    var custoV = bfs(iaIdx, pH, tV2, pos) - d1;
                    if (ganhoV > 0 && custoV <= 1) {
                        var heatV = (estrang[r2+','+c2] || 0) + (estrang[r2+','+(c2+1)] || 0);
                        var scV = ganhoV * 20 + heatV * 3 - custoV * 10;
                        if (scV > melhorScore) { melhorScore = scV; melhorWall = { type:'wall', r:r2, c:c2, ori:'V' }; }
                    }
                }
            }
            if (melhorWall && melhorScore >= 25) return melhorWall;
        }

        // 9. Delega para a IA consolidada
        return _base.apply(this, arguments);
    };

    // Reset no início da partida
    if (typeof resetGame === 'function') {
        var _origResetX = resetGame;
        window.resetGame = resetGame = function () {
            return _origResetX.apply(this, arguments);
        };
    }

    console.log('IA_EXPERT_MELHORIAS_EXTRA ATIVO');
})();
// ===================== FIM IA_EXPERT_MELHORIAS_EXTRA =====================
