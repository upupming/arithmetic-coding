require('should');
const encode = require('../src/encode');
const fileInfo = require('./file-info');

describe('encode', function() {
  describe('getFrequencies ' + fileInfo(__dirname + '/txt/short.txt'), function() {
    it('should construct frequency table', function() {
      let freqs = encode.getFrequencies(__dirname + '/txt/short.txt');
      // console.log((Buffer.from('t'))[0]);
      // console.log(freqs);
      freqs.get((Buffer.from('t'))[0]).should.eql(2);
      freqs.get((Buffer.from('i'))[0]).should.eql(4);
    });
    it('should error if no such file', function() {
      
      // eslint-disable-next-line no-unused-vars
      (() => {let freqs = encode.getFrequencies(__dirname + '/txt/nosuchfile.txt');}).should.throw(Error);
    });
  });
  describe('encode ' + fileInfo(__dirname + '/txt/short.txt'), function() {
    it('should encode okay', function() {
      encode.encode(__dirname + '/txt/short.txt', __dirname + '/txt/short-encoded.txt');
    });
  });
});