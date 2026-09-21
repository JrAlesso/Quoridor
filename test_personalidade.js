// =====================================================================
// test_personalidade.js — Testa as 5 personalidades do cérebro
// =====================================================================

global.N = 9;
global.WIN = [0, 8];
global.G = { pH: [], pV: [], pos: [[8, 4], [0, 4]] };
global.window = {};

require('./ia_cerebro.js');
var CI = global.window.CerebroIA;

console.log('=== Testando personalidades ===\n');

// Força cada personalidade e mostra a técnica escolhida em cada fase
var personalidades = ['agressivo', 'defensivo', 'equilibrado', 'adaptativo', 'calculista'];

// Salva a função original de sortear
var _sortearOriginal = function() {};
CI._forcarPersonalidade = function (p) {
    // Hack: substitui o sorteador por um que sempre retorna 'p'
    var originalReset = CI.resetarPersonalidade;
    CI.resetarPersonalidade = function () {
        // Zera e força
        originalReset();
        // Força via override interno — chamamos várias vezes até bater
        var tentativas = 0;
        while (CI.getPersonalidade() !== p && tentativas < 100) {
            originalReset();
            tentativas++;
        }
        return p;
    };
};

// Cenário: oponente a 5 casas (fase "meio" no equilibrado)
var pos = [[5, 4], [4, 4]];
var pH = [], pV = [], walls = [10, 10];

console.log('Cenário: oponente a 5 casas, ambas com 10 paredes\n');

personalidades.forEach(function (p) {
    // Força a personalidade
    var tentativas = 0;
    while (CI.getPersonalidade() !== p && tentativas < 200) {
        CI.resetarPersonalidade();
        tentativas++;
    }

    var r = CI.jogarDebug(pos, pH, pV, walls, 1);
    console.log('  Personalidade: ' + p);
    console.log('    fase:    ' + r.fase);
    console.log('    técnica: ' + r.tecnica);
    console.log('    ação:    ' + JSON.stringify(r.acao));
    console.log('');
});

// Teste de aleatoriedade natural: 20 sorteios
console.log('=== Distribuição em 20 sorteios ===');
CI.resetarPersonalidade();
var cont = {};
for (var i = 0; i < 20; i++) {
    CI.resetarPersonalidade();
    var p = CI.getPersonalidade();
    cont[p] = (cont[p] || 0) + 1;
}
for (var k in cont) console.log('  ' + k + ': ' + cont[k]);
