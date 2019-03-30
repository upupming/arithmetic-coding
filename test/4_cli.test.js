const cmd = require('./cmd');
const path = require('path');
require('should');
const fs = require('fs');
const fileInfo = require('./file-info');

describe('CLI test ' + fileInfo(__dirname + '/txt/long.txt'), () => {
  it('should print help if input is invalid', async () => {
    try {
      await cmd.execute(
        path.resolve(__dirname, '../bin/index.js'),
        ['ssss']
      );
    } catch (err) {
      err.should.eql('Invalid command: ssss\nSee --help for a list of available commands.\n');
    }
  });
  it('should encode okay', async () => {
    await cmd.execute(
      path.resolve(__dirname, '../bin/index.js'),
      ['encode', path.resolve(__dirname, './txt/long.txt'), '-o', path.resolve(__dirname, './txt/long-encoded.txt')]
    );
  });
  it('should decode okay', async () => {
    await cmd.execute(
      path.resolve(__dirname, '../bin/index.js'),
      ['decode', path.resolve(__dirname, './txt/long-encoded.txt'), '-o', path.resolve(__dirname, './txt/long-decoded.txt')]
    );
  });
  it('should encode & decode equal', async () => {
    let originalText = fs.readFileSync(__dirname + '/txt/long.txt');
    let decodedText = fs.readFileSync(__dirname + '/txt/long-decoded.txt');
    originalText.should.eql(decodedText);
  });
});