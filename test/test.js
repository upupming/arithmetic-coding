const encode = require('../src/encode')
const decode = require('../src/decode')
const path = require('path')

encode.encode(path.resolve(__dirname, './txt/short.txt'), path.resolve(__dirname, './txt/short-encoded.txt'))

decode.decode(path.resolve(__dirname, './txt/short-encoded.txt'), path.resolve(__dirname, './txt/short-decoded.txt'))
