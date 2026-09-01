import re

with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

# 1. Remover completamente o bloco antigo do Firestore (agora com delimitação exata)
# Vamos localizar o início e o fim do bloco Firestore antigo
inicio_firestore = conteudo.find('// ============================================================\n    // SALA ONLINE (FIREBASE)')
fim_firestore = conteudo.find('// ============================================================\n    // LÓGICA DO JOGO')

if inicio_firestore != -1 and fim_firestore != -1:
    # Remover tudo entre esses pontos, mantendo os comentários de separação
    conteudo = conteudo[:inicio_firestore] + conteudo[fim_firestore:]

# 2. Garantir que as funções do RTDB sejam chamadas corretamente
# Vamos substituir a função abrir() do patch para forçar a listagem ao abrir o overlay
conteudo = conteudo.replace('''  function abrir(){
    if (!currentUser) { alert("Faca login"); return; }
    document.getElementById("sala-overlay").classList.add("show");
    setStatus("Salas atualizam sozinhas");
    escutarSalas();
  }''', '''  function abrir(){
    if (!currentUser) { alert("Faca login"); return; }
    document.getElementById("sala-overlay").classList.add("show");
    setStatus("Carregando salas...");
    escutarSalas();
    // Atualizar a lista imediatamente
    setTimeout(function(){ escutarSalas(); }, 300);
  }''')

# 3. Adicionar tratamento de erro no listener (caso permissão negada)
conteudo = conteudo.replace('''    rtdb.ref("salas").on("value", window._listaUnsub, function(err){
      setStatus("ERRO lista: " + err.message);
      alert(err.message);
    });''', '''    rtdb.ref("salas").on("value", window._listaUnsub, function(err){
      console.error("Erro ao listar salas:", err);
      setStatus("❌ Erro ao listar salas. Verifique as regras do RTDB.");
      var lista = document.getElementById("sala-lista");
      if (lista) {
        lista.innerHTML = '<div style="color:#e06b6b;padding:20px;text-align:center;">❌ Erro ao carregar salas.<br><small>' + err.message + '</small></div>';
      }
    });''')

# 4. Garantir que o campo skinJogador1 seja enviado ao criar sala
conteudo = conteudo.replace('''    var dados = {
      nomePartida: nome,
      jogador1: currentUser,
      skinJogador1: getStats().equippedSkin || 'classic',
      jogador2: "",''', '''    var dados = {
      nomePartida: nome,
      jogador1: currentUser,
      skinJogador1: getStats().equippedSkin || 'classic',
      jogador2: "",''')

# 5. Remover qualquer referência a funções antigas do Firestore que não existem mais
# (já removidas, mas por segurança)
conteudo = conteudo.replace('''      document.getElementById('sala-id-input').value = '';\n''', '')

# Salvar
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Correção de salas aplicada!")
