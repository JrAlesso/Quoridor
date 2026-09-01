// ============================================================
// JOGAR ONLINE com FIRESTORE (arquivo separado)
// ============================================================

var firebaseConfig = {
  apiKey: "AIzaSyBJJZtzkaUoP0swjNrN6Rt0Qm-trzsw4lM",
  authDomain: "quoridor-online-2823d.firebaseapp.com",
  databaseURL: "https://quoridor-online-2823d-default-rtdb.firebaseio.com",
  projectId: "quoridor-online-2823d",
  storageBucket: "quoridor-online-2823d.firebasestorage.app",
  messagingSenderId: "652289533045",
  appId: "1:652289533045:web:043558b29f02c51256443c"
};

if (typeof firebase !== 'undefined' && (!firebase.apps || !firebase.apps.length)) {
  firebase.initializeApp(firebaseConfig);
}
var db = firebase.firestore();

function hashSenha(senha) {
  var hash = 0;
  for (var i = 0; i < senha.length; i++) {
    var char = senha.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function openOnline() {
  var overlay = document.getElementById('online-overlay');
  if (overlay) overlay.classList.add('show');
  listarSalas();
}

function closeOnline() {
  var overlay = document.getElementById('online-overlay');
  if (overlay) overlay.classList.remove('show');
  if (window._unsubscribeSalas) {
    window._unsubscribeSalas();
    window._unsubscribeSalas = null;
  }
}

document.querySelectorAll('.online-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.online-tab').forEach(function(t) {
      t.classList.remove('active');
    });
    this.classList.add('active');
    var target = this.dataset.tab;
    document.querySelectorAll('.online-panel').forEach(function(p) {
      p.style.display = 'none';
    });
    document.getElementById('panel-' + target).style.display = 'flex';
    if (target === 'listar') listarSalas();
  });
});

document.getElementById('btn-criar-sala').addEventListener('click', async function() {
  var nomeInput = document.getElementById('sala-nome');
  var senhaInput = document.getElementById('sala-senha');
  var infoDiv = document.getElementById('sala-criada-info');
  var nome = nomeInput ? nomeInput.value.trim().slice(0, 30) : '';
  var senha = senhaInput ? senhaInput.value.trim() : '';
  if (!nome) {
    alert('Digite um nome para a sala (máx 30 caracteres).');
    return;
  }
  var dono = currentUser || 'Anônimo';
  var senhaHash = senha ? hashSenha(senha) : '';
  var salaData = {
    nome: nome,
    senhaHash: senhaHash,
    dono: dono,
    jogador2: '',
    criadaEm: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'aberta'
  };
  try {
    var docRef = await db.collection('salas').add(salaData);
    if (infoDiv) {
      infoDiv.style.display = 'block';
      infoDiv.textContent = '✅ Sala "' + nome + '" criada! Aguardando oponente...';
    }
    if (nomeInput) nomeInput.value = '';
    if (senhaInput) senhaInput.value = '';
    var unsubscribe = db.collection('salas').doc(docRef.id).onSnapshot(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.jogador2 && data.jogador2 !== '') {
          if (infoDiv) infoDiv.textContent = '🎮 Oponente entrou! Iniciando partida...';
          iniciarPartidaOnline(data.dono, data.jogador2, docRef.id);
          unsubscribe();
        }
      }
    });
  } catch (err) {
    alert('Erro ao criar sala: ' + err.message);
  }
});

function listarSalas() {
  var container = document.getElementById('lista-salas');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">Carregando...</div>';
  if (window._unsubscribeSalas) {
    window._unsubscribeSalas();
    window._unsubscribeSalas = null;
  }
  var query = db.collection('salas')
    .where('status', '==', 'aberta')
    .where('jogador2', '==', '')
    .orderBy('criadaEm', 'desc');
  window._unsubscribeSalas = query.onSnapshot(function(snapshot) {
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">Nenhuma sala disponível. Crie uma!</div>';
      return;
    }
    snapshot.forEach(function(doc) {
      var s = doc.data();
      var id = doc.id;
      var div = document.createElement('div');
      div.className = 'sala-item';
      var senhaIcon = s.senhaHash ? '🔒' : '🔓';
      div.innerHTML =
        '<div class="sala-info">' +
          '<span class="sala-nome">' + s.nome + '</span> ' +
          '<span class="sala-senha">' + senhaIcon + '</span>' +
          '<div class="sala-dono">👤 ' + s.dono + '</div>' +
        '</div>' +
        '<button class="btn-entrar" data-id="' + id + '" data-senha="' + (s.senhaHash || '') + '">Entrar</button>';
      container.appendChild(div);
    });
    container.querySelectorAll('.btn-entrar').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var salaId = this.dataset.id;
        var senhaHash = this.dataset.senha;
        if (senhaHash) {
          var inputSenha = prompt('Digite a senha da sala:');
          if (!inputSenha) { alert('Senha não fornecida.'); return; }
          if (hashSenha(inputSenha) !== senhaHash) {
            alert('Senha incorreta!');
            return;
          }
        }
        entrarSala(salaId);
      });
    });
  }, function(error) {
    container.innerHTML = '<div style="color:#e94560;text-align:center;padding:20px;">Erro ao carregar salas: ' + error.message + '</div>';
  });
}

async function entrarSala(salaId) {
  var salaRef = db.collection('salas').doc(salaId);
  try {
    var result = await db.runTransaction(async function(transaction) {
      var doc = await transaction.get(salaRef);
      if (!doc.exists) {
        throw new Error('Sala não existe.');
      }
      var data = doc.data();
      if (data.status !== 'aberta' || data.jogador2) {
        throw new Error('Esta sala não está mais disponível.');
      }
      var jogador2 = currentUser || 'Anônimo';
      if (jogador2 === data.dono) {
        throw new Error('Você não pode entrar na sua própria sala.');
      }
      transaction.update(salaRef, {
        jogador2: jogador2,
        status: 'fechada'
      });
      return { dono: data.dono, nome: data.nome, jogador2: jogador2 };
    });
    alert('Você entrou na sala "' + result.nome + '"! Iniciando partida...');
    iniciarPartidaOnline(result.dono, result.jogador2, salaId);
  } catch (err) {
    alert('Erro ao entrar na sala: ' + err.message);
  }
}

function iniciarPartidaOnline(jogador1, jogador2, salaId) {
  closeOnline();
  G.vsIA = false;
  G.p1Name = jogador1;
  G.p2Name = jogador2;
  document.getElementById('p1-nome').textContent = G.p1Name;
  document.getElementById('nomeJ2').textContent = G.p2Name;
  document.getElementById('placar-p1').textContent = G.p1Name;
  document.getElementById('placar-p2').textContent = G.p2Name;
  showScreen('game-screen');
  document.getElementById('p2-controls').style.display = 'flex';
  document.getElementById('game-screen').classList.add('modo-2p');
  scores = [0, 0];
  currentRound = 1;
  gameActive = true;
  matchFinished = false;
  seriesStats = { userWalls: 0, userMoves: 0 };
  resetGame();
  atualizarPlacar();
  document.getElementById('rodada-info').textContent = 'Rodada 1 de ' + config.rounds;
  db.collection('salas').doc(salaId).delete().catch(function(e) {});
}

document.getElementById('btn-online').addEventListener('click', openOnline);
document.getElementById('online-close').addEventListener('click', closeOnline);
document.getElementById('btn-close-online').addEventListener('click', closeOnline);
document.getElementById('online-overlay').addEventListener('click', function(e) {
  if (e.target === e.currentTarget) closeOnline();
});

console.log('✅ Jogar Online inicializado!');
