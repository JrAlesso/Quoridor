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

    // Expõe globalmente
    window.CerebroIA = CerebroIA;

    console.log('CerebroIA carregado — esqueleto OK');
})();
