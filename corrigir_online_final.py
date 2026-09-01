import re

with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Remover o patch RTDB antigo (todo o script entre <!--ONLINE_PATCH_RTDB--> e </script>)
inicio_patch = conteudo.find('<!--ONLINE_PATCH_RTDB-->')
if inicio_patch != -1:
    fim_patch = conteudo.find('</script>', inicio_patch)
    if fim_patch != -1:
        # incluir o </script> e quebras de linha
        fim_patch += len('</script>')
        conteudo = conteudo[:inicio_patch] + conteudo[fim_patch:]

# 2. Remover listener antigo do btn-online (Firestore)
padrao_btn_online_antigo = re.compile(r"document\.getElementById\('btn-online'\)\.addEventListener\('click', function\(\) \{.*?\n\s*\}\);", re.DOTALL)
conteudo = padrao_btn_online_antigo.sub('', conteudo)

# 3. Adicionar novo script RTDB antes do </body>
novo_rtdb = '''
<script>
// ===== SISTEMA DE SALAS ONLINE (RTDB) =====
(function(){
  // Garantir que funções antigas não interfiram
  if (typeof listarSalasAbertas === 'function') listarSalasAbertas = null;
  if (typeof criarSala === 'function') criarSala = null;
  if (typeof entrarSala === 'function') entrarSala = null;

  function getRtdb(){
    try {
      return firebase.database();
    } catch(e) {
      alert("RTDB não carregado: " + e.message);
      return null;
    }
  }

  function setStatus(msg){
    var el = document.getElementById("sala-status");
    if (el) el.innerHTML = msg;
  }

  // Listar salas abertas (esperando)
  function escutarSalas(){
    var rtdb = getRtdb();
    if (!rtdb) return;
    if (window._listaUnsub) {
      try { rtdb.ref("salas").off("value", window._listaUnsub); } catch(e){}
    }
    setStatus("🔄 Carregando salas...");
    window._listaUnsub = function(snap){
      var lista = document.getElementById("sala-lista");
      if (!lista) return;
      lista.innerHTML = "";
      var val = snap.val() || {};
      var items = [];
      Object.keys(val).forEach(function(id){
        var d = val[id];
        if (d && d.status === "esperando") items.push({id:id, d:d});
      });
      items.sort(function(a,b){ return (b.d.createdAt||0) - (a.d.createdAt||0); });
      if (!items.length) {
        lista.innerHTML = '<div class="history-empty">Nenhuma sala aberta. Crie uma!</div>';
        setStatus("💡 Nenhuma sala disponível.");
        return;
      }
      setStatus("📋 " + items.length + " sala(s) disponível(eis)");
      items.forEach(function(it){
        var d = it.d;
        var nome = d.nomePartida || d.jogador1 || "Sala";
        var lock = d.senha ? "🔒 " : "";
        var souEu = d.jogador1 === currentUser;
        var row = document.createElement("div");
        row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid rgba(255,215,140,0.1)";
        row.innerHTML = "<div><b style='color:#f0e6d3'>"+lock+nome+"</b><br><small style='color:#b8a99a'>Host: "+(d.jogador1||"")+(souEu?" (sua sala)":"")+"</small></div>";
        if (!souEu) {
          var btn = document.createElement("button");
          btn.textContent = "Entrar";
          btn.style.cssText = "padding:8px 14px;border:none;border-radius:10px;background:#4dabf7;color:#111;font-weight:800;cursor:pointer";
          btn.onclick = function(){
            entrarSalaComSenha(it.id, d);
          };
          row.appendChild(btn);
        }
        lista.appendChild(row);
      });
    };
    rtdb.ref("salas").on("value", window._listaUnsub, function(err){
      console.error("Erro ao listar salas:", err);
      setStatus("❌ Erro ao listar salas. Verifique as regras do RTDB.");
    });
  }

  // Criar sala
  function criarSala(){
    if (!currentUser) { alert("Faça login primeiro."); return; }
    var rtdb = getRtdb();
    if (!rtdb) return;
    var nome = (document.getElementById("sala-nome-input")||{}).value || "";
    nome = nome.trim() || (currentUser + " game");
    var senha = (document.getElementById("sala-senha-input")||{}).value || "";
    senha = senha.trim();
    var ref = rtdb.ref("salas").push();
    var id = ref.key;
    setStatus("Criando sala...");
    var dados = {
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
    };
    ref.set(dados).then(function(){
      setStatus("✅ Sala criada! Aguardando oponente...");
      isOnlineMode = true;
      salaAtual = id;
      G.online = true;
      G.salald = id;
      G.p1Name = currentUser;
      G.p2Name = "Aguardando...";
      if (salaUnsubscribe) { try { salaUnsubscribe(); } catch(e){} }
      salaUnsubscribe = function(snap){
        var data = snap.val();
        if (!data) return;
        if (data.status === "em_andamento" && data.jogador2) {
          document.getElementById("sala-overlay").classList.remove("show");
          iniciarJogoOnlineRTDB(id, currentUser, data);
        }
      };
      ref.on("value", salaUnsubscribe);
      escutarSalas(); // atualizar lista
    }).catch(function(err){
      setStatus("❌ Erro ao criar sala: " + err.message);
    });
  }

  // Entrar em sala (com senha)
  function entrarSalaComSenha(salaId, data){
    if (!currentUser) { alert("Faça login primeiro."); return; }
    if (data.senha && data.senha !== "") {
      var senha = prompt("Senha da sala:");
      if (senha === null) return;
      if (senha !== data.senha) { alert("Senha incorreta."); return; }
    }
    var rtdb = getRtdb();
    if (!rtdb) return;
    var ref = rtdb.ref("salas/" + salaId);
    ref.update({ jogador2: currentUser, skinJogador2: getStats().equippedSkin || 'classic', status: "em_andamento" })
      .then(function(){ return ref.once("value"); })
      .then(function(snap){
        var novoData = snap.val();
        document.getElementById("sala-overlay").classList.remove("show");
        iniciarJogoOnlineRTDB(salaId, currentUser, novoData);
      })
      .catch(function(err){
        alert("Erro ao entrar: " + err.message);
      });
  }

  // Iniciar jogo online RTDB
  function iniciarJogoOnlineRTDB(salaId, nomeJogador, data){
    isOnlineMode = true;
    salaAtual = salaId;
    G.online = true;
    G.salald = salaId;
    G.vsIA = false;
    G.over = false;
    G.mode = "move";
    G.sel = null;
    G.moves = [];
    gameActive = true;
    matchFinished = false;

    // Aplicar dados iniciais
    G.p1Name = data.jogador1 || nomeJogador;
    G.p2Name = data.jogador2 || "Player 2";
    G.skinP1 = data.skinJogador1 || 'classic';
    G.skinP2 = data.skinJogador2 || 'classic';
    G.pos = data.posicoes || [[8,4],[0,4]];
    G.walls = data.paredesRestantes || [10,10];
    G.turn = typeof data.turno === "number" ? data.turno : 0;
    // Paredes
    G.pH = []; G.pV = []; G.wallOwnerH = []; G.wallOwnerV = [];
    (data.paredesH||[]).forEach(function(w){
      if (Array.isArray(w)) { G.pH.push(w); G.wallOwnerH.push(0); }
      else if (w) { G.pH.push([w.r,w.c]); G.wallOwnerH.push(w.dono||0); }
    });
    (data.paredesV||[]).forEach(function(w){
      if (Array.isArray(w)) { G.pV.push(w); G.wallOwnerV.push(0); }
      else if (w) { G.pV.push([w.r,w.c]); G.wallOwnerV.push(w.dono||0); }
    });

    // Atualizar UI
    document.getElementById("p1-nome").textContent = G.p1Name;
    document.getElementById("nomeJ2").textContent = G.p2Name;
    document.getElementById("placar-p1").textContent = G.p1Name;
    document.getElementById("placar-p2").textContent = G.p2Name;
    var p2c = document.getElementById("p2-controls");
    if (p2c) p2c.style.display = "none";
    document.getElementById("game-screen").classList.remove("p2-active","modo-2p");
    document.getElementById("hud-wrapper").classList.remove("rotated");
    showScreen("game-screen");

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if (typeof resize === "function") resize();
        if (typeof updateWallIndicators === "function") updateWallIndicators();
        if (typeof syncBtn === "function") syncBtn();
        if (typeof draw === "function") draw();
      });
    });

    // Listener para mudanças
    var rtdb = getRtdb();
    if (!rtdb) return;
    var ref = rtdb.ref("salas/" + salaId);
    if (salaUnsubscribe) { try { salaUnsubscribe(); } catch(e){} }
    var handler = function(snap){
      var novo = snap.val();
      if (!novo) return;
      if (novo.status === "finalizada") {
        if (!G.over) {
          G.over = true;
          var vencedor = novo.vencedor === G.p1Name ? 0 : 1;
          // Atualizar stats do usuário local
          if (currentUser) {
            var stats = getStats();
            stats.games++;
            var euVen = (vencedor === 0 && currentUser === G.p1Name) || (vencedor === 1 && currentUser === G.p2Name);
            var pts = 0, xpGanho = 0;
            if (euVen) {
              stats.wins++;
              stats.streak++;
              stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
              pts = calcularPontosPartida(vencedor, vencedor, 0, 0, config.rounds, currentTime, config.time, stats.streak);
              xpGanho = calcularXP(vencedor, vencedor, 0, 0, currentTime, config.time, stats.streak);
              stats = aplicarXP(stats, xpGanho);
              stats.rankPoints += pts;
              stats.rankPoints = Math.max(0, stats.rankPoints);
              stats.maxRankPoints = Math.max(stats.maxRankPoints, stats.rankPoints);
              stats.sumPointsVictories = (stats.sumPointsVictories || 0) + pts;
            } else {
              stats.losses = (stats.losses || 0) + 1;
              stats.streak = 0;
              pts = calcularPontosPartida(1 - vencedor, vencedor, 0, 0, config.rounds, currentTime, config.time, stats.streak);
              stats.rankPoints += pts;
              stats.rankPoints = Math.max(0, stats.rankPoints);
            }
            stats.history.unshift({date: Date.now(), mode: 'Online', result: euVen ? 'Vitória' : 'Derrota', points: pts, walls: 0, moves: 0, rounds: config.rounds, time: config.time, xp: xpGanho});
            saveStats(stats);
            if (typeof updateRankDisplay === "function") updateRankDisplay(currentUser);
          }
          if (typeof showWinOverlay === "function")
            showWinOverlay("◈ " + (novo.vencedor||"") + " venceu!", vencedor);
        }
        return;
      }
      // Atualizar estado
      G.skinP1 = novo.skinJogador1 || 'classic';
      G.skinP2 = novo.skinJogador2 || 'classic';
      if (typeof aplicarEstadoSala === "function") aplicarEstadoSala(novo);
      else {
        G.pos = novo.posicoes || G.pos;
        G.walls = novo.paredesRestantes || G.walls;
        G.turn = typeof novo.turno === "number" ? novo.turno : G.turn;
        G.p1Name = novo.jogador1 || G.p1Name;
        G.p2Name = novo.jogador2 || G.p2Name;
      }
      if (typeof updateWallIndicators === "function") updateWallIndicators();
      if (typeof syncBtn === "function") syncBtn();
      if (typeof draw === "function") draw();
    };
    ref.on("value", handler);
    salaUnsubscribe = function(){ ref.off("value", handler); };
  }

  // Enviar jogada (função global)
  window.enviarJogadaOnline = function(){
    if (!salaAtual || !isOnlineMode) return;
    var rtdb = getRtdb();
    if (!rtdb) return;
    var paredesH = [], paredesV = [];
    for (var i=0; i<G.pH.length; i++) paredesH.push({r:G.pH[i][0], c:G.pH[i][1], dono:G.wallOwnerH[i]||0});
    for (var j=0; j<G.pV.length; j++) paredesV.push({r:G.pV[j][0], c:G.pV[j][1], dono:G.wallOwnerV[j]||0});
    var upd = {
      posicoes: [[G.pos[0][0],G.pos[0][1]],[G.pos[1][0],G.pos[1][1]]],
      paredesH: paredesH,
      paredesV: paredesV,
      paredesRestantes: [G.walls[0],G.walls[1]],
      turno: G.turn
    };
    if (G.over || G.pos[0][0]===0 || G.pos[1][0]===8) {
      upd.status = "finalizada";
      upd.vencedor = G.pos[0][0]===0 ? G.p1Name : G.p2Name;
    }
    rtdb.ref("salas/"+salaAtual).update(upd);
  };

  // Abrir overlay online
  function abrirOnline(){
    if (!currentUser) { alert("Faça login primeiro."); return; }
    document.getElementById("sala-overlay").classList.add("show");
    setStatus("Carregando salas...");
    escutarSalas();
  }

  // Fechar overlay
  function fecharOnline(){
    document.getElementById("sala-overlay").classList.remove("show");
    // limpar listener de lista se necessário
    if (window._listaUnsub) {
      try { firebase.database().ref("salas").off("value", window._listaUnsub); } catch(e){}
      window._listaUnsub = null;
    }
  }

  // Vínculo dos botões
  document.addEventListener('DOMContentLoaded', function() {
    var btnOnline = document.getElementById('btn-online');
    if (btnOnline) btnOnline.addEventListener('click', abrirOnline);

    var btnCriar = document.getElementById('btn-criar-sala');
    if (btnCriar) btnCriar.addEventListener('click', criarSala);

    var btnFechar1 = document.getElementById('btn-close-sala');
    if (btnFechar1) btnFechar1.addEventListener('click', fecharOnline);

    var btnFechar2 = document.getElementById('sala-close');
    if (btnFechar2) btnFechar2.addEventListener('click', fecharOnline);

    // Fechar ao clicar fora do card
    var overlaySala = document.getElementById('sala-overlay');
    if (overlaySala) {
      overlaySala.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) fecharOnline();
      });
    }
  });

  // Tratar desconexão
  window.addEventListener('beforeunload', function() {
    if (salaAtual && isOnlineMode) {
      try {
        firebase.database().ref("salas/" + salaAtual).update({ status: "finalizada", vencedor: "Partida encerrada" });
      } catch(e) {}
    }
  });

  console.log("Sistema RTDB de salas pronto.");
})();
</script>'''

# Inserir o novo script antes do </body>
conteudo = conteudo.replace('</body>', novo_rtdb + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Sistema online reescrito com sucesso!")
