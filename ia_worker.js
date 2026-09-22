// =====================================================================
// ia_worker.js — Web Worker que roda o CerebroIA fora da thread principal
// =====================================================================
// Este arquivo é carregado APENAS pelo Worker.
// O thread principal se comunica via postMessage.
//
// Protocolo:
//   Recebe: { tipo: 'jogar', pos, pH, pV, walls, iaIdx, id }
//   Envia:  { tipo: 'jogada', acao, id }
//           { tipo: 'erro', mensagem, id }
// =====================================================================

importScripts('ia_cerebro.js');

self.onmessage = function (e) {
    var dados = e.data;
    if (!dados || dados.tipo !== 'jogar') return;

    var id = dados.id;
    var CI = self.CerebroIA;

    if (!CI || typeof CI.jogar !== 'function') {
        self.postMessage({ tipo: 'erro', mensagem: 'CerebroIA não disponível', id: id });
        return;
    }

    try {
        var acao = CI.jogar(
            dados.pos,
            dados.pH,
            dados.pV,
            dados.walls,
            dados.iaIdx
        );
        self.postMessage({ tipo: 'jogada', acao: acao, id: id });
    } catch (err) {
        self.postMessage({ tipo: 'erro', mensagem: String(err), id: id });
    }
};

self.postMessage({ tipo: 'pronto' });
