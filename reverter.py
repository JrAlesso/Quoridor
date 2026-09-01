import re

ARQUIVO = "index.html"

with open(ARQUIVO, "r", encoding="utf-8") as f:
    conteudo = f.read()

# 1. Remover script do Firebase Auth do head
conteudo = conteudo.replace('<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>\n', '')

# 2. Restaurar formulário de login original
form_novo = re.compile(r'<form id="login-form">.*?</form>', re.DOTALL)
form_original = '''<form id="login-form"><input type="text" id="login-username" placeholder="Nome de usuário" required><input type="password" id="login-password" placeholder="Senha" required>
    <input type="password" id="login-confirm" placeholder="Confirmar senha"><div id="login-error"></div>
    <button type="submit" class="btn-primary" id="login-btn">CRIAR CONTA</button>
    </form><div class="toggle-link" id="toggle-login">Já tem conta? Faça login</div>'''
conteudo = form_novo.sub(form_original, conteudo, count=1)

# 3. Restaurar variáveis e funções de autenticação originais (localStorage)
# Vamos remover todo o bloco de script de login atual e inserir o original
padrao_script_login = re.compile(r"var loginForm = document\.getElementById\('login-form'\);.*?\);", re.DOTALL)
script_login_original = '''var loginForm = document.getElementById('login-form');
    var loginError = document.getElementById('login-error');
    var toggleLink = document.getElementById('toggle-login');
    var isLoginMode = false;

    toggleLink.addEventListener('click', function() {
      isLoginMode = !isLoginMode;
      document.getElementById('login-btn').textContent = isLoginMode ? 'ENTRAR' : 'CRIAR CONTA';
      toggleLink.textContent = isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login';
      document.getElementById('login-confirm').style.display = isLoginMode ? 'none' : 'block';
    });

    loginForm.addEventListener('submit', function(e) {
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
    });'''
conteudo = padrao_script_login.sub(script_login_original, conteudo, count=1)

# 4. Restaurar funções antigas de contas (createUser, loginUser, getAccounts, saveAccounts, hashPassword)
# Inserir as definições antes de getUserStats
funcoes_contas = '''function getAccounts() {
      try { return JSON.parse(localStorage.getItem('quoridor_accounts_v2')) || {}; } catch(e) { return {}; }
    }
    function saveAccounts(accounts) { localStorage.setItem('quoridor_accounts_v2', JSON.stringify(accounts)); }
    function hashPassword(pwd) {
      var hash = 0;
      for (var i = 0; i < pwd.length; i++) {
        var char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'h' + hash.toString(36);
    }
    function createUser(username, password) {
      var accounts = getAccounts();
      if (accounts[username]) return false;
      accounts[username] = {
        passwordHash: hashPassword(password),
        stats: {
          games: 0, wins: 0, losses: 0, streak: 0, maxStreak: 0,
          level: 1, points: 0, rankPoints: 0, maxRankPoints: 0,
          rank: 'Bronze V', history: [], totalWalls: 0, totalTurns: 0,
          sumPointsVictories: 0, opponentEloSum: 0, opponentCount: 0,
          xp: 0, equippedTitle: 'Recruta', ownedSkins: ['classic'],
          equippedSkin: 'classic', localGames: 0, expertWins: 0, medals: []
        }
      };
      saveAccounts(accounts);
      return true;
    }
    function loginUser(username, password) {
      var accounts = getAccounts();
      if (!accounts[username]) return false;
      if (accounts[username].passwordHash === hashPassword(password)) {
        currentUser = username;
        return true;
      }
      return false;
    }'''
# Inserir antes da definição de getUserStats (que foi restaurada depois)
padrao_getstats = re.compile(r"function getUserStats\(username\) \{", re.DOTALL)
conteudo = padrao_getstats.sub(funcoes_contas + "\n    function getUserStats(username) {", conteudo, count=1)

# 5. Restaurar getUserStats original (substituir a versão modificada)
padrao_getstats_mod = re.compile(r"function getUserStats\(username\) \{.*?\n    \}", re.DOTALL)
getstats_original = '''function getUserStats(username) {
      var accounts = getAccounts();
      return accounts[username] && accounts[username].stats ? accounts[username].stats : {
        games: 0, wins: 0, losses: 0, streak: 0, maxStreak: 0,
        level: 1, points: 0, rankPoints: 0, maxRankPoints: 0,
        rank: 'Bronze V', history: [], totalWalls: 0, totalTurns: 0,
        sumPointsVictories: 0, opponentEloSum: 0, opponentCount: 0,
        xp: 0, equippedTitle: 'Recruta', ownedSkins: ['classic'],
        equippedSkin: 'classic', localGames: 0, expertWins: 0, medals: []
      };
    }'''
