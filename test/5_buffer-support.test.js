require('should');
const encode = require('../src/encode');
const decode = require('../src/decode');
const fs = require('fs');
const fileInfo = require('./file-info');

const filepath = __dirname + '/txt/sample5.ref';

describe('Buffer support', function () {
  it('should encode and decode Buffer okay ' + fileInfo(filepath), function() {
    let data = fs.readFileSync(filepath);
    let encoded = encode.encodeFromBuffer(data);
    // console.log(`encoded = ${encoded}`);
    let decoded = decode.decodeFromBuffer(encoded);
    // console.log(`decoded = ${decoded}`);
    data.should.eql(decoded);
  });
});

