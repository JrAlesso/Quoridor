// =====================================================================
// ia_cerebro.js
// =====================================================================
// Nova IA Expert — "1 cérebro com 17 técnicas"
//
// Estrutura:
//   CerebroIA.bfsDist          — distância mínima até a meta
//   CerebroIA.bfsPath          — caminho completo até a meta
//   CerebroIA.legalMoves       — movimentos legais (inclui saltos)
//   CerebroIA.wallBlock        — verifica se parede bloqueia passagem
//   CerebroIA.canPlace         — valida colocação de parede
//   CerebroIA.canWinNext       — jogador vence no próximo turno?
//   CerebroIA.<17 técnicas>    — técnicas individuais (a partir de C.8)
//   CerebroIA.jogar()          — cérebro: decide qual técnica usar
//
// Este arquivo é carregado DEPOIS do script.js. Não substitui nada
// enquanto não integrarmos. Usa constantes globais (N, WIN, G) do jogo.
// =====================================================================

(function () {
    'use strict';

    var CerebroIA = {};

    // Dependências do jogo (existem globalmente no script.js)
    function getN() { return (typeof N !== 'undefined') ? N : 9; }
    function getWIN() { return (typeof WIN !== 'undefined') ? WIN : [0, 8]; }

    // =====================================================================
    // FUNÇÃO BASE 1 — bfsDist
    // Retorna a distância mínima do peão até sua linha de vitória.
    // Retorna 99 se não há caminho (não deveria acontecer em Quoridor).
    // =====================================================================
    CerebroIA.bfsDist = function (player, pH, pV, pos) {
        var N = getN();
        var WIN = getWIN();
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
            var nb = CerebroIA.legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (seen[key]) continue;
                seen[key] = 1;
                q.push([nb[i][0], nb[i][1], cur[2] + 1]);
            }
        }
        return 99;
    };

    // =====================================================================
    // FUNÇÃO BASE 2 — legalMoves (movimentos legais com pulo e diagonal)
    // Retorna array de [r,c] para onde o peão pode ir nesse turno.
    // Inclui: movimento simples, pulo sobre adversário, diagonal pós-pulo.
    // =====================================================================
    CerebroIA.legalMoves = function (player, pH, pV, pos) {
        var N = getN();
        var r = pos[player][0], c = pos[player][1], other = pos[1 - player];
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        var out = [];
        for (var i = 0; i < 4; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr > N - 1 || nc < 0 || nc > N - 1) continue;
            if (CerebroIA.wallBlock(pH, pV, r, c, nr, nc)) continue;
            if (nr === other[0] && nc === other[1]) {
                var dr = nr - r, dc = nc - c;
                var jr = nr + dr, jc = nc + dc;
                if (jr >= 0 && jr <= N - 1 && jc >= 0 && jc <= N - 1 && !CerebroIA.wallBlock(pH, pV, nr, nc, jr, jc)) {
                    out.push([jr, jc]);
                } else {
                    var sides = dr !== 0 ? [[nr, nc - 1], [nr, nc + 1]] : [[nr - 1, nc], [nr + 1, nc]];
                    for (var s = 0; s < 2; s++) {
                        if (sides[s][0] >= 0 && sides[s][0] <= N - 1 && sides[s][1] >= 0 && sides[s][1] <= N - 1 && !CerebroIA.wallBlock(pH, pV, nr, nc, sides[s][0], sides[s][1])) {
                            out.push(sides[s]);
                        }
                    }
                }
            } else {
                out.push([nr, nc]);
            }
        }
        return out;
    };

    // =====================================================================
    // FUNÇÃO BASE 3 — wallBlock
    // Verifica se há parede entre duas casas adjacentes.
    // (r1,c1) e (r2,c2) devem ser vizinhas (distância 1 em r ou c).
    // pH = paredes horizontais, pV = paredes verticais.
    // =====================================================================
    CerebroIA.wallBlock = function (pH, pV, r1, c1, r2, c2) {
        if (r1 === r2 && Math.abs(c1 - c2) === 1) {
            var cMin = Math.min(c1, c2);
            for (var i = 0; i < pV.length; i++) {
                if (pV[i][1] === cMin && (pV[i][0] === r1 || pV[i][0] === r1 - 1)) return true;
            }
        }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) {
            var rMin = Math.min(r1, r2);
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === rMin && (pH[i][1] === c1 || pH[i][1] === c1 - 1)) return true;
            }
        }
        return false;
    };

    // =====================================================================
    // FUNÇÃO BASE 4 — canPlace
    // Verifica se é legal colocar uma parede em (r,c).
    // Regra de Quoridor: a parede não pode sobrepor outra, e não pode
    // bloquear totalmente o caminho de NENHUM dos jogadores.
    // ori = 'H' (horizontal) ou 'V' (vertical).
    // =====================================================================
    CerebroIA.canPlace = function (r, c, ori, pH, pV, positions) {
        var N = getN();
        pH = pH || G.pH; pV = pV || G.pV; positions = positions || G.pos;
        if (r < 0 || r >= N - 1 || c < 0 || c >= N - 1) return false;
        if (ori === 'H') {
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
                if (pH[i][0] === r && (pH[i][1] === c - 1 || pH[i][1] === c + 1)) return false;
            }
            for (var i = 0; i < pV.length; i++) {
                if (pV[i][0] === r && pV[i][1] === c) return false;
            }
        } else {
            for (var i = 0; i < pV.length; i++) {
                if (pV[i][0] === r && pV[i][1] === c) return false;
                if (pV[i][1] === c && (pV[i][0] === r - 1 || pV[i][0] === r + 1)) return false;
            }
            for (var i = 0; i < pH.length; i++) {
                if (pH[i][0] === r && pH[i][1] === c) return false;
            }
        }
        var tH = ori === 'H' ? pH.concat([[r, c]]) : pH.slice();
        var tV = ori === 'V' ? pV.concat([[r, c]]) : pV.slice();
        return CerebroIA.bfsDist(0, tH, tV, positions) < 99 && CerebroIA.bfsDist(1, tH, tV, positions) < 99;
    };

    // =====================================================================
    // FUNÇÃO BASE 5 — canWinNext
    // Retorna true se o jogador vence no próximo movimento.
    // =====================================================================
    CerebroIA.canWinNext = function (player, pH, pV, pos) {
        var WIN = getWIN();
        var moves = CerebroIA.legalMoves(player, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            if (moves[i][0] === WIN[player]) return true;
        }
        return false;
    };

    // =====================================================================
    // FUNÇÃO BASE 6 — bfsPath
    // Igual ao bfsDist, mas retorna também o caminho completo.
    // Uso: var r = CerebroIA.bfsPath(0, pH, pV, pos);
    //      r.dist = número de passos; r.path = array de [r,c].
    // =====================================================================
    CerebroIA.bfsPath = function (player, pH, pV, pos) {
        var N = getN();
        var WIN = getWIN();
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
            var nb = CerebroIA.legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var key = nb[i][0] + ',' + nb[i][1];
                if (key in parent) continue;
                parent[key] = cur[0] + ',' + cur[1];
                q.push([nb[i][0], nb[i][1]]);
            }
        }
        return { dist: 99, path: [] };
    };

    // =====================================================================
    // TÉCNICA 1 — gps
    // Segue sempre o próximo passo do caminho mais curto. Burro e eficiente.
    // Retorna {type:'move'} ou null.
    // =====================================================================
    CerebroIA.gps = function (pos, pH, pV, walls, iaIdx) {
        var rota = CerebroIA.bfsPath(iaIdx, pH, pV, pos);
        if (!rota.path || rota.path.length < 2) return null;
        return { type: 'move', r: rota.path[1][0], c: rota.path[1][1] };
    };

    // =====================================================================
    // TÉCNICA 2 — visaoReal
    // Enxerga a rota completa do oponente. Se ele está perto, bloqueia.
    // Senão, segue caminho próprio.
    // =====================================================================
    CerebroIA.visaoReal = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // Vitória imediata
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) {
                    return { type: 'move', r: mv[i][0], c: mv[i][1] };
                }
            }
        }

        // Se oponente está perto (≤2), tenta bloqueio simples
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        if (oppD <= 2 && walls[iaIdx] > 0) {
            var melhor = null, melhorGanho = 0;
            for (var r = 0; r < 8; r++) {
                for (var c = 0; c < 8; c++) {
                    if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                        var tH = pH.concat([[r, c]]);
                        var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                        if (gH > melhorGanho) { melhorGanho = gH; melhor = {type:'wall', r:r, c:c, ori:'H'}; }
                    }
                    if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                        var tV = pV.concat([[r, c]]);
                        var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                        if (gV > melhorGanho) { melhorGanho = gV; melhor = {type:'wall', r:r, c:c, ori:'V'}; }
                    }
                }
            }
            if (melhor) return melhor;
        }

        // Fallback: segue caminho
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 3 — economicaV1
    // Só bloqueia em situação crítica. Longe = corre.
    // =====================================================================
    CerebroIA.economicaV1 = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);

        // Vitória imediata
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) {
                    return { type: 'move', r: mv[i][0], c: mv[i][1] };
                }
            }
        }

        // Se oponente longe (≥3) → corre direto
        if (oppD >= 3 || walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Oponente perto (≤2) → bloqueia a melhor parede
        var melhor = null, melhorGanho = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var tH = pH.concat([[r, c]]);
                    var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                    if (gH > melhorGanho) { melhorGanho = gH; melhor = {type:'wall', r:r, c:c, ori:'H'}; }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var tV = pV.concat([[r, c]]);
                    var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                    if (gV > melhorGanho) { melhorGanho = gV; melhor = {type:'wall', r:r, c:c, ori:'V'}; }
                }
            }
        }
        if (melhor) return melhor;

        // Fallback: corre
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 4 — justa
    // Bloqueio leve. Só age quando o oponente já passou do meio (linha 4).
    // Senão, corre.
    // =====================================================================
    CerebroIA.justa = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;
        var oppRow = pos[oppIdx][0];

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Oponente "passou do meio"? Depende de quem ele é.
        var passouDoMeio = (iaIdx === 1) ? (oppRow <= 4) : (oppRow >= 4);
        if (!passouDoMeio || walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Bloqueia se ganho for significativo (≥2)
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var melhor = null, melhorGanho = 1;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var tH = pH.concat([[r, c]]);
                    var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                    if (gH > melhorGanho) { melhorGanho = gH; melhor = {type:'wall', r:r, c:c, ori:'H'}; }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var tV = pV.concat([[r, c]]);
                    var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                    if (gV > melhorGanho) { melhorGanho = gV; melhor = {type:'wall', r:r, c:c, ori:'V'}; }
                }
            }
        }
        if (melhor) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 5 — economicaV2
    // Só considera paredes que TOCAM o caminho real do oponente.
    // Muito mais seletiva que economicaV1.
    // =====================================================================
    CerebroIA.economicaV2 = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        if (walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        var rotaOpp = CerebroIA.bfsPath(oppIdx, pH, pV, pos);
        var oppD = rotaOpp.dist;

        // Se oponente está longe (>5), corre
        if (oppD > 5) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Cria "conjunto" das células do caminho do oponente
        var celulas = {};
        for (var k = 0; k < rotaOpp.path.length; k++) {
            celulas[rotaOpp.path[k][0] + ',' + rotaOpp.path[k][1]] = true;
        }

        var melhor = null, melhorGanho = 0;
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                // H: toca se (r,c) ou (r+1,c) estão no caminho do oponente
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    if (celulas[r + ',' + c] || celulas[(r + 1) + ',' + c]) {
                        var tH = pH.concat([[r, c]]);
                        var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                        var mH = CerebroIA.bfsDist(iaIdx, tH, pV, pos) - meuD;
                        if (gH >= 2 && mH <= 1 && gH > melhorGanho) {
                            melhorGanho = gH;
                            melhor = {type:'wall', r:r, c:c, ori:'H'};
                        }
                    }
                }
                // V: toca se (r,c) ou (r,c+1) estão no caminho do oponente
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    if (celulas[r + ',' + c] || celulas[r + ',' + (c + 1)]) {
                        var tV = pV.concat([[r, c]]);
                        var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                        var mV = CerebroIA.bfsDist(iaIdx, pH, tV, pos) - meuD;
                        if (gV >= 2 && mV <= 1 && gV > melhorGanho) {
                            melhorGanho = gV;
                            melhor = {type:'wall', r:r, c:c, ori:'V'};
                        }
                    }
                }
            }
        }
        if (melhor) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 6 — invencivel
    // Bloqueio ofensivo com pontuação (caminho + progresso do oponente).
    // =====================================================================
    CerebroIA.invencivel = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        if (walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // Pontuação de cada parede candidata
        var melhor = null, melhorScore = -1e9;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var tH = pH.concat([[r, c]]);
                    var nOpp = CerebroIA.bfsDist(oppIdx, tH, pV, pos);
                    var nMe = CerebroIA.bfsDist(iaIdx, tH, pV, pos);
                    var score = (nOpp - oppD) * 15 - (nMe - meuD) * 10;
                    if (score > melhorScore) {
                        melhorScore = score;
                        melhor = {type:'wall', r:r, c:c, ori:'H'};
                    }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var tV = pV.concat([[r, c]]);
                    var nOppV = CerebroIA.bfsDist(oppIdx, pH, tV, pos);
                    var nMeV = CerebroIA.bfsDist(iaIdx, pH, tV, pos);
                    var scoreV = (nOppV - oppD) * 15 - (nMeV - meuD) * 10;
                    if (scoreV > melhorScore) {
                        melhorScore = scoreV;
                        melhor = {type:'wall', r:r, c:c, ori:'V'};
                    }
                }
            }
        }

        // Se a melhor parede traz ganho real (≥1) e não me atrasa muito, usa
        if (melhor && melhorScore >= 5) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 7 — antiBrecha
    // Bloqueio preventivo agressivo. Se oponente está a ≤3, sempre bloqueia
    // a melhor parede. Não economiza.
    // =====================================================================
    CerebroIA.antiBrecha = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);

        // Se oponente está longe (>3), corre
        if (oppD > 3 || walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Se oponente está perto (≤3), bloqueia a MELHOR parede sem restrição
        var melhor = null, melhorGanho = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var tH = pH.concat([[r, c]]);
                    var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                    if (gH > melhorGanho) { melhorGanho = gH; melhor = {type:'wall', r:r, c:c, ori:'H'}; }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var tV = pV.concat([[r, c]]);
                    var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                    if (gV > melhorGanho) { melhorGanho = gV; melhor = {type:'wall', r:r, c:c, ori:'V'}; }
                }
            }
        }
        if (melhor) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 8 — etapa2BloqueioDuplo
    // Simula: minha parede → resposta do oponente → situação resultante.
    // Só usa se, após a resposta dele, o bloqueio ainda vale.
    // =====================================================================
    CerebroIA.etapa2BloqueioDuplo = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        if (walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        // Só simula se oponente está próximo (≤4)
        if (oppD > 4) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Simula melhor resposta do oponente após uma jogada hipotética
        function melhorRespostaOponente(nPos, npH, npV) {
            var mv = CerebroIA.legalMoves(oppIdx, npH, npV, nPos);
            var melhor = 999;
            for (var i = 0; i < mv.length; i++) {
                var tpos = [nPos[0].slice(), nPos[1].slice()];
                tpos[oppIdx] = [mv[i][0], mv[i][1]];
                var d = CerebroIA.bfsDist(oppIdx, npH, npV, tpos);
                if (d < melhor) melhor = d;
            }
            return melhor;
        }

        var melhor = null, melhorScore = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var ori = null;
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) ori = 'H';
                else if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) ori = 'V';
                if (!ori) continue;

                var tH = ori === 'H' ? pH.concat([[r, c]]) : pH.slice();
                var tV = ori === 'V' ? pV.concat([[r, c]]) : pV.slice();

                // Distância do oponente após meu bloqueio + melhor resposta dele
                var distAposBloqueio = CerebroIA.bfsDist(oppIdx, tH, tV, pos);
                var respOp = melhorRespostaOponente(pos, tH, tV);
                var score = (distAposBloqueio - oppD) * 10 + (respOp - oppD) * 5;

                if (score > melhorScore) {
                    melhorScore = score;
                    melhor = {type:'wall', r:r, c:c, ori:ori};
                }
            }
        }

        // Só usa se o bloqueio resultante é forte (score ≥ 20)
        if (melhor && melhorScore >= 20) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 9 — etapa3Gargalo
    // Encontra parede que fecha MAIS caminhos de uma vez.
    // =====================================================================
    CerebroIA.etapa3Gargalo = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        if (walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        var rotaOpp = CerebroIA.bfsPath(oppIdx, pH, pV, pos);
        var oppD = rotaOpp.dist;
        if (oppD > 5) return CerebroIA.gps(pos, pH, pV, walls, iaIdx);

        // Cria conjunto de células no caminho do oponente
        var celulas = {};
        for (var k = 0; k < rotaOpp.path.length; k++) {
            celulas[rotaOpp.path[k][0] + ',' + rotaOpp.path[k][1]] = true;
        }

        // Para cada parede, conta quantas células do caminho ela toca
        var melhor = null, melhorCobertura = 0, melhorGanho = 0;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var cob = 0;
                    if (celulas[r + ',' + c]) cob++;
                    if (celulas[(r + 1) + ',' + c]) cob++;
                    var tH = pH.concat([[r, c]]);
                    var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                    if (gH > 0 && (cob > melhorCobertura || (cob === melhorCobertura && gH > melhorGanho))) {
                        melhorCobertura = cob;
                        melhorGanho = gH;
                        melhor = {type:'wall', r:r, c:c, ori:'H'};
                    }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var cobV = 0;
                    if (celulas[r + ',' + c]) cobV++;
                    if (celulas[r + ',' + (c + 1)]) cobV++;
                    var tV = pV.concat([[r, c]]);
                    var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                    if (gV > 0 && (cobV > melhorCobertura || (cobV === melhorCobertura && gV > melhorGanho))) {
                        melhorCobertura = cobV;
                        melhorGanho = gV;
                        melhor = {type:'wall', r:r, c:c, ori:'V'};
                    }
                }
            }
        }
        if (melhor) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 10 — strategicV1
    // Avaliação estratégica: diferença + ameaça + mobilidade.
    // =====================================================================
    CerebroIA.strategicV1 = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        if (walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        var d0 = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var d1 = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // Bônus de ameaça: se oponente está a 2-3, é urgente
        var threatBonus = (d0 <= 3) ? (4 - d0) * 300 : 0;

        var melhor = null, melhorScore = -1e9;
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var tH = pH.concat([[r, c]]);
                    var nOpp = CerebroIA.bfsDist(oppIdx, tH, pV, pos);
                    var nMe = CerebroIA.bfsDist(iaIdx, tH, pV, pos);
                    var mobOpp = CerebroIA.legalMoves(oppIdx, tH, pV, pos).length;
                    var score = (nOpp - d0) * 20 - (nMe - d1) * 12 + threatBonus - mobOpp * 8;
                    if (score > melhorScore) {
                        melhorScore = score;
                        melhor = {type:'wall', r:r, c:c, ori:'H'};
                    }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var tV = pV.concat([[r, c]]);
                    var nOppV = CerebroIA.bfsDist(oppIdx, pH, tV, pos);
                    var nMeV = CerebroIA.bfsDist(iaIdx, pH, tV, pos);
                    var mobOppV = CerebroIA.legalMoves(oppIdx, pH, tV, pos).length;
                    var scoreV = (nOppV - d0) * 20 - (nMeV - d1) * 12 + threatBonus - mobOppV * 8;
                    if (scoreV > melhorScore) {
                        melhorScore = scoreV;
                        melhor = {type:'wall', r:r, c:c, ori:'V'};
                    }
                }
            }
        }
        if (melhor && melhorScore >= 10) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 11 — forte
    // Minimax raso com previsão da resposta do oponente.
    // =====================================================================
    CerebroIA.forte = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Avaliação da posição
        function avaliar(ppos, ppH, ppV, pw) {
            var d0 = CerebroIA.bfsDist(oppIdx, ppH, ppV, ppos);
            var d1 = CerebroIA.bfsDist(iaIdx, ppH, ppV, ppos);
            var score = (d0 - d1) * 100;
            score += (pw[iaIdx] - pw[oppIdx]) * 25;
            if (d0 <= 2) score += (3 - d0) * 800;
            return score;
        }

        // Melhor resposta do oponente (1 ply)
        function melhorRespostaOp(nPos, npH, npV) {
            var mv = CerebroIA.legalMoves(oppIdx, npH, npV, nPos);
            var piorPraMim = 1e9;
            for (var i = 0; i < mv.length; i++) {
                var tp = [nPos[0].slice(), nPos[1].slice()];
                tp[oppIdx] = [mv[i][0], mv[i][1]];
                var v = avaliar(tp, npH, npV, walls);
                if (v < piorPraMim) piorPraMim = v;
            }
            return piorPraMim;
        }

        var melhor = null, melhorScore = -1e9;

        // Testa movimentos
        var moves = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            var nPos = [pos[0].slice(), pos[1].slice()];
            nPos[iaIdx] = [moves[i][0], moves[i][1]];
            var score = melhorRespostaOp(nPos, pH, pV);
            if (score > melhorScore) {
                melhorScore = score;
                melhor = {type:'move', r: moves[i][0], c: moves[i][1]};
            }
        }

        // Testa paredes (só se oponente próximo)
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        if (walls[iaIdx] > 0 && oppD <= 4) {
            for (var r = 0; r < 8; r++) {
                for (var c = 0; c < 8; c++) {
                    var ori = null;
                    if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) ori = 'H';
                    else if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) ori = 'V';
                    if (!ori) continue;
                    var tH = ori === 'H' ? pH.concat([[r, c]]) : pH.slice();
                    var tV = ori === 'V' ? pV.concat([[r, c]]) : pV.slice();
                    var nw = walls.slice(); nw[iaIdx]--;
                    var sc = melhorRespostaOp(pos, tH, tV);
                    if (sc > melhorScore) {
                        melhorScore = sc;
                        melhor = {type:'wall', r:r, c:c, ori:ori};
                    }
                }
            }
        }
        if (melhor) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 12 — consolidadaFinal
    // BFS + mapa de calor + previsão de 2 jogadas.
    // A versão mais completa — base da IA Expert atual.
    // =====================================================================
    CerebroIA.consolidadaFinal = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);

        // 1. Bloqueio obrigatório (oponente a 1)
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            for (var r = 0; r < 8; r++) {
                for (var c = 0; c < 8; c++) {
                    if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                        var tH = pH.concat([[r, c]]);
                        if (!CerebroIA.canWinNext(oppIdx, tH, pV, pos)) {
                            return {type:'wall', r:r, c:c, ori:'H'};
                        }
                    }
                    if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                        var tV = pV.concat([[r, c]]);
                        if (!CerebroIA.canWinNext(oppIdx, pH, tV, pos)) {
                            return {type:'wall', r:r, c:c, ori:'V'};
                        }
                    }
                }
            }
        }

        // 2. Previsão 2 jogadas: se oponente chega a ≤2 em 2 turnos, bloqueia
        if (oppD <= 4 && walls[iaIdx] > 0) {
            var rotaOpp = CerebroIA.bfsPath(oppIdx, pH, pV, pos);
            var celulas = {};
            for (var k = 0; k < rotaOpp.path.length; k++) {
                celulas[rotaOpp.path[k][0] + ',' + rotaOpp.path[k][1]] = true;
            }
            var melhor = null, melhorGanho = 0;
            var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);
            for (var r = 0; r < 8; r++) {
                for (var c = 0; c < 8; c++) {
                    if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                        if (celulas[r + ',' + c] || celulas[(r + 1) + ',' + c]) {
                            var tH2 = pH.concat([[r, c]]);
                            var gH = CerebroIA.bfsDist(oppIdx, tH2, pV, pos) - oppD;
                            var mH = CerebroIA.bfsDist(iaIdx, tH2, pV, pos) - meuD;
                            if (gH >= 2 && mH <= 1 && gH > melhorGanho) {
                                melhorGanho = gH;
                                melhor = {type:'wall', r:r, c:c, ori:'H'};
                            }
                        }
                    }
                    if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                        if (celulas[r + ',' + c] || celulas[r + ',' + (c + 1)]) {
                            var tV2 = pV.concat([[r, c]]);
                            var gV = CerebroIA.bfsDist(oppIdx, pH, tV2, pos) - oppD;
                            var mV = CerebroIA.bfsDist(iaIdx, pH, tV2, pos) - meuD;
                            if (gV >= 2 && mV <= 1 && gV > melhorGanho) {
                                melhorGanho = gV;
                                melhor = {type:'wall', r:r, c:c, ori:'V'};
                            }
                        }
                    }
                }
            }
            if (melhor) return melhor;
        }

        // 3. Fallback: corre pelo caminho mínimo
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // HELPERS DE MEMÓRIA (com fallback seguro pra ambiente sem localStorage)
    // =====================================================================
    function _getUserKey() {
        try {
            if (typeof currentUser === 'string' && currentUser) return currentUser.toLowerCase();
        } catch (e) {}
        return 'anon';
    }

    function _lerMemoria(chave, valorPadrao) {
        try {
            if (typeof localStorage === 'undefined') return valorPadrao;
            var raw = localStorage.getItem(chave);
            return raw ? JSON.parse(raw) : valorPadrao;
        } catch (e) {
            return valorPadrao;
        }
    }

    function _salvarMemoria(chave, valor) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(chave, JSON.stringify(valor));
        } catch (e) {}
    }

    // =====================================================================
    // TÉCNICA 13 — cemAberturas
    // Analisa as últimas 30 jogadas do jogador e escolhe abertura que
    // contra-ataca o estilo detectado.
    // =====================================================================
    CerebroIA.cemAberturas = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Se não temos histórico do oponente, delega pra consolidadaFinal
        var hist = _lerMemoria('quoridor_hist_' + _getUserKey(), []);
        if (!hist || hist.length < 4) {
            return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
        }

        // Análise simples: qual coluna o jogador prefere?
        var soma = 0, cont = 0;
        for (var i = 0; i < hist.length; i++) {
            if (hist[i].tipo === 'move') { soma += hist[i].c; cont++; }
        }
        var colMedia = cont > 0 ? soma / cont : 4;

        // Se jogador prefere esquerda, bloqueia esquerda cedo
        if (colMedia < 3.5 && walls[iaIdx] > 6) {
            // Tenta bloquear coluna 3 (esquerda)
            if (CerebroIA.canPlace(1, 2, 'H', pH, pV, pos)) {
                return {type:'wall', r:1, c:2, ori:'H'};
            }
        }
        // Se prefere direita, bloqueia direita
        if (colMedia > 4.5 && walls[iaIdx] > 6) {
            if (CerebroIA.canPlace(1, 5, 'H', pH, pV, pos)) {
                return {type:'wall', r:1, c:5, ori:'H'};
            }
        }

        // Senão, delega
        return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 14 — etapa4PunirPrevisivel
    // Memoriza aberturas entre partidas. Se o jogador repetiu 3+ vezes,
    // pré-bloqueia a casa que ele costuma ir.
    // =====================================================================
    CerebroIA.etapa4PunirPrevisivel = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        if (walls[iaIdx] <= 2) {
            return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
        }

        // Lê últimas aberturas memorizadas
        var mem = _lerMemoria('quoridor_aberturas_' + _getUserKey(), { aberturas: [], total: 0 });
        if (!mem.aberturas || mem.aberturas.length < 3) {
            return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
        }

        // Conta repetições
        var contagem = {};
        for (var i = 0; i < mem.aberturas.length; i++) {
            var k = mem.aberturas[i];
            contagem[k] = (contagem[k] || 0) + 1;
        }

        // Abertura mais comum (3+ repetições)
        for (var k in contagem) {
            if (contagem[k] >= 3) {
                var partes = k.split(',');
                var alvoR = parseInt(partes[0], 10);
                var alvoC = parseInt(partes[1], 10);

                // Se a IA ainda não bloqueou essa área, coloca uma parede ali
                if (alvoC >= 3 && alvoC <= 5 && alvoR >= 4 && alvoR <= 7) {
                    if (CerebroIA.canPlace(alvoR - 1, alvoC - 1, 'H', pH, pV, pos)) {
                        return {type:'wall', r: alvoR - 1, c: alvoC - 1, ori:'H'};
                    }
                }
            }
        }

        return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 15 — milPerfis
    // Sorteia 1 personalidade entre 1000 e delega comportamento à
    // consolidadaFinal com pesos ajustados.
    // =====================================================================
    var _perfilAtual = null;

    function _sortearPerfil() {
        // Gera 1 perfil aleatório entre 1000 combinações
        return {
            pesoDiferenca: 150 + Math.floor(Math.random() * 8) * 15,       // 150-255
            pesoParede: 20 + Math.floor(Math.random() * 7) * 10,           // 20-80
            agressividade: 0.1 + Math.random() * 0.8,                       // 0.1-0.9
            ganhoMinParede: 2 + Math.floor(Math.random() * 4),             // 2-5
            estilo: ['centro','lateral','agressivo','defensivo','equilibrado'][Math.floor(Math.random() * 5)]
        };
    }

    CerebroIA.milPerfis = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Sorteia 1 perfil na primeira chamada (fica estável durante a partida)
        if (!_perfilAtual) _perfilAtual = _sortearPerfil();
        var perfil = _perfilAtual;

        // Ajusta comportamento baseado no estilo
        // 'agressivo' → sempre tenta bloquear quando oponente ≤ 4
        // 'defensivo' → só bloqueia quando oponente ≤ 2
        // 'equilibrado' → bloqueia quando oponente ≤ 3
        // 'centro' → bloqueia caminho central
        // 'lateral' → bloqueia laterais

        if (walls[iaIdx] <= 0) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        var oppIdx = 1 - iaIdx;
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);

        var limiar;
        if (perfil.estilo === 'agressivo') limiar = 4;
        else if (perfil.estilo === 'defensivo') limiar = 2;
        else if (perfil.estilo === 'equilibrado') limiar = 3;
        else limiar = 3;

        if (oppD > limiar) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Bloqueia com peso ajustado por perfil
        var melhor = null, melhorScore = 0;
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);
        var ganhoMin = perfil.ganhoMinParede;

        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var tH = pH.concat([[r, c]]);
                    var gH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                    var mH = CerebroIA.bfsDist(iaIdx, tH, pV, pos) - meuD;
                    if (gH >= ganhoMin && mH <= 1) {
                        var sH = gH * perfil.pesoDiferenca - mH * perfil.pesoParede;
                        if (sH > melhorScore) {
                            melhorScore = sH;
                            melhor = {type:'wall', r:r, c:c, ori:'H'};
                        }
                    }
                }
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var tV = pV.concat([[r, c]]);
                    var gV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                    var mV = CerebroIA.bfsDist(iaIdx, pH, tV, pos) - meuD;
                    if (gV >= ganhoMin && mV <= 1) {
                        var sV = gV * perfil.pesoDiferenca - mV * perfil.pesoParede;
                        if (sV > melhorScore) {
                            melhorScore = sV;
                            melhor = {type:'wall', r:r, c:c, ori:'V'};
                        }
                    }
                }
            }
        }
        if (melhor) return melhor;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // FUNÇÃO AUXILIAR — resetar perfil (chamada quando inicia nova partida)
    // =====================================================================
    CerebroIA.resetarPerfil = function () {
        _perfilAtual = null;
    };

    // Expõe globalmente
    window.CerebroIA = CerebroIA;

    console.log('CerebroIA carregado — esqueleto OK');
})();
