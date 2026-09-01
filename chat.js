// ============================================================
// CHAT ONLINE com FIRESTORE (tempo real)
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

function openChat() {
  var overlay = document.getElementById('chat-overlay');
  if (overlay) overlay.classList.add('show');
  carregarMensagens();
}

function closeChat() {
  var overlay = document.getElementById('chat-overlay');
  if (overlay) overlay.classList.remove('show');
  if (window._unsubscribeChat) {
    window._unsubscribeChat();
    window._unsubscribeChat = null;
  }
}

function sendChatMessage() {
  var input = document.getElementById('chat-input');
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;
  var user = currentUser || 'Anônimo';
  db.collection('mensagens').add({
    user: user,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    input.value = '';
  }).catch(function(err) {
    alert('Erro: ' + err.message);
  });
}

function carregarMensagens() {
  var container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">Carregando...</div>';
  if (window._unsubscribeChat) {
    window._unsubscribeChat();
    window._unsubscribeChat = null;
  }
  var query = db.collection('mensagens').orderBy('timestamp', 'asc').limit(50);
  window._unsubscribeChat = query.onSnapshot(function(snapshot) {
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">Nenhuma mensagem ainda.</div>';
      return;
    }
    snapshot.forEach(function(doc) {
      var data = doc.data();
      var div = document.createElement('div');
      div.className = 'msg';
      var date = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : 'Agora';
      div.innerHTML = '<span class="user">' + escapeHTML(data.user) + '</span><span class="time">' + date + '</span><br>' + escapeHTML(data.text);
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  }, function(error) {
    container.innerHTML = '<div style="color:#e94560;text-align:center;padding:20px;">Erro: ' + error.message + '</div>';
  });
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    return m;
  });
}

// Eventos (serão anexados pelo DOMContentLoaded no index.html)
console.log('✅ chat.js carregado');
