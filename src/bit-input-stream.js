const fs = require('fs')

const CACHE_SIZE = 20000

/**
 * A stream where bits can be read.
 * Because they come from an underlying byte stream,
 * the total number of bits is always a multiple of 8.
 * The bits are read in big endian.
 */
module.exports = class BitInputStream {
  /**
   *
   * @param {string} input file path
   */
  constructor (inputfile) {
    // The underlying file descriptor to read from
    this._input = fs.openSync(inputfile, 'r')

    // The accumulated bits for the current byte,
    // either in range [0x00, 0xFF] if bits are available,
    // or -1 if end of stream is reached
    this._currentbyte = 0
    // Number of accumulated bits in the current byte,
    // always in range [0, 7)
    this._numbitsremaining = 0

    this._cachedBytes = Buffer.alloc(0)
    this._streamEnded = false
  }

  /**
   * Reads a bit from this stream.
   * Returns 0 or 1 if a bit is available,
   * or -1 if the end of stream is reached.
   * The end of stream always occurs on a byte boundary.
   */
  read () {
    if (this._currentbyte === -1) {
      return -1
    }
    if (this._numbitsremaining === 0) {
      if (this._cachedBytes.length === 0) {
        if (this._streamEnded) {
          this._currentbyte = -1
          return -1
        } else {
          let temp = Buffer.alloc(CACHE_SIZE)
          let numOfBytesRead = fs.readSync(this._input, temp, 0, CACHE_SIZE, null)
          this._cachedBytes = temp.slice(0, numOfBytesRead)
          if (numOfBytesRead < CACHE_SIZE) {
            this._streamEnded = true
          }
        }
      }
      // console.log(`this._cachedBytes = ${this._cachedBytes}`);
      this._currentbyte = this._cachedBytes[0]
      this._cachedBytes = this._cachedBytes.slice(1)
      // console.log('Byte read:', temp);
      // console.log(this._currentbyte);
      this._numbitsremaining = 8
      // console.log(`this._numbitsremaining1 = ${this._numbitsremaining}`);
    }
    // console.log(`this._numbitsremaining2 = ${this._numbitsremaining}`);
    require('assert')(this._numbitsremaining > 0, 'Number of bits remaining should be positive')
    this._numbitsremaining -= 1
    // console.log(`this._currentbyte = ${this._currentbyte}`);
    // console.log(`this._numbitsremaining = ${this._numbitsremaining}`);
    return (this._currentbyte >> this._numbitsremaining) & 1
  }

  readNoEOF () {
    let result = this.read()
    if (result !== -1) {
      return result
    } else {
      throw new Error('Unexpected EOF')
    }
  }

  /**
   * Closes this stream and the underlying input stream.
   */
  close () {
    fs.closeSync(this._input)
    this._currentbyte = -1
    this._numbitsremaining = 0
  }
}
