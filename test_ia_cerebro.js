// =====================================================================
// test_ia_cerebro.js — Teste standalone das funções base do CerebroIA
// =====================================================================
// Roda com: node test_ia_cerebro.js

// ---- Stubs das variáveis globais do jogo ----
global.N = 9;
global.WIN = [0, 8];
global.G = { pH: [], pV: [], pos: [[8, 4], [0, 4]] };
global.window = {};

// ---- Carrega ia_cerebro.js ----
require('./ia_cerebro.js');
var CI = global.window.CerebroIA;

// ---- Helpers ----
var pass = 0, fail = 0;
function check(nome, valor, esperado) {
    var ok = JSON.stringify(valor) === JSON.stringify(esperado);
    if (ok) { pass++; console.log('  ✅ ' + nome + ' = ' + JSON.stringify(valor)); }
    else { fail++; console.log('  ❌ ' + nome + ' — esperado ' + JSON.stringify(esperado) + ', obtido ' + JSON.stringify(valor)); }
}

// =====================================================================
// TESTE 1 — Tabuleiro vazio, ambos os peões na posição inicial
// =====================================================================
console.log('\n=== TESTE 1: Tabuleiro vazio ===');
var pH1 = [], pV1 = [], pos1 = [[8, 4], [0, 4]];
check('bfsDist(0) = 8 (peão 0 sobe 8 casas)', CI.bfsDist(0, pH1, pV1, pos1), 8);
check('bfsDist(1) = 8 (peão 1 desce 8 casas)', CI.bfsDist(1, pH1, pV1, pos1), 8);
check('legalMoves(0) = 3 (sobe + 2 laterais)', CI.legalMoves(0, pH1, pV1, pos1).length, 3);
check('canWinNext(0) = false', CI.canWinNext(0, pH1, pV1, pos1), false);

// =====================================================================
// TESTE 2 — Uma parede vertical bloqueando caminho
// =====================================================================
console.log('\n=== TESTE 2: Parede vertical isolada ===');
// Parede V em (7,4) bloqueia passagem entre (7,3)-(7,4) e (7,4)-(7,5)
var pH2 = [[7, 4]], pV2 = [], pos2 = [[8, 4], [0, 4]];
// pH em (7,4) bloqueia entre (7,4) e (8,4). Ambos desviam 1 casa.
check('bfsDist(0) = 9 com pH[7,4] (desvia 1 casa)', CI.bfsDist(0, pH2, pV2, pos2), 9);
check('bfsDist(1) = 9 com pH[7,4] (também desvia)', CI.bfsDist(1, pH2, pV2, pos2), 9);

// =====================================================================
// TESTE 3 — bfsPath retorna caminho completo
// =====================================================================
console.log('\n=== TESTE 3: bfsPath ===');
var r3 = CI.bfsPath(1, pH1, pV1, pos1);
check('bfsPath(1).dist = 8', r3.dist, 8);
check('bfsPath(1).path[0] = [0,4] (ponto de partida)', r3.path[0], [0, 4]);
check('bfsPath(1).path chega na linha 8 (meta)', r3.path[r3.path.length - 1][0], 8);
check('bfsPath(1).path tem 9 elementos (dist 8)', r3.path.length, 9);

// =====================================================================
// TESTE 4 — wallBlock detecta bloqueio
// =====================================================================
console.log('\n=== TESTE 4: wallBlock ===');
// pV em (7,4) bloqueia SÓ (7,4)→(7,5)
check('wallBlock(7,4→7,5) com pV[7,4] = true', CI.wallBlock([], [[7, 4]], 7, 4, 7, 5), true);
// pV em (7,4) NÃO bloqueia (7,3)→(7,4) — seria pV[7,3]
check('wallBlock(7,3→7,4) com pV[7,4] = false', CI.wallBlock([], [[7, 4]], 7, 3, 7, 4), false);
// pV em (7,3) bloqueia (7,3)→(7,4)
check('wallBlock(7,3→7,4) com pV[7,3] = true', CI.wallBlock([], [[7, 3]], 7, 3, 7, 4), true);
// pH em (7,4) bloqueia passagem vertical (7,4)→(8,4)
check('wallBlock(7,4→8,4) com pH[7,4] = true', CI.wallBlock([[7, 4]], [], 7, 4, 8, 4), true);
// Sem parede = false
check('wallBlock(8,3→8,4) sem parede = false', CI.wallBlock([], [], 8, 3, 8, 4), false);

// =====================================================================
// TESTE 5 — canPlace respeita regras
// =====================================================================
console.log('\n=== TESTE 5: canPlace ===');
check('canPlace(0,0,H) em tabuleiro vazio = true', CI.canPlace(0, 0, 'H', [], [], pos1), true);
check('canPlace(0,0,H) em cima de parede H existente = false', CI.canPlace(0, 0, 'H', [[0, 0]], [], pos1), false);

