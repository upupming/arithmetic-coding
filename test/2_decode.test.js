var fs = require('fs');
require('should');
const decode = require('../src/decode');

describe('decode', function () {
  it('should decode okay', function () {
    decode.decode(__dirname + '/txt/short-encoded.txt', __dirname + '/txt/short-decoded.txt');
  });
  it('should decode & encode equal', function () {
    let originalText = fs.readFileSync(__dirname + '/txt/short.txt');
    let decodedText = fs.readFileSync(__dirname + '/txt/short-decoded.txt');
    // console.log(`originalText = ${originalText.toString()}`);
    // console.log(`decodedText = ${decodedText.toString()}`);
    originalText.toString().should.eql(decodedText.toString());
  });
});