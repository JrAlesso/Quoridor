import re

with open('index.html', 'r', encoding='utf-8') as f:
    conteudo = f.read()

# Remove o patch RTDB antigo
inicio_rtdb = conteudo.find('<!--ONLINE_PATCH_RTDB-->')
if inicio_rtdb != -1:
    fim_rtdb = conteudo.find('</script>', inicio_rtdb)
    if fim_rtdb != -1:
        fim_rtdb += len('</script>')
        conteudo = conteudo[:inicio_rtdb] + conteudo[fim_rtdb:]

# Remove o bloco final com "Correções finais aplicadas"
padrao_final = "Correções finais aplicadas"
pos_final = conteudo.find(padrao_final)
if pos_final != -1:
    # Encontra o <script> anterior a esse ponto
    inicio_script = conteudo.rfind('<script>', 0, pos_final)
    if inicio_script != -1:
        fim_script = conteudo.find('</script>', pos_final)
        if fim_script != -1:
            fim_script += len('</script>')
            conteudo = conteudo[:inicio_script] + conteudo[fim_script:]

# Substitui referências a elementos inexistentes
conteudo = conteudo.replace("document.getElementById('sala-id-input')", "null")
conteudo = conteudo.replace("document.getElementById('btn-entrar-sala')", "null")
conteudo = conteudo.replace("document.getElementById('btn-listar-salas')", "null")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(conteudo)

print("Limpeza concluida!")