// =====================================================================
// RESULTADO FINAL
// =====================================================================
console.log('\n========================================');
console.log('RESULTADO (funções base): ' + pass + ' passaram, ' + fail + ' falharam');
console.log('========================================');

// =====================================================================
// TESTES DAS TÉCNICAS — Bloco A
// =====================================================================
console.log('\n========================================');
console.log('TESTES DAS TÉCNICAS (Bloco A)');
console.log('========================================');

// Helpers
function validarAcao(nome, acao) {
    if (acao === null) {
        console.log('  ⚠️  ' + nome + ' = null (sem ação)');
        return true;
    }
    if (acao.type === 'move') {
        if (typeof acao.r !== 'number' || typeof acao.c !== 'number') {
            console.log('  ❌ ' + nome + ' — move sem r/c válidos');
            return false;
        }
        console.log('  ✅ ' + nome + ' = move(' + acao.r + ',' + acao.c + ')');
        return true;
    }
    if (acao.type === 'wall') {
        if (typeof acao.r !== 'number' || typeof acao.c !== 'number' || (acao.ori !== 'H' && acao.ori !== 'V')) {
            console.log('  ❌ ' + nome + ' — wall mal formada');
            return false;
        }
        console.log('  ✅ ' + nome + ' = wall(' + acao.r + ',' + acao.c + ',' + acao.ori + ')');
        return true;
    }
    console.log('  ❌ ' + nome + ' — type desconhecido: ' + acao.type);
    return false;
}

// ---- Cenário 1: tabuleiro limpo, peões longe ----
console.log('\n--- Cenário 1: peões longe, tabuleiro limpo ---');
var posT1 = [[8, 4], [0, 4]];
var wallsT1 = [10, 10];
validarAcao('gps         ', CI.gps(posT1, [], [], wallsT1, 1));
validarAcao('visaoReal   ', CI.visaoReal(posT1, [], [], wallsT1, 1));
validarAcao('economicaV1 ', CI.economicaV1(posT1, [], [], wallsT1, 1));

// ---- Cenário 2: oponente a 2 casas da vitória (IA longe) ----
console.log('\n--- Cenário 2: oponente a 2 casas da vitória ---');
// Peão 0 em (2,4) — 2 passos da linha 0. IA em (4,4) — 4 passos da linha 8.
var posT2 = [[2, 4], [4, 4]];
validarAcao('gps         ', CI.gps(posT2, [], [], wallsT1, 1));
validarAcao('visaoReal   ', CI.visaoReal(posT2, [], [], wallsT1, 1));
validarAcao('economicaV1 ', CI.economicaV1(posT2, [], [], wallsT1, 1));

// ---- Cenário 3: oponente a 1 casa da vitória (crítico) ----
console.log('\n--- Cenário 3: oponente a 1 casa da vitória ---');
// Peão 0 em (1,4) — 1 passo da linha 0. IA em (4,4) — 4 passos da linha 8.
var posT3 = [[1, 4], [4, 4]];
validarAcao('gps         ', CI.gps(posT3, [], [], wallsT1, 1));
validarAcao('visaoReal   ', CI.visaoReal(posT3, [], [], wallsT1, 1));
validarAcao('economicaV1 ', CI.economicaV1(posT3, [], [], wallsT1, 1));

// ---- Cenário 4: IA a 1 casa da vitória (deve vencer agora) ----
console.log('\n--- Cenário 4: IA a 1 casa da vitória ---');
var posT4 = [[8, 4], [1, 4]];
validarAcao('gps         ', CI.gps(posT4, [], [], wallsT1, 1));
validarAcao('visaoReal   ', CI.visaoReal(posT4, [], [], wallsT1, 1));
validarAcao('economicaV1 ', CI.economicaV1(posT4, [], [], wallsT1, 1));

console.log('\n=== Bloco A testado ===');


// =====================================================================
// TESTES DAS TÉCNICAS — Bloco B
// =====================================================================
console.log('\n========================================');
console.log('TESTES DAS TÉCNICAS (Bloco B)');
console.log('========================================');

// ---- Cenário 1: peões longe, tabuleiro limpo ----
console.log('\n--- Cenário 1: peões longe ---');
var pB1 = [[8, 4], [0, 4]];
var wB1 = [10, 10];
validarAcao('justa         ', CI.justa(pB1, [], [], wB1, 1));
validarAcao('economicaV2   ', CI.economicaV2(pB1, [], [], wB1, 1));
validarAcao('invencivel    ', CI.invencivel(pB1, [], [], wB1, 1));
validarAcao('antiBrecha    ', CI.antiBrecha(pB1, [], [], wB1, 1));

