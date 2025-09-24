const path = require('path');
const fs = require('fs');

async function processFlags(flag, games, ui, downloadFile) {
  if (flag === '-l') {
    ui.listGames(games);
    const choice = ui.askChoice(games.length);
    if (choice === 0) return;
    if (choice < 1 || choice > games.length) {
      console.log('Opção inválida!');
      return;
    }
    const selectedGame = games[choice - 1];
    await downloadByGame(selectedGame, downloadFile);
  } 
  else if (flag.startsWith('-l')) {
    const id = parseInt(flag.slice(2), 10);
    if (isNaN(id)) {
      console.log('ID inválido. Use -h para ajuda.');
      return;
    }
    const selectedGame = games[id - 1];
    if (!selectedGame) {
      console.log('Jogo não encontrado para o ID informado.');
      return;
    }
    await downloadByGame(selectedGame, downloadFile);
  } 
  else if (flag === '-h') {
    console.log('  -l         Listar todos os jogos');
    console.log('  -l<ID>     Baixar jogo pelo ID (ex: -l5)');
    console.log('  -h         Mostrar ajuda');
  } 
  else {
    console.log('Flag inválida. Use -h para ajuda.');
  }
}

async function downloadByGame(game, downloadFile) {
  const pixeldrainLinks = game.uris.filter(link => link.includes('pixeldrain'));
  if (pixeldrainLinks.length === 0) {
    console.log('Nenhum link Pixeldrain encontrado para esse jogo.');
    return;
  }

  const selectedLink = pixeldrainLinks[Math.floor(Math.random() * pixeldrainLinks.length)];
  const pixeldrainId = selectedLink.split('/').pop();

  const downloadFolder = path.join(__dirname, 'download');
  if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder, { recursive: true });

  const safeTitle = game.title.replace(/[\/\\?%*:|"<>]/g, '').replace(/\s+/g, '_');
  const filePath = path.join(downloadFolder, `${safeTitle}__${pixeldrainId}.bin`);

  try {
    console.log(`Iniciando download: ${game.title}`);
    await downloadFile(`https://pixeldrain.com/api/file/${pixeldrainId}`, filePath, game.title);
    console.log('Download concluído!');
  } catch (err) {
    console.error('Erro no download:', err.message);
  }
}

module.exports = { processFlags };