require('should');
const ariCoding = require('../src/index');
var fs = require('fs');

describe('Package test', function() {
  describe('encode & decode', function() {
    it('should encode', function() {
      ariCoding.encode(__dirname + '/txt/long.txt', __dirname + '/txt/long-encoded.txt');
    });
    it('should decode', function() {
      ariCoding.decode(__dirname + '/txt/long-encoded.txt', __dirname + '/txt/long-decoded.txt');
    });
    it('should equal', function() {
      let originalText = fs.readFileSync(__dirname + '/txt/long.txt');
      let decodedText = fs.readFileSync(__dirname + '/txt/long-decoded.txt');
      originalText.should.eql(decodedText);
    });
  });
  describe('Buffer support', function() {
    it('should encode and decode Buffer okay', function() {
      let data = Buffer.from('Example data', 'utf8');
      let encoded = ariCoding.encodeFromBuffer(data);
      // console.log(`encoded = ${encoded}`);
      let decoded = ariCoding.decodeFromBuffer(encoded);
      // console.log(`decoded = ${decoded}`);
      data.should.eql(decoded);
    });
  });
});