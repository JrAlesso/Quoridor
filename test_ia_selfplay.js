// =====================================================================
// test_ia_selfplay.js — Cérebro vs Cérebro (self-play)
// =====================================================================
// Roda N partidas onde os DOIS jogadores usam CerebroIA.jogar.
// Serve pra:
//   1. Testar fases de perigo/emergência
//   2. Ver se dá travamento (ambos bloqueando)
//   3. Medir média de turnos
// =====================================================================

global.N = 9;
global.WIN = [0, 8];
global.G = { pH: [], pV: [], pos: [[8, 4], [0, 4]] };
global.window = {};

require('./ia_cerebro.js');
var CI = global.window.CerebroIA;

function novoEstado() {
    return { pos: [[8, 4], [0, 4]], pH: [], pV: [], walls: [10, 10], turno: 0, vencedor: null, turnosTotais: 0 };
}

function aplicarAcao(estado, acao, iaIdx) {
    if (acao.type === 'move') estado.pos[iaIdx] = [acao.r, acao.c];
    else if (acao.type === 'wall') {
        if (acao.ori === 'H') estado.pH.push([acao.r, acao.c]);
        else estado.pV.push([acao.r, acao.c]);
        estado.walls[iaIdx]--;
    }
}

function verificaVitoria(estado, iaIdx) {
    return estado.pos[iaIdx][0] === WIN[iaIdx];
}

function jogarPartida() {
    CI.resetarPersonalidade();  // nova personalidade por partida
    var estado = novoEstado();
    var fases = {};  // conta quantas vezes cada fase foi acionada

    while (estado.vencedor === null && estado.turnosTotais < 300) {
        var iaIdx = estado.turno;
        var r = CI.jogarDebug(estado.pos, estado.pH, estado.pV, estado.walls, iaIdx);
        fases[r.fase] = (fases[r.fase] || 0) + 1;

        var acao = r.acao;
        if (!acao) { estado.vencedor = 1 - iaIdx; break; }

        aplicarAcao(estado, acao, iaIdx);
        estado.turnosTotais++;

        if (verificaVitoria(estado, iaIdx)) estado.vencedor = iaIdx;
        else estado.turno = 1 - estado.turno;
    }
    return { estado: estado, fases: fases };
}

var n = parseInt(process.argv[2] || '10', 10);
console.log('Rodando ' + n + ' partidas Self-Play...\n');

var vit0 = 0, vit1 = 0, empates = 0, turnosTotal = 0;
var contFases = {};

for (var i = 1; i <= n; i++) {
    var res = jogarPartida();
    turnosTotal += res.estado.turnosTotais;

    for (var f in res.fases) contFases[f] = (contFases[f] || 0) + res.fases[f];

    if (res.estado.vencedor === 0) { vit0++; console.log('Partida ' + i + ': J0 venceu em ' + res.estado.turnosTotais + ' turnos'); }
    else if (res.estado.vencedor === 1) { vit1++; console.log('Partida ' + i + ': J1 venceu em ' + res.estado.turnosTotais + ' turnos'); }
    else { empates++; console.log('Partida ' + i + ': ⏱️  EMPATE em 300 turnos ⚠️'); }
}

console.log('\n========================================');
console.log('RESULTADO SELF-PLAY (' + n + ' partidas)');
console.log('========================================');
console.log('J0 venceu:      ' + vit0 + ' (' + ((vit0/n)*100).toFixed(1) + '%)');
console.log('J1 venceu:      ' + vit1 + ' (' + ((vit1/n)*100).toFixed(1) + '%)');
console.log('Empates:        ' + empates + ' (' + ((empates/n)*100).toFixed(1) + '%)');
console.log('Média de turnos: ' + (turnosTotal/n).toFixed(1));
console.log('\nFASES ACIONADAS:');
for (var f in contFases) console.log('  ' + f + ': ' + contFases[f]);
console.log('========================================');
