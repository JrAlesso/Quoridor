with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Se a função openProfile não existir, recria uma versão completa
if 'function openProfile()' not in conteudo:
    nova_funcao = '''
    function openProfile() {
      var stats = getStats();
      var list = document.getElementById('profile-list');
      if (!list) { alert("Elemento profile-list não encontrado"); return; }
      list.innerHTML = '';

      var avgWalls = stats.games > 0 ? (stats.totalWalls / stats.games) : 0;
      var avgTurns = stats.games > 0 ? (stats.totalTurns / stats.games) : 0;
      var avgPtsWin = stats.wins > 0 ? (stats.sumPointsVictories / stats.wins) : 0;
      var winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100) : 0;
      var ratio = stats.losses > 0 ? (stats.wins / stats.losses) : (stats.wins > 0 ? Infinity : 0);
      var ratioStr = ratio === Infinity ? '∞ : 1' : (ratio.toFixed(1) + ' : 1');
      var avgOppElo = stats.opponentCount > 0 ? Math.round(stats.opponentEloSum / stats.opponentCount) : 'N/A';
      var estilo = avgWalls >= 4 ? 'Estrategista' : avgWalls >= 2 ? 'Equilibrado' : (stats.games > 0 ? 'Agressivo' : 'Indefinido');
      var titulo = stats.equippedTitle || 'Recruta';

      var data = [
        { label: 'Título', value: titulo, desc: getTitleRequirement(titulo) },
        { label: 'Patente Atual', value: getRank(stats.rankPoints), desc: 'Sua patente atual no sistema ranqueado.' },
        { label: 'Nível', value: stats.level || 1, desc: 'Nível atual do jogador. Máximo: 100.' },
        { label: 'XP total', value: stats.xp || 0, desc: 'Experiência acumulada.' },
        { label: 'Progresso de nível', value: stats.level >= 100 ? 'MAX' : (stats.xp || 0) + ' / ' + xpParaProximoNivel(stats.level), desc: 'Progresso para o próximo nível.' },
        { label: 'Total de partidas', value: stats.games, desc: 'Veterania. Um número alto já impõe respeito.' },
        { label: 'Total de vitórias', value: stats.wins, desc: 'Volume de sucesso.' },
        { label: 'Total de derrotas', value: stats.losses || 0, desc: 'Resiliência.' },
        { label: 'Taxa de vitórias (%)', value: winRate.toFixed(1) + '%', desc: 'A verdade nua e crua.' },
        { label: 'Pontuação atual (ELO)', value: (stats.rankPoints || 0).toFixed(1), desc: 'O momento.' },
        { label: 'Maior pontuação já alcançada', value: (stats.maxRankPoints || 0).toFixed(1), desc: 'O teto.' },
        { label: 'Sequência atual de vitórias', value: stats.streak || 0, desc: 'A fase.' },
        { label: 'Maior sequência da carreira', value: stats.maxStreak || 0, desc: 'Pico de dominância.' },
        { label: 'Estilo de jogo', value: estilo, desc: 'Estrategista: 4+ paredes. Equilibrado: 2-3. Agressivo: <2.' },
        { label: 'Média de turnos por partida', value: avgTurns.toFixed(1), desc: 'Paciência vs. Pressa.' },
        { label: 'Total de paredes na carreira', value: stats.totalWalls || 0, desc: 'Dedicação tática.' },
        { label: 'Média de pontos por vitória', value: avgPtsWin.toFixed(1), desc: 'Qualidade das vitórias.' },
        { label: 'Razão Vitória/Derrota', value: ratioStr, desc: 'Quantas vitórias para cada derrota.' },
        { label: 'Melhor rank já alcançado', value: getRank(stats.maxRankPoints || 0), desc: 'Potencial máximo.' },
        { label: 'Média de ELO dos oponentes', value: avgOppElo, desc: 'Nível dos desafios.' }
      ];

      for (var i = 0; i < data.length; i++) {
        var s = data[i];
        var item = document.createElement('div');
        item.className = 'profile-item';
        item.innerHTML = '<span class="stat-label"><span class="info-icon">i</span>' + s.label + '</span><span class="stat-value">' + s.value + '</span><div class="stat-desc">' + s.desc + '</div>';
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          var wasActive = this.classList.contains('active');
          document.querySelectorAll('.profile-item').forEach(function(el) { el.classList.remove('active'); });
          if (!wasActive) this.classList.add('active');
        });
        list.appendChild(item);
      }

      renderMedalsInProfile(list, stats);
      document.getElementById('profile-overlay').classList.add('show');
    }
    '''
    # Insere a função antes de fechar perfil (se closeProfile existir)
    if 'function closeProfile()' in conteudo:
        conteudo = conteudo.replace('function closeProfile()', nova_funcao + '\n    function closeProfile()')
    else:
        conteudo += '\n' + nova_funcao + '\n    function closeProfile() { document.getElementById("profile-overlay").classList.remove("show"); }'

# 2. Recriar vínculo do clique no avatar/nome
bloco_vinculo = '''
<script>
(function(){
  var userInfo = document.getElementById('user-info-profile');
  if (userInfo) {
    userInfo.addEventListener('click', function() {
      if (typeof openProfile === 'function') openProfile();
      else alert('Função openProfile não encontrada.');
    });
  }
  var closeBtn = document.getElementById('profile-close');
  if (closeBtn) closeBtn.addEventListener('click', function() { closeProfile(); });
  var closeBtn2 = document.getElementById('btn-close-profile');
  if (closeBtn2) closeBtn2.addEventListener('click', function() { closeProfile(); });
  var overlay = document.getElementById('profile-overlay');
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === e.currentTarget) closeProfile();
  });
})();
</script>
'''

# Remover vínculo antigo se já existir (marcador único)
marcador = 'user-info-profile'
pos = conteudo.find(marcador)
# Não remover, apenas adicionar o bloco (pode duplicar listener, mas sem problemas)
# Vamos garantir que o bloco não seja adicionado duas vezes
if 'VinculoPerfilCorrigido' not in conteudo:
    conteudo = conteudo.replace('</body>', bloco_vinculo.replace('<script>', '<script id="VinculoPerfilCorrigido">') + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Perfil corrigido!")
