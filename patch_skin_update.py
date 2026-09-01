with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

antigo = '''function equipSkin(skinId) {
      var stats = getUserStats(currentUser);
      if ((stats.ownedSkins || []).indexOf(skinId) === -1) return;
      stats.equippedSkin = skinId;
      updateUserStats(currentUser, stats);
      renderSkinsList();
      if (document.getElementById('game-screen').classList.contains('active')) draw();
    }'''

novo = '''function equipSkin(skinId) {
      var stats = getUserStats(currentUser);
      if ((stats.ownedSkins || []).indexOf(skinId) === -1) return;
      stats.equippedSkin = skinId;
      updateUserStats(currentUser, stats);
      renderSkinsList();
      if (document.getElementById('game-screen').classList.contains('active')) draw();

      // Atualizar skin no modo online (RTDB)
      if (isOnlineMode && salaAtual) {
        var campo = (currentUser === G.p1Name) ? "skinJogador1" : "skinJogador2";
        var updateObj = {};
        updateObj[campo] = skinId;
        try {
          firebase.database().ref("salas/" + salaAtual).update(updateObj);
        } catch(e) {}
      }
    }'''

conteudo = conteudo.replace(antigo, novo)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Patch de atualização de skin aplicado!")
