// =====================================================================
// test_ia_partidas.js — Simulador de partidas Quoridor
// =====================================================================
// Roda partidas completas entre:
//   - IA Cerebro (usa CerebroIA.jogar)
//   - IA Aleatória (joga movimentos válidos aleatórios)
//
// Uso: node test_ia_partidas.js [numero_de_partidas]
// =====================================================================

// ---- Stubs do jogo ----
global.N = 9;
global.WIN = [0, 8];
global.G = { pH: [], pV: [], pos: [[8, 4], [0, 4]] };
global.window = {};

require('./ia_cerebro.js');
var CI = global.window.CerebroIA;

// =====================================================================
// SIMULADOR DE PARTIDA
// =====================================================================

// Cria estado inicial
function novoEstado() {
    return {
        pos: [[8, 4], [0, 4]],
        pH: [],
        pV: [],
        walls: [10, 10],
        turno: 0,  // 0 começa
        vencedor: null,
        turnosTotais: 0
    };
}

// IA Aleatória — escolhe ação válida aleatória
function jogarAleatoria(estado, iaIdx) {
    var acoes = [];

    // Movimentos válidos
    var moves = CI.legalMoves(iaIdx, estado.pH, estado.pV, estado.pos);
    for (var i = 0; i < moves.length; i++) {
        acoes.push({ type: 'move', r: moves[i][0], c: moves[i][1] });
    }

    // Paredes válidas (se tiver)
    if (estado.walls[iaIdx] > 0) {
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (CI.canPlace(r, c, 'H', estado.pH, estado.pV, estado.pos)) {
                    acoes.push({ type: 'wall', r: r, c: c, ori: 'H' });
                }
                if (CI.canPlace(r, c, 'V', estado.pH, estado.pV, estado.pos)) {
                    acoes.push({ type: 'wall', r: r, c: c, ori: 'V' });
                }
            }
        }
    }

    if (acoes.length === 0) return null;
    return acoes[Math.floor(Math.random() * acoes.length)];
}

// Aplica ação ao estado
function aplicarAcao(estado, acao, iaIdx) {
    if (acao.type === 'move') {
        estado.pos[iaIdx] = [acao.r, acao.c];
    } else if (acao.type === 'wall') {
        if (acao.ori === 'H') estado.pH.push([acao.r, acao.c]);
        else estado.pV.push([acao.r, acao.c]);
        estado.walls[iaIdx]--;
    }
}

// Verifica vitória após jogada
function verificaVitoria(estado, iaIdx) {
    return estado.pos[iaIdx][0] === WIN[iaIdx];
}

// Loop principal de uma partida
// tipoIA0: 'cerebro' ou 'aleatoria'
// tipoIA1: 'cerebro' ou 'aleatoria'
function jogarPartida(tipoIA0, tipoIA1) {
    var estado = novoEstado();

    while (estado.vencedor === null && estado.turnosTotais < 300) {
        var iaIdx = estado.turno;
        var tipo = iaIdx === 0 ? tipoIA0 : tipoIA1;

        var acao = null;
        if (tipo === 'cerebro') {
            acao = CI.jogar(estado.pos, estado.pH, estado.pV, estado.walls, iaIdx);
        } else {
            acao = jogarAleatoria(estado, iaIdx);
        }

        if (!acao) {
            // Sem ação válida — considera derrota
            estado.vencedor = 1 - iaIdx;
            break;
        }

        aplicarAcao(estado, acao, iaIdx);
        estado.turnosTotais++;

        if (verificaVitoria(estado, iaIdx)) {
            estado.vencedor = iaIdx;
        } else {
            estado.turno = 1 - estado.turno;
        }
    }

    return estado;
}

// =====================================================================
// EXECUÇÃO
// =====================================================================

var nPartidas = parseInt(process.argv[2] || '5', 10);
console.log('Rodando ' + nPartidas + ' partidas...\n');

var vitoriasCerebro = 0;
var vitoriasAleatoria = 0;
var empates = 0;
var turnosTotais = 0;

// Cerebro é sempre o jogador 1 (IA Expert)
// Aleatória é sempre o jogador 0 (oponente)
for (var i = 1; i <= nPartidas; i++) {
    var resultado = jogarPartida('aleatoria', 'cerebro');
    turnosTotais += resultado.turnosTotais;

    if (resultado.vencedor === 1) {
        vitoriasCerebro++;
        console.log('Partida ' + i + ': ✅ Cerebro venceu em ' + resultado.turnosTotais + ' turnos');
    } else if (resultado.vencedor === 0) {
        vitoriasAleatoria++;
        console.log('Partida ' + i + ': ❌ Aleatória venceu em ' + resultado.turnosTotais + ' turnos');
    } else {
        empates++;
        console.log('Partida ' + i + ': ⏱️  Empate (limite de turnos)');
    }
}

// =====================================================================
// RESULTADO FINAL
// =====================================================================
console.log('\n========================================');
console.log('RESULTADO DE ' + nPartidas + ' PARTIDAS');
console.log('========================================');
console.log('Vitórias do Cérebro:   ' + vitoriasCerebro + ' (' + ((vitoriasCerebro/nPartidas)*100).toFixed(1) + '%)');
console.log('Vitórias da Aleatória: ' + vitoriasAleatoria + ' (' + ((vitoriasAleatoria/nPartidas)*100).toFixed(1) + '%)');
console.log('Empates:               ' + empates);
console.log('Média de turnos:       ' + (turnosTotais/nPartidas).toFixed(1));
console.log('========================================');
