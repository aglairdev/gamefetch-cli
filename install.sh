#!/bin/bash
set -e

GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

REPO_URL="https://github.com/aglairdev/gamefetch-cli.git"
INSTALL_DIR="$HOME/gamefetch-cli"
LOCAL_BIN="$HOME/.local/bin"
BIN_LINK="$LOCAL_BIN/gamefetch"

echo -e "${GREEN}Iniciando instalação do gamefetch no Bash/Zsh...${RESET}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado. Por favor, instale o Node.js antes de continuar.${RESET}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm não encontrado. Por favor, instale o npm antes de continuar.${RESET}"
    exit 1
fi

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Repositório já existe em $INSTALL_DIR, atualizando...${RESET}"
    cd "$INSTALL_DIR"
    git pull origin main
else
    echo -e "${YELLOW}Clonando repositório em $INSTALL_DIR...${RESET}"
    git clone "$REPO_URL" "$INSTALL_DIR"
fi

echo -e "${YELLOW}Instalando dependências...${RESET}"
cd "$INSTALL_DIR"
npm install --omit=dev

chmod +x "$INSTALL_DIR/main.js"

mkdir -p "$LOCAL_BIN"
ln -sf "$INSTALL_DIR/main.js" "$BIN_LINK"

PROFILE_FILE=""
if [ "$SHELL_NAME" = "bash" ]; then
    PROFILE_FILE="$HOME/.bashrc"
elif [ "$SHELL_NAME" = "zsh" ]; then
    PROFILE_FILE="$HOME/.zshrc"
else
    PROFILE_FILE="$HOME/.profile"
fi

if ! grep -q 'export PATH=$HOME/.local/bin:$PATH' "$PROFILE_FILE"; then
    echo -e "\n# Adicionado pelo instalador gamefetch" >> "$PROFILE_FILE"
    echo 'export PATH=$HOME/.local/bin:$PATH' >> "$PROFILE_FILE"
fi

echo -e "${YELLOW}Criando link simbólico em $BIN_LINK${RESET}"
echo -e "${GREEN}PATH atualizado em $PROFILE_FILE${RESET}"
echo -e "${YELLOW}Reinicie seu terminal ou rode: source $PROFILE_FILE${RESET}"
echo -e "${GREEN}Depois disso, você poderá usar o comando 'gamefetch'.${RESET}"