import re

with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1) Adicionar skinP1/skinP2 no objeto G inicial
conteudo = conteudo.replace(
    "var G = {pos: [[8,4],[0,4]], walls: [WALLS, WALLS], turn: 0, pH: [], pV: [], wallOwnerH: [], wallOwnerV: [], hist: [], over: false, sel: null, moves: [], mode: 'move', validH: [], validV: [], hoverNode: null, nivelIA: 'medio', iaThinking: false, p1Name: 'Player 1', p2Name: 'Player 2', vsIA: false, online: false, salald: null};",
    "var G = {pos: [[8,4],[0,4]], walls: [WALLS, WALLS], turn: 0, pH: [], pV: [], wallOwnerH: [], wallOwnerV: [], hist: [], over: false, sel: null, moves: [], mode: 'move', validH: [], validV: [], hoverNode: null, skinP1: 'classic', skinP2: 'classic', nivelIA: 'medio', iaThinking: false, p1Name: 'Player 1', p2Name: 'Player 2', vsIA: false, online: false, salald: null};"
)

# 2) Modificar drawPawn para usar G.skinP1/G.skinP2
conteudo = conteudo.replace('''function drawPawn(p, x, y, rad, active, rotateText) {
      var skinId = null;
      if (p === 0 && currentUser) {
        var stats = getStats();
        skinId = stats.equippedSkin || 'classic';
      }
      var skin = null;
      if (skinId) {
        for (var i = 0; i < SKINS.length; i++) {
          if (SKINS[i].id === skinId) { skin = SKINS[i]; break; }
        }
      }''', '''function drawPawn(p, x, y, rad, active, rotateText) {
      var skinId = null;
      if (p === 0) {
        skinId = G.skinP1 || (currentUser ? (getStats().equippedSkin || 'classic') : 'classic');
      } else {
        skinId = G.skinP2 || 'classic';
      }
      var skin = null;
      if (skinId) {
        for (var i = 0; i < SKINS.length; i++) {
          if (SKINS[i].id === skinId) { skin = SKINS[i]; break; }
        }
      }''')

# 3) Adicionar skins nos resets (resetGame, reset, resetAllGameState)
# resetGame
conteudo = conteudo.replace('''      G = {pos:[[8,4],[0,4]], walls:[WALLS,WALLS], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, vsIA:G.vsIA, nivelIA:G.nivelIA, iaThinking:false, p1Name:G.p1Name, p2Name:G.p2Name, online:false, salald:null};''',
'''      G = {pos:[[8,4],[0,4]], walls:[WALLS,WALLS], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, skinP1:(currentUser ? (getStats().equippedSkin || 'classic') : 'classic'), skinP2:'classic', vsIA:G.vsIA, nivelIA:G.nivelIA, iaThinking:false, p1Name:G.p1Name, p2Name:G.p2Name, online:false, salald:null};''')

# reset
conteudo = conteudo.replace('''      G = {pos:[[8,4],[0,4]], walls:[WALLS,WALLS], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, vsIA:G.vsIA, nivelIA:G.nivelIA, iaThinking:false, p1Name:G.p1Name, p2Name:G.p2Name, online:false, salald:null};''',
'''      G = {pos:[[8,4],[0,4]], walls:[WALLS,WALLS], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, skinP1:(currentUser ? (getStats().equippedSkin || 'classic') : 'classic'), skinP2:'classic', vsIA:G.vsIA, nivelIA:G.nivelIA, iaThinking:false, p1Name:G.p1Name, p2Name:G.p2Name, online:false, salald:null};''')

# resetAllGameState
conteudo = conteudo.replace('''      G = {pos:[[8,4],[0,4]], walls:[10,10], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, nivelIA:G.nivelIA||'medio', iaThinking:false, p1Name:currentUser||'Player 1', p2Name:'Player 2', vsIA:G.vsIA, online:false, salald:null};''',
'''      G = {pos:[[8,4],[0,4]], walls:[10,10], turn:0, pH:[], pV:[], wallOwnerH:[], wallOwnerV:[], hist:[], over:false, sel:null, moves:[], mode:'move', validH:[], validV:[], hoverNode:null, skinP1:(currentUser ? (getStats().equippedSkin || 'classic') : 'classic'), skinP2:'classic', nivelIA:G.nivelIA||'medio', iaThinking:false, p1Name:currentUser||'Player 1', p2Name:'Player 2', vsIA:G.vsIA, online:false, salald:null};''')

