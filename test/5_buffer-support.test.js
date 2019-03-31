require('should');
const encode = require('../src/encode');
const decode = require('../src/decode');
const fs = require('fs');
const fileInfo = require('./file-info');

const filepath = __dirname + '/txt/sample5.ref';

describe('Buffer support', function () {
  let data = fs.readFileSync(filepath);
  let encoded, decoded;
  it('should encode Buffer okay ' + fileInfo(filepath), function() {
    encoded = encode.encodeFromBuffer(data);
    // console.log(`encoded = ${encoded}`);
  });
  it('should decode Buffer okay ' + fileInfo(filepath), function() {
    decoded = decode.decodeFromBuffer(encoded);
    // console.log(`decoded = ${decoded}`);
  });
  it('should encode and decode equal', function() {
    data.should.eql(decoded);
  });
});

