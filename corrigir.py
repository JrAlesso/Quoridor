import re

ARQUIVO = "index.html"

with open(ARQUIVO, "r", encoding="utf-8") as f:
    conteudo = f.read()

# 1. Adicionar botões de Chat e Guilda no menu (após o botão Amigos)
padrao_botoes = re.compile(r'(<div class="modo-btn" id="btn-amigos".*?</div>)', re.DOTALL)
novos_botoes = r'''\1
    <div class="modo-btn" id="btn-chat"><span class="icon">💬</span><div class="info"><div class="title">Chat</div><div class="desc">Global, privado e guilda</div></div><span class="arrow">›</span></div>
    <div class="modo-btn" id="btn-guilda"><span class="icon">🛡️</span><div class="info"><div class="title">Guilda</div><div class="desc">Em breve</div></div><span class="arrow">›</span></div>'''
conteudo = padrao_botoes.sub(novos_botoes, conteudo, count=1)

# 2. Adicionar overlays de Chat e Guilda antes do fechamento do body
overlays = '''
  <div id="chat-overlay"><div id="chat-card"><h2>💬 CHAT <button class="close-btn" id="chat-close">✕</button></h2>
    <div class="chat-tabs">
      <button class="chat-tab active" data-tab="global">Global</button>
      <button class="chat-tab" data-tab="privado">Privado</button>
      <button class="chat-tab" data-tab="guilda">Guilda</button>
      <button class="chat-tab" data-tab="info">Informação</button>
    </div>
    <div id="chat-content" class="chat-content">
      <div id="chat-global" class="chat-pane active">
        <div class="chat-messages" id="global-messages"><div class="chat-msg system">Bem-vindo ao chat global!</div></div>
        <input type="text" id="global-input" class="chat-input" placeholder="Digite...">
      </div>
      <div id="chat-privado" class="chat-pane">
        <div class="chat-messages" id="privado-messages"><div class="chat-msg system">Selecione um amigo para conversar.</div></div>
        <input type="text" id="privado-input" class="chat-input" placeholder="Digite...">
      </div>
      <div id="chat-guilda" class="chat-pane">
        <div class="chat-messages" id="guilda-messages"><div class="chat-msg system">Entre em uma guilda para conversar.</div></div>
        <input type="text" id="guilda-input" class="chat-input" placeholder="Digite...">
      </div>
      <div id="chat-info" class="chat-pane">
        <div class="chat-messages"><div class="chat-msg system">Informações do jogo, regras e avisos.</div></div>
      </div>
    </div>
    <button id="btn-close-chat">FECHAR</button>
  </div></div>

  <div id="guilda-overlay"><div id="guilda-card"><h2>🛡️ GUILDA <button class="close-btn" id="guilda-close">✕</button></h2>
    <div style="color:#b8a99a;text-align:center;padding:40px 0;">Em breve! Estamos preparando algo incrível.</div>
    <button id="btn-close-guilda">FECHAR</button>
  </div></div>
'''
conteudo = conteudo.replace('</body>', overlays + '\n</body>')

# 3. Adicionar estilos CSS para os overlays e chat
estilos = '''
  #chat-overlay,#guilda-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:none;justify-content:center;align-items:center;z-index:1002;padding:20px}
  #chat-overlay.show,#guilda-overlay.show{display:flex}
  #chat-card,#guilda-card{background:rgba(26,20,16,0.97);border:1px solid rgba(255,215,140,0.12);border-radius:24px;padding:20px;max-width:500px;width:100%;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 10px 60px rgba(0,0,0,0.8);position:relative;z-index:2}
  #chat-card h2,#guilda-card h2{color:#d4a373;font-size:16px;text-align:center;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}
  .close-btn{background:none;border:none;color:#b8a99a;font-size:20px;cursor:pointer}
  .chat-tabs{display:flex;gap:6px;margin-bottom:12px;justify-content:center}
  .chat-tab{flex:1;padding:8px 4px;border:1px solid rgba(255,215,140,0.06);border-radius:10px;background:rgba(255,215,140,0.03);color:#b8a99a;font-weight:700;font-size:10px;cursor:pointer}
  .chat-tab.active{border-color:#d4a373;color:#d4a373;background:rgba(212,163,115,0.08)}
  .chat-content{flex:1;overflow-y:auto;margin-bottom:10px}
  .chat-pane{display:none}
  .chat-pane.active{display:block}
  .chat-messages{height:200px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:12px;padding:10px;margin-bottom:8px}
  .chat-msg{padding:4px 8px;border-radius:8px;margin-bottom:4px;font-size:12px;color:#f0e6d3}
  .chat-msg.system{color:#8a7a6a;text-align:center;font-style:italic}
  .chat-input{width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,215,140,0.15);background:rgba(255,215,140,0.05);color:#f0e6d3;font-size:13px;outline:none}
  #btn-close-chat,#btn-close-guilda{width:100%;padding:12px;border:none;border-radius:14px;background:linear-gradient(135deg,#d4a373,#b8860b);color:#1a1410;font-weight:800;font-size:13px;cursor:pointer;margin-top:4px}
'''
conteudo = conteudo.replace('</style>', estilos + '\n</style>')

# 4. Adicionar JavaScript para abrir/fechar overlays e alternar abas
script = '''
<script>
(function(){
  function abrirChat(){ document.getElementById('chat-overlay').classList.add('show'); }
  function fecharChat(){ document.getElementById('chat-overlay').classList.remove('show'); }
  function abrirGuilda(){ document.getElementById('guilda-overlay').classList.add('show'); }
  function fecharGuilda(){ document.getElementById('guilda-overlay').classList.remove('show'); }

  // Botões do menu
  var btnChat = document.getElementById('btn-chat');
  if(btnChat) btnChat.addEventListener('click', abrirChat);
  var btnGuilda = document.getElementById('btn-guilda');
  if(btnGuilda) btnGuilda.addEventListener('click', abrirGuilda);

  // Fechar
  var closeChat = document.getElementById('chat-close');
  if(closeChat) closeChat.addEventListener('click', fecharChat);
  var closeGuilda = document.getElementById('guilda-close');
  if(closeGuilda) closeGuilda.addEventListener('click', fecharGuilda);
  var btnCloseChat = document.getElementById('btn-close-chat');
  if(btnCloseChat) btnCloseChat.addEventListener('click', fecharChat);
  var btnCloseGuilda = document.getElementById('btn-close-guilda');
  if(btnCloseGuilda) btnCloseGuilda.addEventListener('click', fecharGuilda);

  // Fechar ao clicar fora
  document.getElementById('chat-overlay').addEventListener('click', function(e){ if(e.target === e.currentTarget) fecharChat(); });
  document.getElementById('guilda-overlay').addEventListener('click', function(e){ if(e.target === e.currentTarget) fecharGuilda(); });

  // Abas do chat
  var tabs = document.querySelectorAll('.chat-tab');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      this.classList.add('active');
      var alvo = this.getAttribute('data-tab');
      document.querySelectorAll('.chat-pane').forEach(function(pane){
        pane.classList.remove('active');
      });
      document.getElementById('chat-' + alvo).classList.add('active');
    });
  });
})();
</script>
'''
conteudo = conteudo.replace('</body>', script + '\n</body>')

with open(ARQUIVO, "w", encoding="utf-8") as f:
    f.write(conteudo)

print("Cards Chat e Guilda adicionados com sucesso!")
