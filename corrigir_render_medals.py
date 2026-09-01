with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

if 'function renderMedalsInProfile' not in conteudo:
    nova_funcao = '''
    function renderMedalsInProfile(listElement, stats) {
      var container = document.createElement('div');
      container.style.cssText = 'padding:12px;border-top:1px solid rgba(255,215,140,0.06);border-bottom:1px solid rgba(255,215,140,0.06);margin:10px 0;';
      container.innerHTML = '<div style="font-weight:700;color:#d4a373;margin-bottom:8px;font-size:11px;">MEDALHAS</div>';
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';
      for (var i = 0; i < MEDALS.length; i++) {
        var medal = MEDALS[i];
        var unlocked = medal.check(stats);
        var medalDiv = document.createElement('div');
        medalDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
        medalDiv.innerHTML = '<span class="medal-svg">' + medal.svg(unlocked) + '</span>';
        (function(m) {
          medalDiv.addEventListener('click', function() { alert(m.nome + ': ' + m.desc); });
        })(medal);
        row.appendChild(medalDiv);
      }
      container.appendChild(row);
      listElement.appendChild(container);
    }
    '''
    # Inserir antes da função getTitleRequirement
    if 'function getTitleRequirement' in conteudo:
        conteudo = conteudo.replace('    function getTitleRequirement', nova_funcao + '\n    function getTitleRequirement')
    else:
        conteudo += '\n' + nova_funcao

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(conteudo)
    print("Função renderMedalsInProfile adicionada!")
else:
    print("A função já existe. Nada feito.")
