const readline = require('readline-sync');
const figlet = require('figlet');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorize(color, text) {
  return `${color}${text}${colors.reset}`;
}

function showHeader(totalGames, version, repository) {
  console.clear();
  const asciiLogo = figlet.textSync('Gamefetch', { horizontalLayout: 'default' });
  console.log(colorize(colors.green, asciiLogo));

  console.log(`${colorize(colors.green, '◆ Versão:')} ${colorize(colors.yellow, version)}`);
  console.log(`${colorize(colors.green, '◆ Repositório:')} ${colorize(colors.yellow, repository)}`);
  console.log(`${colorize(colors.green, '◆ Jogos disponíveis:')} ${colorize(colors.yellow, totalGames)}`);
  console.log('────────────────────────────────────────────\n');
}

function askSearch() {
  const answer = readline.question('Digite o nome do jogo: ').toLowerCase();
  console.log();
  return answer;
}

function truncate(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}

function listGames(games) {
  const idxWidth = 4;
  const titleWidth = 65;
  const sizeWidth = 10;
  const dateWidth = 10;

  console.log(
    colors.bold +
    '#'.padEnd(idxWidth) +
    'Título'.padEnd(titleWidth) + ' | ' +
    'Tamanho'.padEnd(sizeWidth) + ' | ' +
    'Data'.padEnd(dateWidth) +
    colors.reset
  );

  console.log('-'.repeat(idxWidth + titleWidth + 3 + sizeWidth + 3 + dateWidth));

  games.forEach((game, i) => {
    const idx = colorize(colors.cyan, String(i + 1).padStart(idxWidth - 2, ' ') + ') ');
    const title = colorize(colors.green, truncate(game.title || 'Sem título', titleWidth).padEnd(titleWidth, ' '));
    const size = colorize(
      colors.yellow,
      (typeof game.fileSize === 'string' && game.fileSize.trim() !== '' ? game.fileSize : '???').padEnd(sizeWidth, ' ')
    );
    const date = colorize(
      colors.blue,
      (game.uploadDate
        ? new Date(game.uploadDate).toLocaleDateString('pt-BR')
        : '??/??/??').padEnd(dateWidth, ' ')
    );
    console.log(`${idx}${title} | ${size} | ${date}`);
  });

  console.log();
}

function askChoice(total) {
  const answer = readline.question('\nDigite o número da opção que deseja baixar (0 para sair): ');
  const number = parseInt(answer, 10);
  return isNaN(number) || number < 0 || number > total ? 0 : number;
}

module.exports = {
  showHeader,
  askSearch,
  listGames,
  askChoice
};