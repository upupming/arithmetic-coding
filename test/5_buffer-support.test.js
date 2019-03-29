require('should');
const encode = require('../src/encode');
const decode = require('../src/decode');

describe('Buffer support', function () {
  it('should encode and decode Buffer okay', function() {
    let data = Buffer.from('Example data', 'utf8');
    let encoded = encode.encodeFromBuffer(data);
    // console.log(`encoded = ${encoded}`);
    let decoded = decode.decodeFromBuffer(encoded);
    // console.log(`decoded = ${decoded}`);
    data.should.eql(decoded);
  });
});

