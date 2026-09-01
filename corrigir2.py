import re

with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1) hashPassword -> SHA-256
conteudo = conteudo.replace('''function hashPassword(pwd) {
      var hash = 0;
      for (var i = 0; i < pwd.length; i++) {
        var char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'h' + hash.toString(36);
    }''', '''async function hashPassword(pwd) {
      const msgBuffer = new TextEncoder().encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }''')

# 2) createUser e loginUser async
conteudo = conteudo.replace('''function createUser(username, password) {
      var accounts = getAccounts();
      if (accounts[username]) return false;
      accounts[username] = {
        passwordHash: hashPassword(password),''', '''async function createUser(username, password) {
      var accounts = getAccounts();
      if (accounts[username]) return false;
      accounts[username] = {
        passwordHash: await hashPassword(password),''')

conteudo = conteudo.replace('''function loginUser(username, password) {
      var accounts = getAccounts();
      if (!accounts[username]) return false;
      if (accounts[username].passwordHash === hashPassword(password)) {''', '''async function loginUser(username, password) {
      var accounts = getAccounts();
      if (!accounts[username]) return false;
      if (accounts[username].passwordHash === await hashPassword(password)) {''')

# 3) listener do login async/await
conteudo = conteudo.replace('''loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var username = document.getElementById('login-username').value.trim();
      var password = document.getElementById('login-password').value;
      var confirm = document.getElementById('login-confirm').value;
      if (!username || !password) { loginError.textContent = 'Preencha todos os campos'; return; }
      if (isLoginMode) {
        if (loginUser(username, password)) { loginError.textContent = ''; goToModeScreen(username); }
        else loginError.textContent = 'Usuário ou senha inválidos';
      } else {
        if (password !== confirm) { loginError.textContent = 'As senhas não coincidem'; return; }
        if (createUser(username, password)) { loginUser(username, password); loginError.textContent = ''; goToModeScreen(username); }
        else loginError.textContent = 'Usuário já existe';
      }
    });''', '''loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var username = document.getElementById('login-username').value.trim();
      var password = document.getElementById('login-password').value;
      var confirm = document.getElementById('login-confirm').value;
      if (!username || !password) { loginError.textContent = 'Preencha todos os campos'; return; }
      if (isLoginMode) {
        if (await loginUser(username, password)) { loginError.textContent = ''; goToModeScreen(username); }
        else loginError.textContent = 'Usuário ou senha inválidos';
      } else {
        if (password !== confirm) { loginError.textContent = 'As senhas não coincidem'; return; }
        if (await createUser(username, password)) { await loginUser(username, password); loginError.textContent = ''; goToModeScreen(username); }
        else loginError.textContent = 'Usuário já existe';
      }
    });''')

# 4) Remover linha sala-id-input (inexistente)
conteudo = conteudo.replace("document.getElementById('sala-id-input').value = '';\n", "")

# 5) Atualizar stats no handler de finalização RTDB
conteudo = conteudo.replace('''      if (novo.status === "finalizada") {
        if (!G.over) {
          G.over = true;
          if (typeof showWinOverlay==="function")
            showWinOverlay("◈ " + (novo.vencedor||"") + " venceu!", novo.vencedor===G.p1Name?0:1);
        }
        return;
      }''', '''      if (novo.status === "finalizada") {
        if (!G.over) {
          G.over = true;
          var vencedor = novo.vencedor === G.p1Name ? 0 : 1;
          // Atualizar estatísticas do usuário local
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
          if (typeof showWinOverlay==="function")
            showWinOverlay("◈ " + (novo.vencedor||"") + " venceu!", vencedor);
        }
        return;
      }''')

# 6) Loop de animação otimizado (sem quebrar)
conteudo = conteudo.replace('''      function loop() {
      var needDraw = G.over || G.hoverNode || G.iaThinking;
      if (!needDraw && currentUser) {
        var eq = getStats().equippedSkin;
        var sk = SKINS.find(function(s){ return s.id === eq; });
        if (sk && (sk.raridade === 'lendaria' || sk.raridade === 'rara')) needDraw = true;
      }
      if (needDraw) draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);''', '''      var needsRender = true;
      function loop() {
        if (needsRender) {
          draw();
          needsRender = false;
        }
        // Re-render lento para skins lendárias/raras (a cada 100ms)
        if (currentUser) {
          var eq = getStats().equippedSkin;
          var sk = SKINS.find(function(s){ return s.id === eq; });
          if (sk && (sk.raridade === 'lendaria' || sk.raridade === 'rara')) {
            setTimeout(function(){ needsRender = true; }, 100);
          }
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);''')

# 7) beforeunload para encerrar sala
conteudo += '''

<script>
window.addEventListener('beforeunload', function() {
  if (salaAtual && isOnlineMode) {
    try {
      firebase.database().ref("salas/" + salaAtual).update({ status: "finalizada", vencedor: "Partida encerrada" });
    } catch(e) {}
  }
});
</script>'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Correções aplicadas com sucesso (sem remover Firestore)!")
