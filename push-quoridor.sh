#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Iniciando Push do Quoridor...${NC}\n"

# Verificar se está em repositório git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Não está em um repositório Git${NC}"
    echo -e "${YELLOW}Inicializando repositório...${NC}"
    git init
    git remote add origin https://github.com/SEU_USUARIO/quoridor.git
fi

# Status
echo -e "${YELLOW}📊 Status atual:${NC}"
git status

# Add
echo -e "\n${YELLOW}📝 Adicionando arquivos...${NC}"
git add -A

# Commit
MENSAGEM="🎮 Atualização Quoridor - $(date '+%d/%m/%Y %H:%M:%S')"
echo -e "\n${YELLOW}💾 Fazendo commit...${NC}"
git commit -m "$MENSAGEM"

# Push
echo -e "\n${YELLOW}⬆️ Fazendo push...${NC}"
git push -u origin main 2>/dev/null || git push -u origin master

echo -e "\n${GREEN}✅ Push concluído!${NC}"