conteudo = padrao_getstats_mod.sub(getstats_original, conteudo, count=1)

# 6. Restaurar updateUserStats original
padrao_update = re.compile(r"function updateUserStats\(username, newStats\) \{.*?\n    \}", re.DOTALL)
update_original = '''function updateUserStats(username, newStats) {
      var accounts = getAccounts();
      if (accounts[username]) {
        accounts[username].stats = newStats;
        saveAccounts(accounts);
      }
    }'''
conteudo = padrao_update.sub(update_original, conteudo, count=1)

# 7. Restaurar saveStats original
padrao_savestats = re.compile(r"function saveStats\(stats\) \{.*?\n    \}", re.DOTALL)
savestats_original = '''function saveStats(stats) {
      if (!currentUser) return;
      var userStats = getUserStats(currentUser);
      userStats.games = stats.games;
      userStats.wins = stats.wins;
      userStats.losses = stats.losses;
      userStats.streak = stats.streak;
      userStats.maxStreak = stats.maxStreak;
      userStats.rankPoints = stats.rankPoints;
      userStats.maxRankPoints = stats.maxRankPoints;
      userStats.history = stats.history;
      userStats.totalWalls = stats.totalWalls;
      userStats.totalTurns = stats.totalTurns;
      userStats.sumPointsVictories = stats.sumPointsVictories;
      userStats.opponentEloSum = stats.opponentEloSum;
      userStats.opponentCount = stats.opponentCount;
      userStats.level = stats.level;
      userStats.xp = stats.xp;
      userStats.equippedTitle = stats.equippedTitle || 'Recruta';
      userStats.ownedSkins = stats.ownedSkins || ['classic'];
      userStats.equippedSkin = stats.equippedSkin || 'classic';
      userStats.localGames = stats.localGames || 0;
      userStats.expertWins = stats.expertWins || 0;
      userStats.medals = stats.medals || [];
      updateUserStats(currentUser, userStats);
    }'''
conteudo = padrao_savestats.sub(savestats_original, conteudo, count=1)

# 8. Restaurar goToModeScreen original (sem carregarDadosUsuario/salvarDadosUsuario)
padrao_go = re.compile(r"function goToModeScreen\(username\) \{.*?\n    \}", re.DOTALL)
go_original = '''function goToModeScreen(username) {
      currentUser = username;
      var stats = getUserStats(username);
      stats.points = 100000; // Todos os usuários ganham 100.000 pontos
      updateUserStats(username, stats);
      document.getElementById('user-name').textContent = username;
      document.getElementById('user-avatar').textContent = username[0].toUpperCase();
      document.getElementById('stat-games-mode').textContent = stats.games;
      document.getElementById('stat-wins-mode').textContent = stats.wins;
      document.getElementById('stat-streak').textContent = stats.streak || 0;
      document.getElementById('user-level').textContent = 'Nível ' + (stats.level || 1);
      updateRankDisplay(username);
      showScreen('mode-screen');
    }'''
conteudo = padrao_go.sub(go_original, conteudo, count=1)

# 9. Remover funções carregarDadosUsuario e salvarDadosUsuario (se existirem)
conteudo = re.sub(r"function carregarDadosUsuario\(.*?\n    \}\n\n    function salvarDadosUsuario\(.*?\n    \}\n\n", "", conteudo, flags=re.DOTALL)

# 10. Remover botão Google do HTML (se ainda existir)
conteudo = re.sub(r'<button type="button" class="btn-google".*?</button>', '', conteudo, flags=re.DOTALL)

# 11. Remover listener do botão Google e getRedirectResult
conteudo = re.sub(r"// Botão Google.*?getRedirectResult\(\)\.then\(function\(result\) \{.*?\}\);", "", conteudo, flags=re.DOTALL)

with open(ARQUIVO, "w", encoding="utf-8") as f:
    f.write(conteudo)

print("Reversão concluída! O jogo voltou para a versão anterior (localStorage + username).")
