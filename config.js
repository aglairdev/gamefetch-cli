const pkg = require('./package.json');

module.exports = {
  VERSION: pkg.version,
  REPOSITORY: pkg.repository.url,
  SOURCES: [
    'https://raw.githubusercontent.com/Shisuiicaro/source/refs/heads/main/shisuyssource.json',
    'https://davidkazumi-github-io.pages.dev/fontekazumi.json'
  ]
};