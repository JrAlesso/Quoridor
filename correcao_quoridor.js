// ============================================================
// FUNÇÃO CORRIGIDA: prepararConfiguracao (abre o overlay corretamente)
// ============================================================
function prepararConfiguracao(vsIA) {
    resetAllGameState();
    isOnlineMode = false;
    salaAtual = null;
    if (salaUnsubscribe) { 
        try { salaUnsubscribe(); } catch(e){} 
        salaUnsubscribe = null; 
    }
    if (listaSalasUnsubscribe) { 
        try { listaSalasUnsubscribe(); } catch(e){} 
        listaSalasUnsubscribe = null; 
    }
    G.vsIA = vsIA;
    G.offlineMode = true;
    G.p1Name = currentUser || 'Player 1';
    G.p2Name = vsIA ? ('IA (' + (G.nivelIA || 'medio').toUpperCase() + ')') : 'Player 2';
    document.getElementById('p1-name-input').value = G.p1Name;
    document.getElementById('p2-name-input').value = G.p2Name;
    document.getElementById('nivel-config').style.display = vsIA ? 'block' : 'none';
    document.getElementById('names-config').style.display = vsIA ? 'none' : 'block';
    if (vsIA && !document.querySelector('#nivel-options button.selected')) {
        document.querySelector('#nivel-options button[data-nivel="medio"]').classList.add('selected');
    }
    updateUndoButtonVisibility();
    document.getElementById('config-overlay').classList.add('show');
}

// ===== CORREÇÃO: event listeners dos botões =====
document.getElementById('btn-vs-ia').addEventListener('click', function(){ 
    prepararConfiguracao(true); 
});

document.getElementById('btn-2p').addEventListener('click', function(){ 
    prepararConfiguracao(false); 
});
