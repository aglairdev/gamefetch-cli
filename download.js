const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cliProgress = require('cli-progress');

const colors = {
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
  green: '\x1b[32m'
};

function formatBytes(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
  return bytes + ' B';
}

async function downloadFile(url, baseFilePath, gameTitle) {
  console.log(`${colors.yellow}Iniciando download de:${colors.reset} ${gameTitle}`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow'
  });

  if (!res.ok) throw new Error(`Erro ao baixar: ${res.status} ${res.statusText}`);

  let ext = path.extname(baseFilePath);
  const contentDisposition = res.headers.get('content-disposition');
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) {
      ext = path.extname(match[1]) || ext || '';
    }
  }

  const baseName = baseFilePath.replace(/\.[^/.]+$/, '');
  const filePath = `${baseName}${ext}`;

  const totalBytes = parseInt(res.headers.get('content-length'), 10) || 0;
  const fileStream = fs.createWriteStream(filePath);

  const progressBar = new cliProgress.SingleBar({
    format: '{bar} {percentage}% | {downloaded} / {totalReadable}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
    clearOnComplete: true
  });

  let downloadedBytes = 0;
  progressBar.start(totalBytes, 0, {
    downloaded: formatBytes(0),
    totalReadable: formatBytes(totalBytes)
  });

  return new Promise((resolve, reject) => {
    res.body.on('data', chunk => {
      fileStream.write(chunk);
      downloadedBytes += chunk.length;
      progressBar.update(downloadedBytes, {
        downloaded: formatBytes(downloadedBytes),
        totalReadable: formatBytes(totalBytes)
      });
    });

    res.body.on('end', () => {
      fileStream.end();
      progressBar.stop();
      resolve(filePath);
    });

    res.body.on('error', err => {
      progressBar.stop();
      reject(err);
    });
  });
}

module.exports = { downloadFile };