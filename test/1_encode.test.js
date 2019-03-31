require('should')
const encode = require('../src/encode')
const fileInfo = require('./file-info')
const path = require('path')

describe('encode', function () {
  describe('getFrequencies ' + fileInfo(path.resolve(__dirname, './txt/short.txt')), function () {
    it('should construct frequency table', function () {
      let freqs = encode.getFrequencies(path.resolve(__dirname, './txt/short.txt'))
      // console.log((Buffer.from('t'))[0]);
      // console.log(freqs);
      freqs.get((Buffer.from('t'))[0]).should.eql(2)
      freqs.get((Buffer.from('i'))[0]).should.eql(4)
    })
    it('should error if no such file', function () {
      // eslint-disable-next-line no-unused-vars
      (() => { let freqs = encode.getFrequencies(path.resolve(__dirname, './txt/nosuchfile.txt')) }).should.throw(Error)
    })
  })
  describe('encode ' + fileInfo(path.resolve(__dirname, './txt/short.txt')), function () {
    it('should encode okay', function () {
      encode.encode(path.resolve(__dirname, './txt/short.txt'), path.resolve(__dirname, './txt/short-encoded.txt'))
    })
  })
})
