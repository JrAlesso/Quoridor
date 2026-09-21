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

    // =====================================================================
    // TÉCNICA 16 — etapa1FimDeJogo
    // Quando ambos têm ≤2 paredes, IA para de bloquear e corre.
    // Só bloqueia se oponente estiver a 1 da vitória.
    // =====================================================================
    CerebroIA.etapa1FimDeJogo = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Fim de jogo? Ambos com ≤2 paredes
        var fimDeJogo = (walls[0] <= 2 && walls[iaIdx] <= 2);

        // Fora de endgame: delega pra base
        if (!fimDeJogo) {
            return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
        }

        // Em endgame: só bloqueia se oponente está a 1
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            var melhor = null;
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

        // Senão: corre pelo caminho mínimo
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // TÉCNICA 17 — melhoriasExtra
    // 8 melhorias táticas + delega pra consolidadaFinal quando não se aplica.
    // É a camada que roda HOJE no jogo (a "viva").
    // =====================================================================
    CerebroIA.melhoriasExtra = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // ---- Vitória imediata (regra de ouro) ----
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // ---- MELHORIA 1: Zona morta (caminho ≥14) ----
        if (meuD >= 14) {
            var recuperado = _recuperarZonaMorta(pos, pH, pV, walls, iaIdx);
            if (recuperado) return recuperado;
        }

        // ---- MELHORIA 2: Reserva dinâmica ----
        var paredesUsadasOpp = 10 - walls[oppIdx];
        var fase = 'inicio'; // 0-3 usadas
        if (paredesUsadasOpp >= 7) fase = 'final';
        else if (paredesUsadasOpp >= 4) fase = 'meio';
        var reservaMin = fase === 'inicio' ? 4 : fase === 'meio' ? 3 : 0;

        // ---- MELHORIA 6: Sinal de pânico ----
        // Se oponente gastou 3+ paredes rápido, IA para de bloquear e corre
        // (heurística: se oponente está com poucas paredes, ele está "all-in")
        if (walls[oppIdx] <= 2 && oppD <= 4 && meuD <= 3) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // ---- MELHORIA 3 + 4: Bloqueio duplo / gargalo ----
        if (oppD <= 3 && walls[iaIdx] > reservaMin) {
            // Tenta bloqueio duplo se oponente está muito perto
            if (oppD <= 2) {
                var bloqueioDuplo = CerebroIA.etapa2BloqueioDuplo(pos, pH, pV, walls, iaIdx);
                if (bloqueioDuplo && bloqueioDuplo.type === 'wall') return bloqueioDuplo;
            }
            // Senão, tenta gargalo
            var gargalo = CerebroIA.etapa3Gargalo(pos, pH, pV, walls, iaIdx);
            if (gargalo && gargalo.type === 'wall') return gargalo;
        }

        // ---- MELHORIA 5: Antecipação de salto ----
        // Se oponente está adjacente e pode saltar, coloca parede atrás dele
        var opR = pos[oppIdx][0], opC = pos[oppIdx][1];
        var iaR = pos[iaIdx][0], iaC = pos[iaIdx][1];
        var dist = Math.abs(opR - iaR) + Math.abs(opC - iaC);
        if (dist === 1 && walls[iaIdx] > reservaMin) {
            // Oponente adjacente — coloca parede atrás dele (na direção contrária)
            var dirR = opR - iaR, dirC = opC - iaC;
            var alvoR = opR + dirR, alvoC = opC + dirC;
            if (alvoR >= 0 && alvoR <= 7 && alvoC >= 0 && alvoC <= 7) {
                var oriAtras = dirR !== 0 ? 'H' : 'V';
                if (CerebroIA.canPlace(alvoR, alvoC, oriAtras, pH, pV, pos)) {
                    return {type:'wall', r:alvoR, c:alvoC, ori:oriAtras};
                }
            }
        }

        // ---- MELHORIA 7: Análise de relógio (skip se G.clock não existe) ----
        // Implementação futura.

        // ---- MELHORIA 8: Simulação do pior caso (delega) ----
        // A consolidadaFinal já faz simulação — delega pra ela
        return CerebroIA.consolidadaFinal(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // AUXILIAR — recuperarZonaMorta
    // Se o caminho da IA ficou ≥14, tenta melhorar (mas legalmente).
    // =====================================================================
    function _recuperarZonaMorta(pos, pH, pV, walls, iaIdx) {
        var oppIdx = 1 - iaIdx;
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // Tenta paredes que encurtam o próprio caminho (quebrando bloqueio que
        // o oponente fez) — não é remover parede dele, é criar atalho.
        // No Quoridor, paredes só atrapalham. Então "recuperar" é só correr.
        // Delega pra GPS que já busca o melhor caminho atual.
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    }

    // =====================================================================
    // CÉREBRO ORQUESTRADOR COM PERSONALIDADE + ANTI-LOOP
    // =====================================================================

    // ---- Personalidade (uma por JOGADOR, não global) ----
    var _personalidades = [null, null];  // [_personalidade do jogador 0, jogador 1]
    var _historicoEstados = [[], []];     // histórico por jogador

    function _sortearPersonalidade() {
        var lista = ['agressivo', 'defensivo', 'equilibrado', 'adaptativo', 'calculista'];
        return lista[Math.floor(Math.random() * lista.length)];
    }

    // Retorna a personalidade do jogador iaIdx (sorteia se ainda não tem)
    CerebroIA.getPersonalidade = function (iaIdx) {
        iaIdx = iaIdx || 0;
        if (!_personalidades[iaIdx]) _personalidades[iaIdx] = _sortearPersonalidade();
        return _personalidades[iaIdx];
    };

    // Sorteia nova personalidade para AMBOS os jogadores
    CerebroIA.resetarPersonalidade = function () {
        _personalidades[0] = _sortearPersonalidade();
        _personalidades[1] = _sortearPersonalidade();
        _historicoEstados = [[], []];
        // NÃO apaga memória de padrões (persiste entre partidas — é o objetivo)
        try { if (typeof _resetHeuristicas === 'function') _resetHeuristicas(); } catch(e) {}
        try { if (typeof CerebroIA._resetAbertura === 'function') CerebroIA._resetAbertura(); } catch(e) {}
        return _personalidades;
    };

    // ---- Hash do estado (pra anti-loop) ----
    function _hashEstado(pos, pH, pV) {
        return pos[0][0] + ',' + pos[0][1] + '|' +
               pos[1][0] + ',' + pos[1][1] + '|' +
               pH.length + '|' + pV.length;
    }

    function _detectarLoop(pos, pH, pV, iaIdx) {
        iaIdx = iaIdx || 0;
        var h = _hashEstado(pos, pH, pV);
        var hist = _historicoEstados[iaIdx];
        hist.push(h);
        if (hist.length > 6) hist.shift();

        // Conta repetições
        var cont = 0;
        for (var i = 0; i < hist.length; i++) {
            if (hist[i] === h) cont++;
        }
        return cont >= 3;  // mesmo estado apareceu 3+ vezes
    }

    // ---- Detecção de fase (com personalidade) ----
    CerebroIA._detectarFase = function (pos, pH, pV, walls, iaIdx) {
        var oppIdx = 1 - iaIdx;

        // 1. Vitória imediata SEMPRE
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) return 'vitoria';

        // 2. Endgame SEMPRE
        if (walls[0] <= 2 && walls[iaIdx] <= 2) return 'endgame';

        // 3. Emergência SEMPRE
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos)) return 'emergencia';

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // F.8 — Nova fase: se estou claramente na frente (3+ casas), corre
        if (meuD + 3 < oppD) return 'vantagem';

        var personalidade = CerebroIA.getPersonalidade(iaIdx);

        // ---- Limiares por personalidade ----
        // Agressivo: bloqueia cedo (oponente a 4 já é "perigo")
        // Defensivo: só bloqueia se oponente MUITO perto (a 2)
        // Equilibrado: padrão (a 3)
        // Adaptativo: entre agressivo e defensivo, depende das paredes
        // Calculista: sempre escolhe técnica mais forte disponível
        // F.8b — Bloqueio SUPER TARDIO
        var limiarPerigo = 2;   // só a 2 da vitória
        var limiarMeio = 3;     // só a 3 (era 4)

        if (personalidade === 'agressivo') { limiarPerigo = 2; limiarMeio = 4; }
        else if (personalidade === 'defensivo') { limiarPerigo = 1; limiarMeio = 2; }
        else if (personalidade === 'adaptativo') {
            limiarPerigo = 2;
            limiarMeio = 3;
        } else if (personalidade === 'calculista') {
            limiarPerigo = 2;
            limiarMeio = 3;
        }

        if (oppD <= limiarPerigo) return 'perigo';
        if (oppD <= limiarMeio) return 'meio';
        return 'tranquilo';
    };

    // ---- Mapeamento fase → técnica ----
    // ---- Mapeamento fase → técnica ----
    // Todas as 18 técnicas são usadas em pelo menos 1 lugar
    CerebroIA.qualTecnica = function (fase, iaIdx) {
        var personalidade = CerebroIA.getPersonalidade(iaIdx);

        // CALCULISTA — usa as mais completas
        if (personalidade === 'calculista') {
            switch (fase) {
                case 'vitoria':    return 'gps';
                case 'endgame':    return 'etapa1FimDeJogo';
                case 'vantagem':   return 'gps';
                case 'emergencia': return 'cercoEstrategico';
                case 'perigo':     return 'consolidadaFinal';
                case 'meio':       return 'strategicV1';
                case 'tranquilo':  return 'gps';
                default:           return 'cercoEstrategico';
            }
        }

        // AGRESSIVO — bloqueia cedo e forte
        if (personalidade === 'agressivo') {
            switch (fase) {
                case 'vitoria':    return 'gps';
                case 'endgame':    return 'etapa1FimDeJogo';
                case 'vantagem':   return 'gps';
                case 'emergencia': return 'invencivel';
                case 'perigo':     return 'cercoEstrategico';
                case 'meio':       return 'etapa2BloqueioDuplo';
                case 'tranquilo':  return 'gps';
                default:           return 'cercoEstrategico';
            }
        }

        // DEFENSIVO — economiza, só bloqueia no último
        if (personalidade === 'defensivo') {
            switch (fase) {
                case 'vitoria':    return 'gps';
                case 'endgame':    return 'etapa1FimDeJogo';
                case 'vantagem':   return 'gps';
                case 'emergencia': return 'antiBrecha';
                case 'perigo':     return 'economicaV2';
                case 'meio':       return 'justa';
                case 'tranquilo':  return 'gps';
                default:           return 'gps';
            }
        }

        // ADAPTATIVO — aprende padrões do oponente
        if (personalidade === 'adaptativo') {
            switch (fase) {
                case 'vitoria':    return 'gps';
                case 'endgame':    return 'etapa1FimDeJogo';
                case 'vantagem':   return 'gps';
                case 'emergencia': return 'cercoEstrategico';
                case 'perigo':     return 'memoriaParedes';
                case 'meio':       return 'etapa3Gargalo';
                case 'tranquilo':  return 'visaoReal';
                default:           return 'cercoEstrategico';
            }
        }

        // EQUILIBRADO (padrão) — usa as mais equilibradas
        switch (fase) {
            case 'vitoria':    return 'gps';
            case 'vantagem':   return 'gps';
            case 'endgame':    return 'etapa1FimDeJogo';
            case 'emergencia': return 'cercoEstrategico';
            case 'perigo':     return 'cercoEstrategico';
            case 'meio':       return 'forte';
            case 'tranquilo':  return 'gps';
            default:           return 'cercoEstrategico';
        }
    };

    // ---- Anti-loop: quando detecta repetição, muda de técnica ----
    function _tecnicaAntiLoop(fase, tecnicaAtual) {
        var alternativas = {
            'gps': 'visaoReal',
            'visaoReal': 'gps',
            'melhoriasExtra': 'melhoriasExtraV2',
            'melhoriasExtraV2': 'melhoriasExtra',
            'economicaV1': 'economicaV2',
            'economicaV2': 'economicaV1',
            'etapa2BloqueioDuplo': 'etapa3Gargalo',
            'etapa3Gargalo': 'strategicV1',
            'strategicV1': 'etapa3Gargalo',
            'consolidadaFinal': 'forte',
            'forte': 'consolidadaFinal'
        };
        return alternativas[tecnicaAtual] || tecnicaAtual;
    }

    // ---- Função principal ----
    CerebroIA.jogar = function (pos, pH, pV, walls, iaIdx) {
        // F.7 — Tenta usar livro de aberturas primeiro (primeiros 3 turnos)
        if (typeof CerebroIA._usarAbertura === 'function') {
            var acaoAbertura = CerebroIA._usarAbertura(pos, pH, pV, walls, iaIdx);
            if (acaoAbertura) return acaoAbertura;
        }

        // TÉCNICA cemAberturas — primeiros turnos: detecta padrão do oponente
        if (walls[0] >= 9 && walls[iaIdx] >= 9 && typeof CerebroIA.cemAberturas === 'function') {
            var acaoCem = CerebroIA.cemAberturas(pos, pH, pV, walls, iaIdx);
            if (acaoCem) return acaoCem;
        }

        // TÉCNICA etapa4PunirPrevisivel — primeiros turnos: pune jogador previsível
        if (walls[0] >= 8 && walls[iaIdx] >= 8 && typeof CerebroIA.etapa4PunirPrevisivel === 'function') {
            var acaoE4 = CerebroIA.etapa4PunirPrevisivel(pos, pH, pV, walls, iaIdx);
            if (acaoE4) return acaoE4;
        }

        var fase = CerebroIA._detectarFase(pos, pH, pV, walls, iaIdx);
        var tecnica = CerebroIA.qualTecnica(fase, iaIdx);

        // Anti-loop: se detectou repetição, troca de técnica
        var loopDetectado = _detectarLoop(pos, pH, pV, iaIdx);
        if (loopDetectado) {
            tecnica = _tecnicaAntiLoop(fase, tecnica);
        }

        var acao = null;
        if (tecnica === 'minimax' && typeof CerebroIA.minimaxComVariacao === 'function') {
            // Fase tranquila/meio → variação. Perigo/emergência → determinístico.
            acao = CerebroIA.minimaxComVariacao(pos, pH, pV, walls, iaIdx, fase);
        } else if (typeof CerebroIA[tecnica] === 'function') {
            acao = CerebroIA[tecnica](pos, pH, pV, walls, iaIdx);
        }
        if (!acao) acao = CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        return acao;
    };

    // ---- Versão com debug ----
    CerebroIA.jogarDebug = function (pos, pH, pV, walls, iaIdx) {
        var fase = CerebroIA._detectarFase(pos, pH, pV, walls, iaIdx);
        var tecnica = CerebroIA.qualTecnica(fase, iaIdx);

        var loopDetectado = _detectarLoop(pos, pH, pV, iaIdx);
        if (loopDetectado) {
            tecnica = _tecnicaAntiLoop(fase, tecnica);
        }

        var acao = null;
        if (tecnica === 'minimax' && typeof CerebroIA.minimaxComVariacao === 'function') {
            acao = CerebroIA.minimaxComVariacao(pos, pH, pV, walls, iaIdx, fase);
        } else if (typeof CerebroIA[tecnica] === 'function') {
            acao = CerebroIA[tecnica](pos, pH, pV, walls, iaIdx);
        }
        if (!acao) acao = CerebroIA.gps(pos, pH, pV, walls, iaIdx);

        return {
            acao: acao,
            fase: fase,
            tecnica: tecnica,
            personalidade: CerebroIA.getPersonalidade(iaIdx),
            loop: loopDetectado
        };
    };

    // =====================================================================
    // F.1 — HELPERS MELHORADOS (usados pelas técnicas)
    // =====================================================================

    // ---- Varre TODAS as paredes válidas do tabuleiro ----
    // Retorna [{r,c,ori,ganho,custo,cobertura}, ...] ordenado por qualidade.
    CerebroIA._todasParedesValidas = function (pos, pH, pV, walls, iaIdx) {
        var oppIdx = 1 - iaIdx;
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // Mapa de calor: quais células estão no caminho do oponente
        var rotaOpp = CerebroIA.bfsPath(oppIdx, pH, pV, pos);
        var celulas = {};
        for (var k = 0; k < rotaOpp.path.length; k++) {
            celulas[rotaOpp.path[k][0] + ',' + rotaOpp.path[k][1]] = true;
        }

        var paredes = [];
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                // H (horizontal)
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    var cobH = 0;
                    if (celulas[r + ',' + c]) cobH++;
                    if (celulas[(r + 1) + ',' + c]) cobH++;
                    var tH = pH.concat([[r, c]]);
                    var ganhoH = CerebroIA.bfsDist(oppIdx, tH, pV, pos) - oppD;
                    var custoH = CerebroIA.bfsDist(iaIdx, tH, pV, pos) - meuD;
                    paredes.push({
                        r: r, c: c, ori: 'H',
                        ganho: ganhoH, custo: custoH, cobertura: cobH
                    });
                }
                // V (vertical)
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    var cobV = 0;
                    if (celulas[r + ',' + c]) cobV++;
                    if (celulas[r + ',' + (c + 1)]) cobV++;
                    var tV = pV.concat([[r, c]]);
                    var ganhoV = CerebroIA.bfsDist(oppIdx, pH, tV, pos) - oppD;
                    var custoV = CerebroIA.bfsDist(iaIdx, pH, tV, pos) - meuD;
                    paredes.push({
                        r: r, c: c, ori: 'V',
                        ganho: ganhoV, custo: custoV, cobertura: cobV
                    });
                }
            }
        }

        // Ordena: cobertura alta + ganho alto + custo baixo
        paredes.sort(function (a, b) {
            var sa = a.cobertura * 15 + a.ganho * 10 - a.custo * 8;
            var sb = b.cobertura * 15 + b.ganho * 10 - b.custo * 8;
            return sb - sa;
        });
        return paredes;
    };

    // ---- Conta quantas rotas alternativas o oponente tem ----
    // Usa BFS limitado (evita explodir em tabuleiro aberto)
    CerebroIA._contarRotas = function (player, pH, pV, pos, limite) {
        limite = limite || 30;
        var WIN = getWIN();
        var goal = WIN[player];
        var start = pos[player][0] + ',' + pos[player][1];
        var dist = {}; dist[start] = 0;
        var rotas = {}; rotas[start] = 1;
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
            var nb = CerebroIA.legalMoves(player, pH, pV, tpos);
            for (var i = 0; i < nb.length; i++) {
                var k = nb[i][0] + ',' + nb[i][1];
                var nd = d + 1;
                if (dist[k] === undefined || dist[k] > nd) {
                    dist[k] = nd;
                    rotas[k] = rotas[curKey];
                    q.push([nb[i][0], nb[i][1]]);
                } else if (dist[k] === nd) {
                    rotas[k] = Math.min(limite, (rotas[k] || 0) + rotas[curKey]);
                }
            }
        }

        var total = 0;
        for (var c = 0; c < 9; c++) {
            var kk = goal + ',' + c;
            if (dist[kk] === distFinal && distFinal < 999) {
                total += rotas[kk] || 0;
            }
        }
        return { dist: distFinal, rotas: Math.min(limite, total) };
    };

    // =====================================================================
    // F.1 — SOBRESCREVE melhoriasExtra com versão melhorada
    // =====================================================================
    CerebroIA.melhoriasExtraV2 = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // Vitória imediata
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // Bloqueio obrigatório se oponente está a 1
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            var pObrig = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
            for (var i = 0; i < pObrig.length; i++) {
                var w = pObrig[i];
                var tH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
                var tV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
                if (!CerebroIA.canWinNext(oppIdx, tH, tV, pos)) {
                    return { type: 'wall', r: w.r, c: w.c, ori: w.ori };
                }
            }
        }

        // MELHORIA: bloqueio preventivo MAIS CEDO (oponente a ≤5)
        if (oppD <= 5 && walls[iaIdx] > 0) {
            var paredes = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
            var rotasInfo = CerebroIA._contarRotas(oppIdx, pH, pV, pos, 5);

            var melhor = null, melhorScore = 0;
            for (var i = 0; i < Math.min(paredes.length, 20); i++) {
                var w = paredes[i];
                // Score = ganho de distância + bônus por cobertura + bônus por reduzir rotas
                var score = w.ganho * 12 + w.cobertura * 20 - w.custo * 10;
                // Bônus especial: se oponente tem muitas rotas, fecha-las vale ouro
                if (rotasInfo.rotas >= 3 && w.cobertura >= 2) score += 30;
                // Se oponente está a 2, sempre bloquear se possível
                if (oppD <= 2 && w.ganho >= 2) score += 50;

                if (score > melhorScore) {
                    melhorScore = score;
                    melhor = w;
                }
            }

            if (melhor && melhorScore >= 15) {
                return { type: 'wall', r: melhor.r, c: melhor.c, ori: melhor.ori };
            }
        }

        // Fim de jogo: ambos com poucas paredes → corre
        if (walls[0] <= 2 && walls[iaIdx] <= 2) {
            return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Fallback: corre
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // F.2 — MINIMAX REAL com alpha-beta
    // IA pensa 4-6 jogadas à frente avaliando cada posição.
    // =====================================================================

    // Cache de avaliações (evita recalcular)
    var _cacheMinimax = {};
    var _nosVisitados = 0;

    // Aplica ação e devolve estado novo
    function _aplicarAcao(pos, pH, pV, walls, acao, iaIdx) {
        var nPos = [pos[0].slice(), pos[1].slice()];
        var npH = pH.slice();
        var npV = pV.slice();
        var nw = walls.slice();
        if (acao.type === 'move') {
            nPos[iaIdx] = [acao.r, acao.c];
        } else if (acao.type === 'wall') {
            if (acao.ori === 'H') npH = pH.concat([[acao.r, acao.c]]);
            else npV = pV.concat([[acao.r, acao.c]]);
            nw[iaIdx]--;
        }
        return { pos: nPos, pH: npH, pV: npV, walls: nw };
    }

    // Função de avaliação (quanto maior, melhor para iaIdx)
    function _avaliarPos(pos, pH, pV, walls, iaIdx) {
        var oppIdx = 1 - iaIdx;
        var WIN = getWIN();

        if (pos[iaIdx][0] === WIN[iaIdx]) return 1000000;
        if (pos[oppIdx][0] === WIN[oppIdx]) return -1000000;

        var dMeu = CerebroIA.bfsDist(iaIdx, pH, pV, pos);
        var dOpp = CerebroIA.bfsDist(oppIdx, pH, pV, pos);

        // F.8b — AVALIAÇÃO SUPER AGRESSIVA
        // Avançar eu mesma vale 250/casa. Atrasar oponente vale 30/casa.
        // Ou seja: 8x mais importante avançar do que atrasar.
        var score = (dOpp * 30) - (dMeu * 250);

        // Peso forte pra economizar paredes (ter parede = bom, gastar = ruim)
        score += (walls[iaIdx] - walls[oppIdx]) * 60;

        // Progresso (ataque puro)
        var progMeu = iaIdx === 0 ? (8 - pos[iaIdx][0]) : pos[iaIdx][0];
        var progOpp = oppIdx === 0 ? (8 - pos[oppIdx][0]) : pos[oppIdx][0];
        score += (progMeu - progOpp) * 60;

        // MELHORIA 5: CONTROLE CENTRAL
        // Colunas centrais (3, 4, 5) valem +20. Laterais (0,1 / 7,8) valem -10.
        var colMeu = pos[iaIdx][1];
        var colOpp = pos[oppIdx][1];
        var bonusCentral = [0, -10, 5, 20, 30, 20, 5, -10, 0];
        score += (bonusCentral[colMeu] || 0) - (bonusCentral[colOpp] || 0) * 0.5;

        // Ameaças (só quando oponente está a 2 ou menos)
        if (dOpp <= 2) score -= (3 - dOpp) * 600;
        if (dMeu <= 2) score += (3 - dMeu) * 1200;

        return score;
    }

    // Gera ações ordenadas por qualidade (movimentos + paredes boas)
    function _gerarAcoesOrdenadas(pos, pH, pV, walls, iaIdx, limiteParedes) {
        var WIN = getWIN();
        var acoes = [];

        // Movimentos
        var moves = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
        for (var i = 0; i < moves.length; i++) {
            // Movimento que avança vale mais
            var avanco = iaIdx === 0 ? (pos[iaIdx][0] - moves[i][0]) : (moves[i][0] - pos[iaIdx][0]);
            acoes.push({
                type: 'move', r: moves[i][0], c: moves[i][1],
                _sort: -avanco  // movimentos avançados primeiro
            });
        }

        // Paredes (só se tem paredes e oponente relativamente perto)
        if (walls[iaIdx] > 0) {
            var oppIdx = 1 - iaIdx;
            var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
            if (oppD <= 7) {
                var paredes = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
                var lim = limiteParedes || 8;
                for (var i = 0; i < Math.min(paredes.length, lim); i++) {
                    var w = paredes[i];
                    acoes.push({
                        type: 'wall', r: w.r, c: w.c, ori: w.ori,
                        _sort: -(w.ganho * 10 + w.cobertura * 15)
                    });
                }
            }
        }

        acoes.sort(function (a, b) { return a._sort - b._sort; });
        return acoes;
    }

    // =====================================================================
    // F.5 — MINIMAX OTIMIZADO (PVS + LMR + Killer + History + Aspiration)
    // Permite buscar profundidade 8-10 no mesmo tempo que antes buscava 4.
    // =====================================================================

    // Killer moves: [ply][slot] = ação que causou beta cutoff
    var _deadline = 0;
    var _killerMoves = [];
    // History heuristic: hash da ação -> pontuação acumulada
    var _historyHeuristic = {};

    function _chaveAcao(acao) {
        if (acao.type === 'move') return 'm' + acao.r + ',' + acao.c;
        return 'w' + acao.r + ',' + acao.c + ',' + acao.ori;
    }

    function _resetHeuristicas() {
        _killerMoves = [];
        _historyHeuristic = {};
        _cacheMinimax = {};
        _nosVisitados = 0;
    }

    function _registrarKiller(ply, acao) {
        if (!_killerMoves[ply]) _killerMoves[ply] = [null, null];
        var kAtual = _chaveAcao(acao);
        if (_killerMoves[ply][0] && _chaveAcao(_killerMoves[ply][0]) === kAtual) return;
        _killerMoves[ply][1] = _killerMoves[ply][0];
        _killerMoves[ply][0] = { type: acao.type, r: acao.r, c: acao.c, ori: acao.ori };
    }

    function _registrarHistory(acao, depth) {
        var k = _chaveAcao(acao);
        _historyHeuristic[k] = (_historyHeuristic[k] || 0) + depth * depth;
    }

    function _ordenarAcoes(acoes, ply, pvMove) {
        for (var i = 0; i < acoes.length; i++) {
            var a = acoes[i];
            var bonus = (a._sort || 0);
            // MELHORIA 13: paredes que bloqueiam passagem vertical
            // (paralelas à direção do oponente) valem mais
            if (a.type === 'wall') {
                // Se o oponente desce (iaIdx=1 → oponente sobe de baixo),
                // paredes H bloqueiam avanço vertical — valem mais
                if (a.ori === 'H') bonus += 30;
                // Paredes no centro valem mais
                if (a.c >= 3 && a.c <= 5) bonus += 20;
            }
            // PV move: prioridade máxima
            if (pvMove && pvMove.type === a.type && pvMove.r === a.r && pvMove.c === a.c &&
                (pvMove.ori === undefined || pvMove.ori === a.ori)) {
                bonus += 10000000;
            }
            // Killer moves
            if (_killerMoves[ply]) {
                if (_killerMoves[ply][0] && _chaveAcao(_killerMoves[ply][0]) === _chaveAcao(a)) bonus += 100000;
                if (_killerMoves[ply][1] && _chaveAcao(_killerMoves[ply][1]) === _chaveAcao(a)) bonus += 50000;
            }
            // History
            bonus += _historyHeuristic[_chaveAcao(a)] || 0;
            a._ordem = bonus;
        }
        acoes.sort(function (x, y) { return y._ordem - x._ordem; });
        return acoes;
    }

    // Minimax com PVS + alpha-beta + LMR
    function _minimax(pos, pH, pV, walls, depth, alpha, beta, maximizando, iaIdx, ply) {
        ply = ply || 0;
        _nosVisitados++;

        // Guardiões de tempo/nós
        if (_nosVisitados > 8000 || (_deadline > 0 && Date.now() > _deadline)) {
            return _avaliarPos(pos, pH, pV, walls, iaIdx);
        }

        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        if (pos[iaIdx][0] === WIN[iaIdx]) return 1000000 + depth * 100;
        if (pos[oppIdx][0] === WIN[oppIdx]) return -1000000 - depth * 100;
        if (depth === 0) return _avaliarPos(pos, pH, pV, walls, iaIdx);

        var jogadorAtual = maximizando ? iaIdx : oppIdx;

        // Transposition table
        var hash = jogadorAtual + '|' + depth + '|' +
                   pos[0][0] + ',' + pos[0][1] + '|' +
                   pos[1][0] + ',' + pos[1][1] + '|' +
                   pH.length + '|' + pV.length;
        if (_cacheMinimax[hash] !== undefined) {
            var stored = _cacheMinimax[hash];
            if (stored.depth >= depth) return stored.value;
        }

        var acoes = _gerarAcoesOrdenadas(pos, pH, pV, walls, jogadorAtual, 3);
        if (acoes.length === 0) return _avaliarPos(pos, pH, pV, walls, iaIdx);
        _ordenarAcoes(acoes, ply, null);

        var melhor = maximizando ? -Infinity : Infinity;

        for (var i = 0; i < acoes.length; i++) {
            var est = _aplicarAcao(pos, pH, pV, walls, acoes[i], jogadorAtual);
            var val;

            // Late Move Reduction: jogadas menos promissoras → busca rasa
            var reducao = 0;
            if (i >= 3 && depth >= 3 && acoes[i].type === 'move') reducao = 1;

            if (i === 0) {
                // PV move: busca completa
                val = _minimax(est.pos, est.pH, est.pV, est.walls, depth - 1, alpha, beta, !maximizando, iaIdx, ply + 1);
            } else {
                // Null window search (PVS)
                val = _minimax(est.pos, est.pH, est.pV, est.walls, depth - 1 - reducao, alpha, alpha + 1, !maximizando, iaIdx, ply + 1);

                // Se falhou na janela estreita, refaz com janela completa
                if (val > alpha && val < beta) {
                    val = _minimax(est.pos, est.pH, est.pV, est.walls, depth - 1, alpha, beta, !maximizando, iaIdx, ply + 1);
                }
            }

            if (maximizando) {
                if (val > melhor) melhor = val;
                if (melhor > alpha) alpha = melhor;
            } else {
                if (val < melhor) melhor = val;
                if (melhor < beta) beta = melhor;
            }

            if (beta <= alpha) {
                // Beta cutoff
                if (acoes[i].type === 'move') _registrarKiller(ply, acoes[i]);
                _registrarHistory(acoes[i], depth);
                break;
            }
        }

        _cacheMinimax[hash] = { value: melhor, depth: depth };
        return melhor;
    }

    // =====================================================================
    // TÉCNICA F.2 — minimax com aspiration windows e profundidade 8-10
    // =====================================================================
    CerebroIA.minimax = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // Vitória imediata
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Bloqueio obrigatório
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            var pObrig = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
            for (var i = 0; i < pObrig.length; i++) {
                var w = pObrig[i];
                var tH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
                var tV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
                if (!CerebroIA.canWinNext(oppIdx, tH, tV, pos)) {
                    return { type: 'wall', r: w.r, c: w.c, ori: w.ori };
                }
            }
        }

        _resetHeuristicas();
        var t0 = Date.now();
        var maxTempo = 500;
        _deadline = t0 + maxTempo;  // deadline global

        var melhorAcao = null;
        var melhorScore = -Infinity;
        var lastScore = 0;

        // MELHORIA 10: PROFUNDIDADE ADAPTATIVA
        // Em posição crítica (oponente perto), busca mais fundo
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);
        var maxDepth = 8;
        if (oppD <= 2 || meuD <= 2) maxDepth = 10;  // crítico — mais fundo
        else if (oppD >= 6 && meuD >= 6) maxDepth = 6;  // tranquilo — mais rápido

        // Iterative deepening: profundidade crescente
        for (var depth = 2; depth <= maxDepth; depth += 2) {
            if (Date.now() - t0 > maxTempo) break;

            // Aspiration window
            var alpha = -Infinity, beta = Infinity;
            if (depth >= 4 && lastScore !== 0 && Math.abs(lastScore) < 900000) {
                alpha = lastScore - 150;
                beta = lastScore + 150;
            }

            var acoes = _gerarAcoesOrdenadas(pos, pH, pV, walls, iaIdx, 8);
            if (acoes.length === 0) break;

            // Coloca a melhor ação da iteração anterior primeiro
            _ordenarAcoes(acoes, 0, melhorAcao);

            var bestD = null, scoreD = -Infinity;

            for (var i = 0; i < acoes.length; i++) {
                if (Date.now() - t0 > maxTempo) break;

                var est = _aplicarAcao(pos, pH, pV, walls, acoes[i], iaIdx);
                var score = _minimax(est.pos, est.pH, est.pV, est.walls, depth - 1, alpha, beta, false, iaIdx, 1);

                // Aspiration fail: re-search com janela completa
                if (score <= alpha || score >= beta) {
                    score = _minimax(est.pos, est.pH, est.pV, est.walls, depth - 1, -Infinity, Infinity, false, iaIdx, 1);
                }

                if (score > scoreD) {
                    scoreD = score;
                    bestD = acoes[i];
                }
            }

            if (bestD) {
                melhorAcao = bestD;
                melhorScore = scoreD;
                lastScore = scoreD;
                if (melhorScore > 900000) break;
            }
        }

        if (melhorAcao) return melhorAcao;
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // MEMÓRIA DE PADRÕES — registra jogadas e detecta repetição
    // =====================================================================

    // Registra a última jogada do jogador no localStorage
    // Formato: { paredes: [{r,c,ori}, ...], movimentos: [{r,c}, ...] }
    CerebroIA._registrarJogada = function (iaIdx, jogada) {
        if (!jogada) return;
        var chave = 'quoridor_padrao_' + _getUserKey() + '_' + iaIdx;

        var mem = _lerMemoria(chave, { paredes: [], movimentos: [], total: 0 });
        if (!mem.paredes) mem.paredes = [];
        if (!mem.movimentos) mem.movimentos = [];

        if (jogada.tipo === 'wall') {
            mem.paredes.push({ r: jogada.r, c: jogada.c, ori: jogada.ori, t: Date.now() });
            if (mem.paredes.length > 20) mem.paredes.shift();
        } else if (jogada.tipo === 'move') {
            mem.movimentos.push({ r: jogada.r, c: jogada.c, t: Date.now() });
            if (mem.movimentos.length > 20) mem.movimentos.shift();
        }
        mem.total = (mem.total || 0) + 1;
        _salvarMemoria(chave, mem);
    };

    // Analisa padrões — retorna posições onde o jogador colocou parede 3+ vezes
    // Retorna: { paredesFrequentes: [{r,c,ori,contagem}], temPadrao: bool }
    CerebroIA._analisarPadraoParedes = function (iaIdx) {
        var chave = 'quoridor_padrao_' + _getUserKey() + '_' + iaIdx;
        var mem = _lerMemoria(chave, { paredes: [], movimentos: [], total: 0 });
        if (!mem.paredes || mem.paredes.length < 6) {
            return { paredesFrequentes: [], temPadrao: false };
        }

        // Conta frequência de cada posição de parede
        var contagem = {};
        for (var i = 0; i < mem.paredes.length; i++) {
            var p = mem.paredes[i];
            var k = p.r + ',' + p.c + ',' + p.ori;
            contagem[k] = (contagem[k] || 0) + 1;
        }

        // Filtra as que aparecem 3+ vezes
        var frequentes = [];
        for (var k in contagem) {
            if (contagem[k] >= 3) {
                var partes = k.split(',');
                frequentes.push({
                    r: parseInt(partes[0], 10),
                    c: parseInt(partes[1], 10),
                    ori: partes[2],
                    contagem: contagem[k]
                });
            }
        }
        // Ordena por frequência (mais repetida primeiro)
        frequentes.sort(function (a, b) { return b.contagem - a.contagem; });

        return { paredesFrequentes: frequentes, temPadrao: frequentes.length > 0 };
    };

    // =====================================================================
    // TÉCNICA 18 — memoriaParedes
    // Se detectar que o oponente repete paredes, bloqueia preventivamente
    // as rotas que ele costuma criar. Também antecipa paredes "clássicas".
    // =====================================================================
    CerebroIA.memoriaParedes = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // Vitória imediata sempre primeiro
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Bloqueio obrigatório se oponente está a 1
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            var pObrig = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
            for (var i = 0; i < pObrig.length; i++) {
                var w = pObrig[i];
                var tH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
                var tV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
                if (!CerebroIA.canWinNext(oppIdx, tH, tV, pos)) {
                    return { type: 'wall', r: w.r, c: w.c, ori: w.ori };
                }
            }
        }

        // Análise de padrões do oponente
        var padrao = CerebroIA._analisarPadraoParedes(oppIdx);

        if (padrao.temPadrao && walls[iaIdx] > 2) {
            // O oponente tem paredes favoritas. Vamos ver se faz sentido
            // bloquear as rotas que ele costuma criar.

            // Pega a parede mais repetida do oponente
            var fav = padrao.paredesFrequentes[0];

            // Estratégia: se ele gosta de bloquear em (r,c), ele provavelmente
            // vai tentar fazer isso de novo. A melhor defesa é "fechar antes",
            // colocando paredes que tornem aquela posição inútil.

            // Verificação: se a posição favorita dele ainda está livre,
            // tenta colocar uma parede que "rouba" aquela posição
            // OU que reduza o valor estratégico dela.
            if (fav) {
                // Tenta colocar uma parede ADJACENTE à favorita dele,
                // atrapalhando sua estratégia
                var candidatos = [
                    {r: Math.max(0, fav.r - 1), c: fav.c, ori: fav.ori},
                    {r: Math.min(6, fav.r + 1), c: fav.c, ori: fav.ori},
                    {r: fav.r, c: Math.max(0, fav.c - 1), ori: fav.ori},
                    {r: fav.r, c: Math.min(6, fav.c + 1), ori: fav.ori}
                ];
                for (var i = 0; i < candidatos.length; i++) {
                    var cand = candidatos[i];
                    if (CerebroIA.canPlace(cand.r, cand.c, cand.ori, pH, pV, pos)) {
                        // Verifica se essa parede beneficia a IA (não me atrapalha)
                        var tH2 = cand.ori === 'H' ? pH.concat([[cand.r, cand.c]]) : pH.slice();
                        var tV2 = cand.ori === 'V' ? pV.concat([[cand.r, cand.c]]) : pV.slice();
                        var meuAntes = CerebroIA.bfsDist(iaIdx, pH, pV, pos);
                        var meuDepois = CerebroIA.bfsDist(iaIdx, tH2, tV2, pos);
                        if (meuDepois <= meuAntes + 1) {
                            // Não me atrapalha muito, então vale
                            return { type: 'wall', r: cand.r, c: cand.c, ori: cand.ori };
                        }
                    }
                }
            }
        }

        // Sem padrão detectado ou sem jogada vantajosa:
        // usa a técnica mais forte disponível (minimax)
        if (typeof CerebroIA.minimax === 'function') {
            return CerebroIA.minimax(pos, pH, pV, walls, iaIdx);
        }
        return CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    };

    // =====================================================================
    // F.6 — ALEATORIEDADE CONTROLADA
    // Sorteia entre top 3 jogadas quando scores são próximos.
    // Fases críticas continuam determinísticas (não arrisca perder).
    // =====================================================================

    // Descobre top 3 ações avaliando cada uma pelo minimax
    function _melhores3(pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        _resetHeuristicas();
        var t0 = Date.now();
        var maxTempo = 400;
        _deadline = t0 + maxTempo;

        // Gera ações candidatas
        var acoes = _gerarAcoesOrdenadas(pos, pH, pV, walls, iaIdx, 10);
        if (acoes.length === 0) return [];

        // Avalia cada ação com profundidade fixa 4
        var resultados = [];
        for (var i = 0; i < acoes.length; i++) {
            if (Date.now() - t0 > maxTempo) break;
            var est = _aplicarAcao(pos, pH, pV, walls, acoes[i], iaIdx);
            var score = _minimax(est.pos, est.pH, est.pV, est.walls, 3, -Infinity, Infinity, false, iaIdx, 1);
            resultados.push({ acao: acoes[i], score: score });
        }

        // Ordena por score
        resultados.sort(function (a, b) { return b.score - a.score; });
        return resultados;
    }

    // =====================================================================
    // MINIMAX COM ALEATORIEDADE — substitui a técnica minimax
    // =====================================================================
    CerebroIA.minimaxComVariacao = function (pos, pH, pV, walls, iaIdx, fase) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // F.8b — ECONOMIA AGRESSIVA
        // Só considera paredes se oponente está MUITO perto (≤2)
        // Em qualquer outro caso, só movimento (nunca gasta parede)
        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        if (oppD > 2) {
            // Oponente longe → só avanço, sem paredes
            var moves = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            if (moves.length > 0) {
                var melhorMv = null, melhorDist = 999;
                for (var i = 0; i < moves.length; i++) {
                    var np = [pos[0].slice(), pos[1].slice()];
                    np[iaIdx] = [moves[i][0], moves[i][1]];
                    var d = CerebroIA.bfsDist(iaIdx, pH, pV, np);
                    if (d < melhorDist) {
                        melhorDist = d;
                        melhorMv = { type: 'move', r: moves[i][0], c: moves[i][1] };
                    }
                }
                if (melhorMv) return melhorMv;
            }
        }

        // Vitória imediata sempre
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Bloqueio obrigatório sempre
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            var pObrig = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
            for (var i = 0; i < pObrig.length; i++) {
                var w = pObrig[i];
                var tH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
                var tV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
                if (!CerebroIA.canWinNext(oppIdx, tH, tV, pos)) {
                    return { type: 'wall', r: w.r, c: w.c, ori: w.ori };
                }
            }
        }

        // Fases críticas: SEMPRE determinístico (não arrisca perder)
        if (fase === 'emergencia') {
            return CerebroIA.minimax(pos, pH, pV, walls, iaIdx);
        }

        // Fases tranquilas: aplica aleatoriedade entre top 3
        var top3 = _melhores3(pos, pH, pV, walls, iaIdx);
        if (top3.length < 2) {
            return top3[0] ? top3[0].acao : CerebroIA.gps(pos, pH, pV, walls, iaIdx);
        }

        // Verifica se top 3 são próximos (dentro de 15% do melhor)
        var melhor = top3[0].score;
        var variacao = Math.abs(melhor) * 0.15 + 50;  // tolerância mínima de 50

        var candidatos = [];
        for (var i = 0; i < top3.length && i < 3; i++) {
            if (Math.abs(top3[i].score - melhor) <= variacao) {
                candidatos.push(top3[i].acao);
            }
        }

        // Se só tem 1 candidato (scores muito diferentes), usa o melhor
        if (candidatos.length <= 1) {
            return top3[0].acao;
        }

        // Sorteia entre os candidatos
        var idx = Math.floor(Math.random() * candidatos.length);
        return candidatos[idx];
    };

    // =====================================================================
    // F.7 — LIVRO DE ABERTURAS
    // 50 aberturas variadas para os primeiros 3 turnos.
    // Sorteia 1 por partida, aplica em sequência.
    // =====================================================================

    var _aberturaSorteada = null;
    var _indiceAbertura = 0;

    // Catálogo de aberturas (jogador 1, que desce da linha 0 para 8)
    // Cada abertura = sequência de até 3 ações
    var _LIVRO_ABERTURAS = [
        // 15 aberturas com 1 movimento central
        [{ type: 'move', r: 1, c: 4 }],
        [{ type: 'move', r: 2, c: 4 }],
        [{ type: 'move', r: 1, c: 3 }],
        [{ type: 'move', r: 1, c: 5 }],
        [{ type: 'move', r: 2, c: 3 }],
        [{ type: 'move', r: 2, c: 5 }],
        [{ type: 'move', r: 1, c: 2 }],
        [{ type: 'move', r: 1, c: 6 }],
        [{ type: 'move', r: 2, c: 2 }],
        [{ type: 'move', r: 2, c: 6 }],
        [{ type: 'move', r: 3, c: 4 }],
        [{ type: 'move', r: 1, c: 1 }],
        [{ type: 'move', r: 1, c: 7 }],
        [{ type: 'move', r: 2, c: 1 }],
        [{ type: 'move', r: 2, c: 7 }],

        // 10 aberturas com movimento + parede vertical
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 1, c: 3, ori: 'V' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 1, c: 5, ori: 'V' }],
        [{ type: 'move', r: 1, c: 3 }, { type: 'wall', r: 1, c: 2, ori: 'V' }],
        [{ type: 'move', r: 1, c: 5 }, { type: 'wall', r: 1, c: 6, ori: 'V' }],
        [{ type: 'move', r: 2, c: 4 }, { type: 'wall', r: 2, c: 3, ori: 'V' }],
        [{ type: 'move', r: 2, c: 4 }, { type: 'wall', r: 2, c: 5, ori: 'V' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 2, c: 2, ori: 'V' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 2, c: 6, ori: 'V' }],
        [{ type: 'move', r: 3, c: 4 }, { type: 'wall', r: 3, c: 3, ori: 'V' }],
        [{ type: 'move', r: 3, c: 4 }, { type: 'wall', r: 3, c: 5, ori: 'V' }],

        // 10 aberturas com movimento + parede horizontal
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 1, c: 3, ori: 'H' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 1, c: 5, ori: 'H' }],
        [{ type: 'move', r: 1, c: 3 }, { type: 'wall', r: 1, c: 2, ori: 'H' }],
        [{ type: 'move', r: 1, c: 5 }, { type: 'wall', r: 1, c: 6, ori: 'H' }],
        [{ type: 'move', r: 2, c: 4 }, { type: 'wall', r: 2, c: 3, ori: 'H' }],
        [{ type: 'move', r: 2, c: 4 }, { type: 'wall', r: 2, c: 5, ori: 'H' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 2, c: 2, ori: 'H' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'wall', r: 2, c: 6, ori: 'H' }],
        [{ type: 'move', r: 3, c: 4 }, { type: 'wall', r: 3, c: 3, ori: 'H' }],
        [{ type: 'move', r: 3, c: 4 }, { type: 'wall', r: 3, c: 5, ori: 'H' }],

        // 10 aberturas com 2 movimentos (agressivas, sem parede cedo)
        [{ type: 'move', r: 1, c: 4 }, { type: 'move', r: 2, c: 4 }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'move', r: 2, c: 3 }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'move', r: 2, c: 5 }],
        [{ type: 'move', r: 1, c: 3 }, { type: 'move', r: 2, c: 3 }],
        [{ type: 'move', r: 1, c: 5 }, { type: 'move', r: 2, c: 5 }],
        [{ type: 'move', r: 2, c: 4 }, { type: 'move', r: 3, c: 4 }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'move', r: 2, c: 4 }],
        [{ type: 'move', r: 1, c: 3 }, { type: 'move', r: 2, c: 4 }],
        [{ type: 'move', r: 1, c: 5 }, { type: 'move', r: 2, c: 4 }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'move', r: 2, c: 6 }],

        // 5 aberturas agressivas (parede + movimento pra bloquear)
        [{ type: 'wall', r: 3, c: 4, ori: 'V' }, { type: 'wall', r: 4, c: 4, ori: 'V' }],
        [{ type: 'wall', r: 5, c: 4, ori: 'V' }, { type: 'wall', r: 4, c: 4, ori: 'V' }],
        [{ type: 'wall', r: 6, c: 4, ori: 'H' }, { type: 'wall', r: 5, c: 4, ori: 'H' }],
        [{ type: 'move', r: 1, c: 4 }, { type: 'move', r: 2, c: 4 }],
        [{ type: 'move', r: 1, c: 3 }, { type: 'move', r: 2, c: 3 }]
    ];

    // Sorteia uma abertura
    CerebroIA._sortearAbertura = function () {
        var idx = Math.floor(Math.random() * _LIVRO_ABERTURAS.length);
        _aberturaSorteada = _LIVRO_ABERTURAS[idx];
        _indiceAbertura = 0;
        return _aberturaSorteada;
    };

    // Verifica se a abertura atual ainda tem ação a fazer
    // Retorna ação válida se sim, null se não
    CerebroIA._usarAbertura = function (pos, pH, pV, walls, iaIdx) {
        // Se não tem abertura sorteada, sorteia
        if (!_aberturaSorteada) {
            CerebroIA._sortearAbertura();
        }

        // Se já usou todas as ações da abertura, retorna null
        if (_indiceAbertura >= _aberturaSorteada.length) return null;

        var acao = _aberturaSorteada[_indiceAbertura];

        // Valida se a ação é legal
        if (acao.type === 'move') {
            var moves = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            var ok = false;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i][0] === acao.r && moves[i][1] === acao.c) { ok = true; break; }
            }
            if (!ok) {
                // Ação inválida — aborta abertura
                _aberturaSorteada = null;
                _indiceAbertura = 0;
                return null;
            }
        } else if (acao.type === 'wall') {
            if (walls[iaIdx] <= 0) {
                _aberturaSorteada = null;
                _indiceAbertura = 0;
                return null;
            }
            if (!CerebroIA.canPlace(acao.r, acao.c, acao.ori, pH, pV, pos)) {
                // Parede já usada — pula pra próxima ação
                _indiceAbertura++;
                return CerebroIA._usarAbertura(pos, pH, pV, walls, iaIdx);
            }
        }

        _indiceAbertura++;
        return { type: acao.type, r: acao.r, c: acao.c, ori: acao.ori };
    };

    // Reset quando inicia nova partida
    CerebroIA._resetAbertura = function () {
        _aberturaSorteada = null;
        _indiceAbertura = 0;
    };

    // =====================================================================
    // F.9 — CERCO ESTRATÉGICO
    // Em vez de gastar parede "ao vento", cria cerco em L que obriga o
    // oponente a VOLTAR. Só age quando oponente está a ≤3 e só executa
    // se o custo pro oponente for ≥3 turnos.
    // =====================================================================
    CerebroIA.cercoEstrategico = function (pos, pH, pV, walls, iaIdx) {
        var WIN = getWIN();
        var oppIdx = 1 - iaIdx;

        // ===== MELHORIA #20: COUNTDOWN DE VITÓRIA =====
        // Se IA está muito à frente E oponente está longe, só corre
        var oppD0 = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD0 = CerebroIA.bfsDist(iaIdx, pH, pV, pos);
        if (meuD0 + 3 < oppD0 && oppD0 >= 3) {
            return _melhorMovimento(pos, pH, pV, walls, iaIdx);
        }

        // Vitória imediata sempre
        if (CerebroIA.canWinNext(iaIdx, pH, pV, pos)) {
            var mv = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
            for (var i = 0; i < mv.length; i++) {
                if (mv[i][0] === WIN[iaIdx]) return { type: 'move', r: mv[i][0], c: mv[i][1] };
            }
        }

        // Bloqueio obrigatório (oponente a 1) sempre
        if (CerebroIA.canWinNext(oppIdx, pH, pV, pos) && walls[iaIdx] > 0) {
            var pObrig = CerebroIA._todasParedesValidas(pos, pH, pV, walls, iaIdx);
            for (var i = 0; i < pObrig.length; i++) {
                var w = pObrig[i];
                var tH = w.ori === 'H' ? pH.concat([[w.r, w.c]]) : pH.slice();
                var tV = w.ori === 'V' ? pV.concat([[w.r, w.c]]) : pV.slice();
                if (!CerebroIA.canWinNext(oppIdx, tH, tV, pos)) {
                    return { type: 'wall', r: w.r, c: w.c, ori: w.ori };
                }
            }
        }

        var oppD = CerebroIA.bfsDist(oppIdx, pH, pV, pos);
        var meuD = CerebroIA.bfsDist(iaIdx, pH, pV, pos);

        // MELHORIA 19: RESERVA DINÂMICA
        var paredesAtuais = walls[iaIdx];
        var limiarGasto;
        if (paredesAtuais >= 7) limiarGasto = 3;
        else if (paredesAtuais >= 4) limiarGasto = 2;
        else limiarGasto = 1;

        if (oppD > limiarGasto || paredesAtuais <= 0) {
            return _melhorMovimento(pos, pH, pV, walls, iaIdx);
        }

        // 1. Pega a rota atual do oponente
        var rotaOpp = CerebroIA.bfsPath(oppIdx, pH, pV, pos);
        var celulasRota = {};
        for (var k = 0; k < rotaOpp.path.length; k++) {
            celulasRota[rotaOpp.path[k][0] + ',' + rotaOpp.path[k][1]] = true;
        }

        // ===== MELHORIA #15: BLOQUEIO PREDITIVO =====
        // Antes de qualquer decisão, verifica se oponente pode chegar a 1 em 2 turnos
        function _ameacaEm2Turnos(tpH, tpV, tPos) {
            var moves1 = CerebroIA.legalMoves(oppIdx, tpH, tpV, tPos);
            for (var i = 0; i < moves1.length; i++) {
                var pos1 = [tPos[0].slice(), tPos[1].slice()];
                pos1[oppIdx] = [moves1[i][0], moves1[i][1]];
                if (moves1[i][0] === WIN[oppIdx]) return true;
                if (CerebroIA.bfsDist(oppIdx, tpH, tpV, pos1) <= 1) return true;
            }
            return false;
        }

        // ===== MELHORIA #3 + #17: CERCO SIMÉTRICO + BLOQUEIO EM U =====
        var paredesCandidatas = [];

        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                // ---- H (horizontal) ----
                if (CerebroIA.canPlace(r, c, 'H', pH, pV, pos)) {
                    if (celulasRota[r + ',' + c] || celulasRota[(r + 1) + ',' + c]) {
                        var tH = pH.concat([[r, c]]);
                        var novaDist = CerebroIA.bfsDist(oppIdx, tH, pV, pos);
                        var ganho = novaDist - oppD;

                        var ganhoTotal = ganho;
                        var paredesUsadas = 1;

                        // MELHORIA #3: busca 2ª parede SIMÉTRICA (mesma linha, c±1)
                        if (ganho >= 1) {
                            var simetricas = [c - 1, c + 1];
                            for (var s = 0; s < 2; s++) {
                                var cs = simetricas[s];
                                if (cs >= 0 && cs <= 7 && CerebroIA.canPlace(r, cs, 'H', tH, pV, pos)) {
                                    var tH2 = tH.concat([[r, cs]]);
                                    var novaDist2 = CerebroIA.bfsDist(oppIdx, tH2, pV, pos);
                                    var g2 = novaDist2 - oppD;
                                    if (g2 > ganhoTotal) {
                                        ganhoTotal = g2;
                                        paredesUsadas = 2;
                                    }
                                }
                            }
                            // Se simétricas não bastaram, tenta V adjacente (U)
                            if (paredesUsadas === 1) {
                                for (var c2 = 0; c2 < 8; c2++) {
                                    if (CerebroIA.canPlace(r, c2, 'V', tH, pV, pos)) {
                                        var tV = pV.concat([[r, c2]]);
                                        var g3 = CerebroIA.bfsDist(oppIdx, tH, tV, pos) - oppD;
                                        if (g3 > ganhoTotal + 2) {
                                            ganhoTotal = g3;
                                            paredesUsadas = 2;
                                        }
                                    }
                                }
                            }
                        }

                        // MELHORIA #15: bônus se evita ameaça em 2 turnos
                        var tHCheck = pH.concat([[r, c]]);
                        var evitaAmeaca = !_ameacaEm2Turnos(tHCheck, pV, pos);

                        var scoreH = ganhoTotal * 20 + (evitaAmeaca ? 30 : 0) + (paredesUsadas >= 2 ? 25 : 0);
                        if (ganhoTotal >= 3 || (evitaAmeaca && ganhoTotal >= 1)) {
                            paredesCandidatas.push({
                                r: r, c: c, ori: 'H',
                                ganho: ganhoTotal,
                                score: scoreH,
                                paredes: paredesUsadas
                            });
                        }
                    }
                }

                // ---- V (vertical) ----
                if (CerebroIA.canPlace(r, c, 'V', pH, pV, pos)) {
                    if (celulasRota[r + ',' + c] || celulasRota[r + ',' + (c + 1)]) {
                        var tV2 = pV.concat([[r, c]]);
                        var novaDistV = CerebroIA.bfsDist(oppIdx, pH, tV2, pos);
                        var ganhoV = novaDistV - oppD;
                        var ganhoTotalV = ganhoV;
                        var paredesUsadasV = 1;

                        // Simétricas verticais (mesma coluna, r±1)
                        if (ganhoV >= 1) {
                            var simetricasV = [r - 1, r + 1];
                            for (var sv = 0; sv < 2; sv++) {
                                var rs = simetricasV[sv];
                                if (rs >= 0 && rs <= 7 && CerebroIA.canPlace(rs, c, 'V', pH, tV2, pos)) {
                                    var tV3 = tV2.concat([[rs, c]]);
                                    var novaDist3 = CerebroIA.bfsDist(oppIdx, pH, tV3, pos);
                                    var g3v = novaDist3 - oppD;
                                    if (g3v > ganhoTotalV) {
                                        ganhoTotalV = g3v;
                                        paredesUsadasV = 2;
                                    }
                                }
                            }
                            // Tenta H adjacente (U)
                            if (paredesUsadasV === 1) {
                                for (var r3 = 0; r3 < 8; r3++) {
                                    if (CerebroIA.canPlace(r3, c, 'H', pH, tV2, pos)) {
                                        var tH3 = pH.concat([[r3, c]]);
                                        var gH3 = CerebroIA.bfsDist(oppIdx, tH3, tV2, pos) - oppD;
                                        if (gH3 > ganhoTotalV + 2) {
                                            ganhoTotalV = gH3;
                                            paredesUsadasV = 2;
                                        }
                                    }
                                }
                            }
                        }

                        var tVCheck = pV.concat([[r, c]]);
                        var evitaAmeacaV = !_ameacaEm2Turnos(pH, tVCheck, pos);
                        var scoreV = ganhoTotalV * 20 + (evitaAmeacaV ? 30 : 0) + (paredesUsadasV >= 2 ? 25 : 0);

                        if (ganhoTotalV >= 3 || (evitaAmeacaV && ganhoTotalV >= 1)) {
                            paredesCandidatas.push({
                                r: r, c: c, ori: 'V',
                                ganho: ganhoTotalV,
                                score: scoreV,
                                paredes: paredesUsadasV
                            });
                        }
                    }
                }
            }
        }

        // 3. Escolhe a melhor parede de cerco
        paredesCandidatas.sort(function (a, b) { return b.score - a.score; });

        if (paredesCandidatas.length > 0) {
            var melhor = paredesCandidatas[0];
            var tH4 = melhor.ori === 'H' ? pH.concat([[melhor.r, melhor.c]]) : pH.slice();
            var tV4 = melhor.ori === 'V' ? pV.concat([[melhor.r, melhor.c]]) : pV.slice();
            var meuDepois = CerebroIA.bfsDist(iaIdx, tH4, tV4, pos);
            if (meuDepois <= meuD + 1) {
                return { type: 'wall', r: melhor.r, c: melhor.c, ori: melhor.ori };
            }
        }

        // 4. Sem cerco efetivo → avança
        return _melhorMovimento(pos, pH, pV, walls, iaIdx);
    };

    // Helper: escolhe o movimento que mais aproxima da meta
    function _melhorMovimento(pos, pH, pV, walls, iaIdx) {
        var moves = CerebroIA.legalMoves(iaIdx, pH, pV, pos);
        if (moves.length === 0) return null;
        var melhorMv = null, melhorDist = 999;
        for (var i = 0; i < moves.length; i++) {
            var np = [pos[0].slice(), pos[1].slice()];
            np[iaIdx] = [moves[i][0], moves[i][1]];
            var d = CerebroIA.bfsDist(iaIdx, pH, pV, np);
            if (d < melhorDist) {
                melhorDist = d;
                melhorMv = { type: 'move', r: moves[i][0], c: moves[i][1] };
            }
        }
        return melhorMv || CerebroIA.gps(pos, pH, pV, walls, iaIdx);
    }

    // Expõe globalmente
    window.CerebroIA = CerebroIA;

    console.log('CerebroIA carregado — esqueleto OK');
})();
