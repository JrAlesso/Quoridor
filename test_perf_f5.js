// =====================================================================
// test_perf_f5.js — Mede tempo e qualidade da IA F.5
// =====================================================================

global.N = 9;
global.WIN = [0, 8];
global.G = { pH: [], pV: [], pos: [[8, 4], [0, 4]] };
global.window = {};

require('./ia_cerebro.js');
var CI = global.window.CerebroIA;

console.log('=== Teste de performance F.5 ===\n');

// Força personalidade calculista (usa minimax sempre)
CI.resetarPersonalidade();
var tentativas = 0;
while (CI.getPersonalidade(1) !== 'calculista' && tentativas < 200) {
    CI.resetarPersonalidade();
    tentativas++;
}
console.log('Personalidade J1:', CI.getPersonalidade(1));

// 5 cenários diferentes
var cenarios = [
    { nome: 'Início limpo', pos: [[8, 4], [0, 4]], pH: [], pV: [], walls: [10, 10] },
    { nome: 'Meio de jogo', pos: [[6, 4], [2, 4]], pH: [], pV: [], walls: [8, 8] },
    { nome: 'Oponente perto', pos: [[1, 4], [5, 4]], pH: [], pV: [], walls: [7, 7] },
    { nome: 'Bloqueado', pos: [[5, 4], [3, 4]], pH: [[4,4],[5,4]], pV: [], walls: [5, 5] },
    { nome: 'Endgame', pos: [[2, 4], [6, 4]], pH: [], pV: [], walls: [3, 3] }
];

cenarios.forEach(function(c) {
    var t0 = Date.now();
    var acao = CI.minimax(c.pos, c.pH, c.pV, c.walls, 1);
    var tempo = Date.now() - t0;

    var tipo = acao ? (acao.type + '(' + acao.r + ',' + acao.c + (acao.ori ? ',' + acao.ori : '') + ')') : 'null';
    console.log('  ' + c.nome.padEnd(16) + ' | ' + String(tempo).padStart(4) + 'ms | ' + tipo);
});

console.log('\n=== Teste 2: 10 chamadas seguidas (mesmo cenário) ===');
var pos = [[5, 4], [3, 4]];
var tempos = [];
for (var i = 0; i < 10; i++) {
    var t0 = Date.now();
    CI.minimax(pos, [], [], [10, 10], 1);
    tempos.push(Date.now() - t0);
}
var media = tempos.reduce(function(a, b) { return a + b; }, 0) / tempos.length;
var max = Math.max.apply(null, tempos);
console.log('  Tempo médio: ' + media.toFixed(0) + 'ms');
console.log('  Tempo máximo: ' + max + 'ms');
console.log('  Todos < 600ms? ' + (max < 600 ? '✅ SIM' : '❌ NÃO'));
