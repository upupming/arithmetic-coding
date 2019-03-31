var fs = require('fs')
require('should')
const decode = require('../src/decode')
const fileInfo = require('./file-info')
const path = require('path')

describe('decode', function () {
  it('should decode okay ' + fileInfo(path.resolve(__dirname, './txt/short.txt')), function () {
    decode.decode(path.resolve(__dirname, './txt/short-encoded.txt'), path.resolve(__dirname, './txt/short-decoded.txt'))
  })
  it('should decode & encode equal', function () {
    let originalText = fs.readFileSync(path.resolve(__dirname, './txt/short.txt'))
    let decodedText = fs.readFileSync(path.resolve(__dirname, './txt/short-decoded.txt'))
    // console.log(`originalText = ${originalText.toString()}`);
    // console.log(`decodedText = ${decodedText.toString()}`);
    originalText.toString().should.eql(decodedText.toString())
  })
})
