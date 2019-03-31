require('should')
const ariCoding = require('../src/index')
var fs = require('fs')
const fileInfo = require('./file-info')
const path = require('path')

describe('Package test', function () {
  describe('encode & decode ' + fileInfo(path.resolve(__dirname, './txt/long.txt')), function () {
    it('should encode', function () {
      ariCoding.encode(path.resolve(__dirname, './txt/long.txt'), path.resolve(__dirname, './txt/long-encoded.txt'))
    })
    it('should decode', function () {
      ariCoding.decode(path.resolve(__dirname, './txt/long-encoded.txt'), path.resolve(__dirname, './txt/long-decoded.txt'))
    })
    it('should equal', function () {
      let originalText = fs.readFileSync(path.resolve(__dirname, './txt/long.txt'))
      let decodedText = fs.readFileSync(path.resolve(__dirname, './txt/long-decoded.txt'))
      originalText.should.eql(decodedText)
    })
  })
  describe('Buffer support', function () {
    it('should encode and decode Buffer okay', function () {
      let data = Buffer.from('Example data', 'utf8')
      let encoded = ariCoding.encodeFromBuffer(data)
      // console.log(`encoded = ${encoded}`);
      let decoded = ariCoding.decodeFromBuffer(encoded)
      // console.log(`decoded = ${decoded}`);
      data.should.eql(decoded)
    })
  })
})
