import re

ARQUIVO = "index.html"

with open(ARQUIVO, "r", encoding="utf-8") as f:
    conteudo = f.read()

# Remover o script de partículas e dicas (se existir)
padrao_script = re.compile(r"<script>\\s*\(function\(\)\{.*?particulas.*?\}\)\(\);\\s*</script>", re.DOTALL)
conteudo = padrao_script.sub("", conteudo)

# Remover o HTML das partículas
conteudo = re.sub(r'<div id="particulas-container"></div>', '', conteudo)

# Remover a dica de estratégia
conteudo = re.sub(r'<div id="login-dica">.*?</div>', '', conteudo)

with open(ARQUIVO, "w", encoding="utf-8") as f:
    f.write(conteudo)

print("Scripts de partículas e dicas removidos. Recarregue a página.")
