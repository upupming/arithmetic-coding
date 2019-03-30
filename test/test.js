const encode = require('../src/encode');
const decode = require('../src/decode');

encode.encode(__dirname + '/txt/short.txt', __dirname + '/txt/short-encoded.txt');

decode.decode(__dirname + '/txt/short-encoded.txt', __dirname + '/txt/short-decoded.txt');
