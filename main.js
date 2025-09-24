#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { VERSION, REPOSITORY, SOURCES } = require('./config');
const ui = require('./ui');
const { downloadFile } = require('./download');
const { processFlags } = require('./flag');

const colors = {
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
  green: '\x1b[32m'
};

async function fetchRemoteVersion() {
  const url = 'https://raw.githubusercontent.com/aglairdev/gamefetch-cli/main/package.json';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao buscar versão remota');
    const pkg = await response.json();
    return pkg.version;
  } catch {
    return null;
  }
}

function askYesNo(question) {
  const answer = require('readline-sync').question(question + ' ');
  return answer.trim().toLowerCase();
}

async function loadGames() {
  let allGames = [];

  for (const url of SOURCES) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      let gamesArray = Array.isArray(data) ? data : Object.values(data).find(Array.isArray) || [];
      allGames = allGames.concat(gamesArray);
    } catch (error) {
      console.error(`Erro na fonte ${url}: ${error.message}`);
    }
  }

  return allGames.filter(game => game.uris?.some(link => link.includes('pixeldrain')));
}

(async () => {
  const remoteVersion = await fetchRemoteVersion();
  if (remoteVersion && remoteVersion !== VERSION) {
    const answer = askYesNo(`${colors.yellow}[!] Atualização disponível (${remoteVersion}). Deseja atualizar? (s/n)${colors.reset}`);
    if (answer === 's' || answer === 'sim') {
      console.log(`${colors.green}Atualizando...${colors.reset}`);
      try {
        execSync('curl -sL https://raw.githubusercontent.com/aglairdev/gamefetch-cli/main/install.sh | bash', { stdio: 'inherit' });
        console.log(`${colors.green}Atualização concluída! Reinicie o programa.${colors.reset}`);
        process.exit(0);
      } catch (err) {
        console.error(`Erro ao atualizar: ${err.message}`);
        process.exit(1);
      }
    }
  }

  const games = await loadGames();
  const args = process.argv.slice(2);

  if (args.length > 0) {
    processFlags(args[0], games, ui, downloadFile);
    return;
  }

  ui.showHeader(games.length, VERSION, REPOSITORY);
  const searchTerm = ui.askSearch();
  if (!searchTerm.trim()) return;

  let options = games.filter(game => game.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  options.sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0));
  options = options.slice(0, 20);

  if (options.length === 0) {
    console.log('Nenhuma opção encontrada para essa busca.');
    return;
  }

  ui.listGames(options);
  const choice = ui.askChoice(options.length);
  if (choice === 0) return;

  const selectedGame = options[choice - 1];

  console.log(`\n${colors.green}Título selecionado:${colors.reset} ${selectedGame.title}`);

  const pixeldrainLinks = selectedGame.uris.filter(link => link.includes('pixeldrain'));
  const selectedLink = pixeldrainLinks[Math.floor(Math.random() * pixeldrainLinks.length)];
  const pixeldrainId = selectedLink.split('/').pop();

  const downloadFolder = path.join(__dirname, 'download');
  if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder, { recursive: true });

  const safeTitle = selectedGame.title.replace(/[\/\\?%*:|"<>]/g, '').replace(/\s+/g, '_');
  const filePath = path.join(downloadFolder, `${safeTitle}__${pixeldrainId}.bin`);

  try {
    await downloadFile(`https://pixeldrain.com/api/file/${pixeldrainId}`, filePath, selectedGame.title);
    const friendlyPath = path.join('~', 'gamefetch-cli', 'download');
    console.log(`\n${colors.green}Download concluído!${colors.reset}`);
    console.log(`${colors.yellow}Salvo em:${colors.reset} ${friendlyPath}`);
  } catch (err) {
    console.error('Erro no download:', err.message);
  }
})();