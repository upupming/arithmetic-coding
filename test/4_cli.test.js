const cmd = require('./cmd');
const path = require('path');
require('should');
const fs = require('fs');

describe('CLI test', () => {
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
  it('should encode & encode okay', async () => {
    await cmd.execute(
      path.resolve(__dirname, '../bin/index.js'),
      ['encode', path.resolve(__dirname, './txt/long.txt'), '-o', path.resolve(__dirname, './txt/long-encoded.txt')]
    );
    await cmd.execute(
      path.resolve(__dirname, '../bin/index.js'),
      ['decode', path.resolve(__dirname, './txt/long-encoded.txt'), '-o', path.resolve(__dirname, './txt/long-decoded.txt')]
    );
    let originalText = fs.readFileSync(__dirname + '/txt/long.txt');
    let decodedText = fs.readFileSync(__dirname + '/txt/long-decoded.txt');
    originalText.should.eql(decodedText);
  });
});