// ---- Cenário 2: oponente no meio (linha 4) ----
console.log('\n--- Cenário 2: oponente no meio ---');
var pB2 = [[4, 4], [4, 4]];
validarAcao('justa         ', CI.justa(pB2, [], [], wB1, 1));
validarAcao('economicaV2   ', CI.economicaV2(pB2, [], [], wB1, 1));
validarAcao('invencivel    ', CI.invencivel(pB2, [], [], wB1, 1));
validarAcao('antiBrecha    ', CI.antiBrecha(pB2, [], [], wB1, 1));

// ---- Cenário 3: oponente a 2 casas da vitória ----
console.log('\n--- Cenário 3: oponente a 2 casas ---');
var pB3 = [[2, 4], [4, 4]];
validarAcao('justa         ', CI.justa(pB3, [], [], wB1, 1));
validarAcao('economicaV2   ', CI.economicaV2(pB3, [], [], wB1, 1));
validarAcao('invencivel    ', CI.invencivel(pB3, [], [], wB1, 1));
validarAcao('antiBrecha    ', CI.antiBrecha(pB3, [], [], wB1, 1));

// ---- Cenário 4: IA a 1 da vitória ----
console.log('\n--- Cenário 4: IA a 1 da vitória ---');
var pB4 = [[8, 4], [1, 4]];
validarAcao('justa         ', CI.justa(pB4, [], [], wB1, 1));
validarAcao('economicaV2   ', CI.economicaV2(pB4, [], [], wB1, 1));
validarAcao('invencivel    ', CI.invencivel(pB4, [], [], wB1, 1));
validarAcao('antiBrecha    ', CI.antiBrecha(pB4, [], [], wB1, 1));

console.log('\n=== Bloco B testado ===');


// =====================================================================
// TESTES DAS TÉCNICAS — Bloco C
// =====================================================================
console.log('\n========================================');
console.log('TESTES DAS TÉCNICAS (Bloco C)');
console.log('========================================');

var wC = [10, 10];

console.log('\n--- Cenário 1: peões longe ---');
var pC1 = [[8, 4], [0, 4]];
validarAcao('etapa2        ', CI.etapa2BloqueioDuplo(pC1, [], [], wC, 1));
validarAcao('etapa3        ', CI.etapa3Gargalo(pC1, [], [], wC, 1));
validarAcao('strategicV1   ', CI.strategicV1(pC1, [], [], wC, 1));
validarAcao('forte         ', CI.forte(pC1, [], [], wC, 1));
validarAcao('consolidada   ', CI.consolidadaFinal(pC1, [], [], wC, 1));

console.log('\n--- Cenário 2: oponente no meio ---');
var pC2 = [[4, 4], [4, 4]];
validarAcao('etapa2        ', CI.etapa2BloqueioDuplo(pC2, [], [], wC, 1));
validarAcao('etapa3        ', CI.etapa3Gargalo(pC2, [], [], wC, 1));
validarAcao('strategicV1   ', CI.strategicV1(pC2, [], [], wC, 1));
validarAcao('forte         ', CI.forte(pC2, [], [], wC, 1));
validarAcao('consolidada   ', CI.consolidadaFinal(pC2, [], [], wC, 1));

console.log('\n--- Cenário 3: oponente a 2 casas ---');
var pC3 = [[2, 4], [4, 4]];
validarAcao('etapa2        ', CI.etapa2BloqueioDuplo(pC3, [], [], wC, 1));
validarAcao('etapa3        ', CI.etapa3Gargalo(pC3, [], [], wC, 1));
validarAcao('strategicV1   ', CI.strategicV1(pC3, [], [], wC, 1));
validarAcao('forte         ', CI.forte(pC3, [], [], wC, 1));
validarAcao('consolidada   ', CI.consolidadaFinal(pC3, [], [], wC, 1));

console.log('\n--- Cenário 4: IA a 1 da vitória ---');
var pC4 = [[8, 4], [7, 4]];
validarAcao('etapa2        ', CI.etapa2BloqueioDuplo(pC4, [], [], wC, 1));
validarAcao('etapa3        ', CI.etapa3Gargalo(pC4, [], [], wC, 1));
validarAcao('strategicV1   ', CI.strategicV1(pC4, [], [], wC, 1));
validarAcao('forte         ', CI.forte(pC4, [], [], wC, 1));
validarAcao('consolidada   ', CI.consolidadaFinal(pC4, [], [], wC, 1));

console.log('\n=== Bloco C testado ===');

// =====================================================================
// RESULTADO FINAL — junta tudo
// =====================================================================
console.log('\n========================================');
console.log('RESULTADO TOTAL: ' + pass + ' passaram, ' + fail + ' falharam');
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);

