let encode = require('./encode');
let decode = require('./decode');
module.exports = {
  encode: encode.encode,
  encodeFromBuffer: encode.encodeFromBuffer,
  decode: decode.decode,
  decodeFromBuffer: decode.decodeFromBuffer
};