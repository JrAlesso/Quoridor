with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

if 'function limparContasInvalidas' not in conteudo:
    nova_funcao = '''
    function limparContasInvalidas() {
      var chavesRemovidas = [];
      for (var i = 0; i < localStorage.length; i++) {
        var chave = localStorage.key(i);
        if (chave && chave.indexOf('quoridor_accounts') !== -1) {
          try {
            var dados = JSON.parse(localStorage.getItem(chave));
            if (dados && typeof dados === 'object') {
              var nomes = Object.keys(dados);
              var contasValidas = {};
              for (var j = 0; j < nomes.length; j++) {
                var nome = nomes[j];
                var stats = dados[nome] && dados[nome].stats;
                // Conta válida se tiver os campos essenciais
                if (dados[nome] && dados[nome].passwordHash && stats &&
                    typeof stats.games === 'number' &&
                    typeof stats.wins === 'number' &&
                    typeof stats.level === 'number' &&
                    typeof stats.points === 'number' &&
                    typeof stats.rankPoints === 'number' &&
                    typeof stats.equippedSkin === 'string') {
                  contasValidas[nome] = dados[nome];
                } else {
                  chavesRemovidas.push(nome);
                }
              }
              // Se houve remoção, salvar apenas as válidas
              if (chavesRemovidas.length > 0) {
                localStorage.setItem(chave, JSON.stringify(contasValidas));
              }
            }
          } catch(e) {
            // Conta com JSON inválido
            chavesRemovidas.push(chave);
            localStorage.removeItem(chave);
          }
        }
      }
      currentUser = null;
      var msg = chavesRemovidas.length > 0 ?
        'Contas inválidas removidas: ' + chavesRemovidas.join(', ') :
        'Nenhuma conta inválida encontrada.';
      alert(msg);
      console.log(msg);
      return chavesRemovidas;
    }
    '''
    # Inserir antes de getUserStats
    if 'function getUserStats' in conteudo:
        conteudo = conteudo.replace('    function getUserStats', nova_funcao + '\n    function getUserStats')
    else:
        conteudo += '\n' + nova_funcao

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(conteudo)
    print("Função limparContasInvalidas adicionada!")
else:
    print("A função já existe. Nada feito.")
