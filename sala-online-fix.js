    // ============================================================
    // SALA ONLINE (FIREBASE) - VERSÃO CORRIGIDA
    // ============================================================
    var salaAtual = null;
    var salaUnsubscribe = null;
    var isOnlineMode = false;
    var filaUnsubscribe = null;
    var jogadorNaFila = false;
    var listaSalasUnsubscribe = null;

    function euSouJogadorDaVez() {
      if (!isOnlineMode) return true;
      if (G.turn === 0) return currentUser === G.p1Name;
      return currentUser === G.p2Name;
    }

    function limparOnline() {
      if (salaUnsubscribe) { try { salaUnsubscribe(); } catch(e) {} salaUnsubscribe = null; }
      if (filaUnsubscribe) { try { filaUnsubscribe(); } catch(e) {} filaUnsubscribe = null; }
      if (listaSalasUnsubscribe) { try { listaSalasUnsubscribe(); } catch(e) {} listaSalasUnsubscribe = null; }
      jogadorNaFila = false;
      isOnlineMode = false;
      salaAtual = null;
      if (G) { G.online = false; G.salald = null; }
    }

    function paredesFirestoreParaLocal(paredesH, paredesV) {
      var pH = [], pV = [], owH = [], owV = [];
      (paredesH || []).forEach(function(w) {
        if (Array.isArray(w)) { pH.push([w[0], w[1]]); owH.push(0); }
        else if (w && typeof w.r === 'number') { pH.push([w.r, w.c]); owH.push(typeof w.dono === 'number' ? w.dono : 0); }
      });
      (paredesV || []).forEach(function(w) {
        if (Array.isArray(w)) { pV.push([w[0], w[1]]); owV.push(0); }
        else if (w && typeof w.r === 'number') { pV.push([w.r, w.c]); owV.push(typeof w.dono === 'number' ? w.dono : 0); }
      });
      return { pH: pH, pV: pV, owH: owH, owV: owV };
    }

    function paredesLocalParaFirestore() {
      var paredesH = [], paredesV = [];
      for (var i = 0; i < G.pH.length; i++) {
        paredesH.push({ r: G.pH[i][0], c: G.pH[i][1], dono: G.wallOwnerH[i] != null ? G.wallOwnerH[i] : 0 });
      }
      for (var j = 0; j < G.pV.length; j++) {
        paredesV.push({ r: G.pV[j][0], c: G.pV[j][1], dono: G.wallOwnerV[j] != null ? G.wallOwnerV[j] : 0 });
      }
      return { paredesH: paredesH, paredesV: paredesV };
    }

    function aplicarEstadoSala(data) {
      if (!data) return;
      G.p1Name = data.jogador1 || G.p1Name;
      G.p2Name = data.jogador2 || G.p2Name || 'Aguardando...';
      if (data.posicoes && data.posicoes.length === 2) {
        G.pos = [[data.posicoes[0][0], data.posicoes[0][1]], [data.posicoes[1][0], data.posicoes[1][1]]];
      }
      var pw = paredesFirestoreParaLocal(data.paredesH, data.paredesV);
      G.pH = pw.pH; G.pV = pw.pV; G.wallOwnerH = pw.owH; G.wallOwnerV = pw.owV;
      G.walls = data.paredesRestantes ? data.paredesRestantes.slice() : [10,10];
      G.turn = typeof data.turno === 'number' ? data.turno : 0;
      G.vsIA = false;
      G.online = true;
      document.getElementById('p1-nome').textContent = G.p1Name;
      document.getElementById('nomeJ2').textContent = G.p2Name;
      document.getElementById('placar-p1').textContent = G.p1Name;
      document.getElementById('placar-p2').textContent = G.p2Name;
      var p2c = document.getElementById('p2-controls');
      if (p2c) p2c.style.display = 'none';
      document.getElementById('game-screen').classList.remove('p2-active', 'modo-2p');
      document.getElementById('hud-wrapper').classList.remove('rotated');
      if (typeof updateWallIndicators === 'function') updateWallIndicators();
      if (typeof syncBtn === 'function') syncBtn();
      if (typeof draw === 'function') draw();
      if (typeof st === 'function') {
        if (G.over) return;
        if (euSouJogadorDaVez()) st('Sua vez: ' + (G.turn === 0 ? G.p1Name : G.p2Name));
        else st('Aguardando oponente...');
      }
    }

    function criarSala() {
      var nomeJogador = currentUser || 'Jogador';
      var senha = document.getElementById('sala-senha-input').value.trim();
      
      if (!nomeJogador) {
        document.getElementById('sala-status').textContent = '❌ Jogador não autenticado';
        return;
      }

      var salaRef = db.collection('salas').doc();
      var salald = salaRef.id;
      var dados = {
        jogador1: nomeJogador,
        jogador2: '',
        status: 'esperando',
        turno: 0,
        posicoes: [[8,4],[0,4]],
        paredesH: [],
        paredesV: [],
        paredesRestantes: [10,10],
        vencedor: '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        senha: senha || ''
      };

      salaRef.set(dados).then(function() {
        document.getElementById('sala-status').innerHTML = '✓ Sala criada!<br><small style="color:#d4a373; font-weight:bold;">ID: ' + salald + '</small><br><small>Aguardando oponente...</small>';
        isOnlineMode = true;
        salaAtual = salald;
        G.online = true;
        G.salald = salald;
        G.p1Name = nomeJogador;
        G.p2Name = 'Aguardando...';
        
        if (salaUnsubscribe) salaUnsubscribe();
        salaUnsubscribe = salaRef.onSnapshot(function(doc) {
          if (!doc.exists) return;
          var data = doc.data();
          if (data.status === 'em_andamento' && data.jogador2) {
            document.getElementById('sala-overlay').classList.remove('show');
            iniciarJogoOnline(salald, nomeJogador, data);
          } else if (data.status === 'esperando') {
            document.getElementById('sala-status').innerHTML = '✓ Sala criada!<br><small style="color:#d4a373; font-weight:bold;">ID: ' + salald + '</small><br><small>Aguardando oponente...</small>';
          }
        });
      }).catch(function(err) {
        document.getElementById('sala-status').textContent = '❌ Erro: ' + err.message;
      });
    }

    function entrarSala(salald) {
      var nomeJogador = currentUser || 'Jogador';
      var senhaFornecida = document.getElementById('sala-senha-input').value.trim();
      
      if (!salald || salald.trim() === '') {
        document.getElementById('sala-status').textContent = '❌ Digite o ID da sala';
        return;
      }

      var salaRef = db.collection('salas').doc(salald);
      salaRef.get().then(function(doc) {
        if (!doc.exists) {
          document.getElementById('sala-status').textContent = '❌ Sala não encontrada';
          return;
        }

        var data = doc.data();

        if (data.status === 'finalizada') {
          document.getElementById('sala-status').textContent = '❌ Sala já finalizada';
          return;
        }

        if (data.senha && data.senha !== '') {
          if (senhaFornecida !== data.senha) {
            document.getElementById('sala-status').textContent = '❌ Senha incorreta';
            return;
          }
        }

        if (data.jogador1 === nomeJogador) {
          document.getElementById('sala-overlay').classList.remove('show');
          iniciarJogoOnline(salald, nomeJogador, data);
          return;
        }

        if (data.jogador2 && data.jogador2 !== '') {
          document.getElementById('sala-status').textContent = '❌ Sala cheia';
          return;
        }

        salaRef.update({ jogador2: nomeJogador, status: 'em_andamento' })
          .then(function() { return salaRef.get(); })
          .then(function(doc2) {
            document.getElementById('sala-overlay').classList.remove('show');
            iniciarJogoOnline(salald, nomeJogador, doc2.data());
          })
          .catch(function(err) {
            document.getElementById('sala-status').textContent = '❌ Erro: ' + err.message;
          });
      }).catch(function(err) {
        document.getElementById('sala-status').textContent = '❌ Erro ao buscar: ' + err.message;
      });
    }

    function iniciarJogoOnline(salald, nomeJogador, data) {
      isOnlineMode = true;
      salaAtual = salald;
      G.online = true;
      G.salald = salald;
      G.vsIA = false;
      G.over = false;
      G.mode = 'move';
      G.sel = null;
      G.moves = [];
      gameActive = true;
      matchFinished = false;
      aplicarEstadoSala(data);
      showScreen('game-screen');
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (typeof resize === 'function') resize();
          aplicarEstadoSala(data);
          if (euSouJogadorDaVez() && typeof selectPawn === 'function') {
            selectPawn(G.pos[G.turn][0], G.pos[G.turn][1]);
          }
        });
      });
      if (salaUnsubscribe) salaUnsubscribe();
      salaUnsubscribe = db.collection('salas').doc(salald).onSnapshot(function(doc) {
        if (!doc.exists) return;
        var novoData = doc.data();
        if (novoData.status === 'finalizada') {
          if (!G.over) {
            G.over = true;
            var vencedor = novoData.vencedor === G.p1Name ? 0 : (novoData.vencedor === G.p2Name ? 1 : -1);
            if (vencedor !== -1 && typeof showWinOverlay === 'function') {
              showWinOverlay('🏆 ' + novoData.vencedor + ' venceu!', vencedor);
            }
          }
          return;
        }
        aplicarEstadoSala(novoData);
        if (euSouJogadorDaVez() && !G.over && typeof selectPawn === 'function') {
          selectPawn(G.pos[G.turn][0], G.pos[G.turn][1]);
        }
      });
    }

    function enviarJogadaOnline(jogada) {
      if (!salaAtual || !isOnlineMode) return;
      if (!euSouJogadorDaVez()) return;
      var salaRef = db.collection('salas').doc(salaAtual);
      var paredes = paredesLocalParaFirestore();
      var posicoes = [[G.pos[0][0], G.pos[0][1]], [G.pos[1][0], G.pos[1][1]]];
      var paredesRestantes = [G.walls[0], G.walls[1]];
      var turno = G.turn;
      var update = {
        posicoes: posicoes,
        paredesH: paredes.paredesH,
        paredesV: paredes.paredesV,
        paredesRestantes: paredesRestantes,
        turno: turno
      };
      if (G.over || (G.pos[0][0] === 0) || (G.pos[1][0] === 8)) {
        update.status = 'finalizada';
        update.vencedor = (G.pos[0][0] === 0) ? G.p1Name : G.p2Name;
      }
      salaRef.update(update).catch(function(err) {
        console.error('Erro ao enviar jogada:', err);
        if (typeof st === 'function') st('Erro de sincronização. Tente de novo.');
      });
    }

    function listarSalasAbertas() {
      if (listaSalasUnsubscribe) { try { listaSalasUnsubscribe(); } catch(e) {} }
      document.getElementById('sala-status').textContent = '⏳ Buscando salas...';
      listaSalasUnsubscribe = db.collection('salas')
        .where('status', '==', 'esperando')
        .onSnapshot(function(querySnapshot) {
          var lista = document.getElementById('sala-lista');
          if (!lista) return;
          lista.innerHTML = '';
          if (querySnapshot.empty) {
            document.getElementById('sala-status').textContent = 'Nenhuma sala aberta no momento';
            lista.innerHTML = '<div class="history-empty">Crie uma ou aguarde outros criarem...</div>';
            return;
          }
          document.getElementById('sala-status').textContent = querySnapshot.size + ' sala(s) encontrada(s)';
          var items = [];
          querySnapshot.forEach(function(doc) { items.push({ id: doc.id, data: doc.data() }); });
          items.sort(function(a,b) {
            var ta = a.data.timestamp && a.data.timestamp.toMillis ? a.data.timestamp.toMillis() : 0;
            var tb = b.data.timestamp && b.data.timestamp.toMillis ? b.data.timestamp.toMillis() : 0;
            return tb - ta;
          });
          items.forEach(function(item) {
            var data = item.data;
            var el = document.createElement('div');
            el.className = 'sala-item';
            var cadeado = data.senha && data.senha !== '' ? '🔒' : '🔓';
            el.innerHTML = '<span class="sala-nome">' + (data.jogador1 || 'Sala') + ' ' + cadeado + '</span><span class="sala-jogadores">1/2</span><button class="sala-btn" data-id="' + item.id + '">Entrar</button>';
            lista.appendChild(el);
          });
          lista.querySelectorAll('.sala-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              document.getElementById('sala-id-input').value = this.getAttribute('data-id');
              entrarSala(this.getAttribute('data-id'));
            });
          });
        }, function(err) {
          document.getElementById('sala-status').textContent = '❌ Erro: ' + err.message;
        });
    }

    // ============================================================
    // EVENT LISTENERS - SALA ONLINE
    // ============================================================
    function setupSalaEventListeners() {
      var btnCriarSala = document.getElementById('btn-criar-sala');
      var btnListarSalas = document.getElementById('btn-listar-salas');
      var btnEntrarSala = document.getElementById('btn-entrar-sala');
      var salaClose = document.getElementById('sala-close');

      if (btnCriarSala) {
        btnCriarSala.removeEventListener('click', criarSala);
        btnCriarSala.addEventListener('click', criarSala);
      }

      if (btnListarSalas) {
        btnListarSalas.removeEventListener('click', listarSalasAbertas);
        btnListarSalas.addEventListener('click', listarSalasAbertas);
      }

      if (btnEntrarSala) {
        btnEntrarSala.removeEventListener('click', function() {
          var salaId = document.getElementById('sala-id-input').value.trim();
          entrarSala(salaId);
        });
        btnEntrarSala.addEventListener('click', function() {
          var salaId = document.getElementById('sala-id-input').value.trim();
          entrarSala(salaId);
        });
      }

      if (salaClose) {
        salaClose.removeEventListener('click', function() {
          document.getElementById('sala-overlay').classList.remove('show');
          limparOnline();
          document.getElementById('sala-status').textContent = 'Escolha uma opção';
          document.getElementById('sala-lista').innerHTML = '';
          document.getElementById('sala-id-input').value = '';
          document.getElementById('sala-senha-input').value = '';
          if (listaSalasUnsubscribe) { listaSalasUnsubscribe(); listaSalasUnsubscribe = null; }
        });
        salaClose.addEventListener('click', function() {
          document.getElementById('sala-overlay').classList.remove('show');
          limparOnline();
          document.getElementById('sala-status').textContent = 'Escolha uma opção';
          document.getElementById('sala-lista').innerHTML = '';
          document.getElementById('sala-id-input').value = '';
          document.getElementById('sala-senha-input').value = '';
          if (listaSalasUnsubscribe) { listaSalasUnsubscribe(); listaSalasUnsubscribe = null; }
        });
      }
    }