# 4) aplicarEstadoSala (Firestore) - adicionar skins
conteudo = conteudo.replace('''function aplicarEstadoSala(data) {
      if (!data) return;
      G.p1Name = data.jogador1 || G.p1Name;
      G.p2Name = data.jogador2 || G.p2Name || 'Aguardando...';''',
'''function aplicarEstadoSala(data) {
      if (!data) return;
      G.p1Name = data.jogador1 || G.p1Name;
      G.p2Name = data.jogador2 || G.p2Name || 'Aguardando...';
      G.skinP1 = data.skinJogador1 || 'classic';
      G.skinP2 = data.skinJogador2 || 'classic';''')

# 5) Patch RTDB - criarSala: adicionar skinJogador1
conteudo = conteudo.replace('''    var dados = {
      nomePartida: nome,
      jogador1: currentUser,
      jogador2: "",
      status: "esperando",
      turno: 0,
      posicoes: [[8,4],[0,4]],
      paredesH: [],
      paredesV: [],
      paredesRestantes: [10,10],
      vencedor: "",
      createdAt: Date.now(),
      senha: senha
    };''',
'''    var dados = {
      nomePartida: nome,
      jogador1: currentUser,
      skinJogador1: getStats().equippedSkin || 'classic',
      jogador2: "",
      skinJogador2: "",
      status: "esperando",
      turno: 0,
      posicoes: [[8,4],[0,4]],
      paredesH: [],
      paredesV: [],
      paredesRestantes: [10,10],
      vencedor: "",
      createdAt: Date.now(),
      senha: senha
    };''')

# 6) Patch RTDB - entrarSala: adicionar skinJogador2
conteudo = conteudo.replace('''    ref.update({ jogador2: currentUser, status: "em_andamento" }).then(function(){''',
'''    ref.update({ jogador2: currentUser, skinJogador2: getStats().equippedSkin || 'classic', status: "em_andamento" }).then(function(){''')

# 7) iniciarJogoOnlineRTDB - setar skins após definir p1Name/p2Name
conteudo = conteudo.replace('''    document.getElementById("p1-nome").textContent = G.p1Name;
    document.getElementById("nomeJ2").textContent = G.p2Name;
    document.getElementById("placar-p1").textContent = G.p1Name;
    document.getElementById("placar-p2").textContent = G.p2Name;''',
'''    G.skinP1 = data.skinJogador1 || 'classic';
    G.skinP2 = data.skinJogador2 || 'classic';
    document.getElementById("p1-nome").textContent = G.p1Name;
    document.getElementById("nomeJ2").textContent = G.p2Name;
    document.getElementById("placar-p1").textContent = G.p1Name;
    document.getElementById("placar-p2").textContent = G.p2Name;''')

# 8) No listener do ref.on("value", handler) - atualizar skins ao receber novo
conteudo = conteudo.replace('''      if (typeof aplicarEstadoSala==="function") aplicarEstadoSala(novo);
      else {
        G.pos = novo.posicoes || G.pos;
        G.walls = novo.paredesRestantes || G.walls;
        G.turn = typeof novo.turno==="number" ? novo.turno : G.turn;
        G.p1Name = novo.jogador1 || G.p1Name;
        G.p2Name = novo.jogador2 || G.p2Name;
      }''',
'''      G.skinP1 = novo.skinJogador1 || 'classic';
      G.skinP2 = novo.skinJogador2 || 'classic';
      if (typeof aplicarEstadoSala==="function") aplicarEstadoSala(novo);
      else {
        G.pos = novo.posicoes || G.pos;
        G.walls = novo.paredesRestantes || G.walls;
        G.turn = typeof novo.turno==="number" ? novo.turno : G.turn;
        G.p1Name = novo.jogador1 || G.p1Name;
        G.p2Name = novo.jogador2 || G.p2Name;
      }''')

# Salvar
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Skins propagadas com sucesso!")
