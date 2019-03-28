require('should');
const encode = require('../src/encode');

describe('encode', function() {
  describe('getFrequencies', function() {
    it('should construct frequency table', async function() {
      let freqs = await encode.getFrequencies(__dirname + '/txt/short.txt');
      // console.log((Buffer.from('t'))[0]);
      // console.log(freqs);
      freqs.get((Buffer.from('t'))[0]).should.eql(2);
      freqs.get((Buffer.from('i'))[0]).should.eql(4);
    });
    it('should error if no such file', async function() {
      
      // eslint-disable-next-line no-unused-vars
      let freqs = await encode.getFrequencies(__dirname + '/txt/nosuchfile.txt').catch(err => {
        err.errno.should.eql(-4058);
        err.code.should.eql('ENOENT');
      });
    });
  });
  describe('encode', function() {
    it('should encode okay', async function() {
      await encode.encode(__dirname + '/txt/short.txt', __dirname + '/txt/short-encoded.txt');
    });
  });
});