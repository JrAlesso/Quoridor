// =====================================================================
// test_champion_vs_challenger.js — Método A/B profissional
// =====================================================================
// Roda N partidas entre a IA campeã (v1) e a desafiante (v2).
// Alterna quem começa pra balancear vantagem do 1º jogador.

const fs = require('fs');
const vm = require('vm');

function carregarIA(caminho) {
    const code = fs.readFileSync(caminho, 'utf8');
    const sandbox = {
        window: {},
        self: null,  // preenchido abaixo
        console: { log: () => {}, warn: () => {}, error: () => {} },
        setTimeout: () => 0,
        clearTimeout: () => {},
        N: 9,
        WIN: [0, 8],
        G: { pH: [], pV: [], pos: [[8,4],[0,4]] },
        localStorage: {
            _data: {},
            getItem: function(k) { return this._data[k] || null; },
            setItem: function(k, v) { this._data[k] = String(v); },
            removeItem: function(k) { delete this._data[k]; }
        }
    };
    // No sandbox, self = o próprio sandbox (como no worker)
    sandbox.self = sandbox;
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox.window.CerebroIA;
}

console.log('Carregando Champion (v1)...');
const IA_CHAMPION = carregarIA('_champion_test.js');

console.log('Carregando Challenger (v2)...');
const IA_CHALLENGER = carregarIA('ia_cerebro.js');

if (!IA_CHAMPION || !IA_CHALLENGER) {
    console.error('ERRO: IA não carregou');
    process.exit(1);
}
console.log('Ambas IA carregadas ✅\n');

function novoEstado() {
    return { pos: [[8,4],[0,4]], pH: [], pV: [], walls: [10, 10], turno: 0, vencedor: null, turnosTotais: 0 };
}

function aplicarAcao(estado, acao, iaIdx) {
    if (acao.type === 'move') estado.pos[iaIdx] = [acao.r, acao.c];
    else if (acao.type === 'wall') {
        if (acao.ori === 'H') estado.pH.push([acao.r, acao.c]);
        else estado.pV.push([acao.r, acao.c]);
        estado.walls[iaIdx]--;
    }
}

function jogarPartida(IA0, IA1) {
    const estado = novoEstado();
    while (estado.vencedor === null && estado.turnosTotais < 200) {
        const idx = estado.turno;
        const ia = idx === 0 ? IA0 : IA1;
        let acao = null;
        try {
            acao = ia.jogar(estado.pos, estado.pH, estado.pV, [estado.walls[0], estado.walls[1]], idx);
        } catch (e) {
            estado.vencedor = 1 - idx;
            break;
        }
        if (!acao) { estado.vencedor = 1 - idx; break; }
        
        aplicarAcao(estado, acao, idx);
        estado.turnosTotais++;
        
        const goalRow = idx === 0 ? 0 : 8;
        if (estado.pos[idx][0] === goalRow) estado.vencedor = idx;
        else estado.turno = 1 - estado.turno;
    }
    return estado;
}

const N = parseInt(process.argv[2] || '10', 10);
console.log('=== Champion vs Challenger: ' + N + ' partidas ===\n');

let vitChampion = 0, vitChallenger = 0, empates = 0, turnosTotal = 0;
const tempoInicio = Date.now();

for (let i = 1; i <= N; i++) {
    let resultado, champIdx;
    if (i % 2 === 1) {
        resultado = jogarPartida(IA_CHAMPION, IA_CHALLENGER);
        champIdx = 0;
    } else {
        resultado = jogarPartida(IA_CHALLENGER, IA_CHAMPION);
        champIdx = 1;
    }
    turnosTotal += resultado.turnosTotais;
    
    if (resultado.vencedor === champIdx) {
        vitChampion++;
        console.log('Partida ' + i + ': Champion venceu em ' + resultado.turnosTotais + ' turnos');
    } else if (resultado.vencedor === (1 - champIdx)) {
        vitChallenger++;
        console.log('Partida ' + i + ': Challenger venceu em ' + resultado.turnosTotais + ' turnos');
    } else {
        empates++;
        console.log('Partida ' + i + ': EMPATE (' + resultado.turnosTotais + ' turnos)');
    }
}

const tempoTotal = ((Date.now() - tempoInicio) / 1000).toFixed(1);
console.log('\n========================================');
console.log('RESULTADO — ' + N + ' partidas em ' + tempoTotal + 's');
console.log('========================================');
console.log('Champion venceu:   ' + vitChampion + ' (' + ((vitChampion/N)*100).toFixed(1) + '%)');
console.log('Challenger venceu: ' + vitChallenger + ' (' + ((vitChallenger/N)*100).toFixed(1) + '%)');
console.log('Empates:           ' + empates);
console.log('Média de turnos:   ' + (turnosTotal/N).toFixed(1));
console.log('');
console.log('VEREDICTO:');
if (vitChallenger >= N * 0.6) {
    console.log('  ✅ PROMOVER — Challenger é +20% melhor');
} else if (vitChallenger >= N * 0.4) {
    console.log('  ➡️  NEUTRO — diferença não significativa');
} else {
    console.log('  ❌ REVERTER — Challenger é pior');
}
