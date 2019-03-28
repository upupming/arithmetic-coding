const fs = require('fs');
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
  constructor(inputfile) {
    // The underlying file descriptor to read from
    this._input = fs.openSync(inputfile, 'r');

    // The accumulated bits for the current byte,
    // either in range [0x00, 0xFF] if bits are available,
    // or -1 if end of stream is reached
    this._currentbyte = 0;
    // Number of accumulated bits in the current byte,
    // always in range [0, 7)
    this._numbitsremaining = 0;
  }

  /**
   * Reads a bit from this stream. 
   * Returns 0 or 1 if a bit is available, 
   * or -1 if the end of stream is reached.
   * The end of stream always occurs on a byte boundary.
   */
  read() {
    if (this._currentbyte === -1) {
      return -1;
    }
    if (this._numbitsremaining === 0) {
      // console.log(`this._numbitsremaining0 = ${this._numbitsremaining}`);
      let temp = Buffer.alloc(1);
      let numOfBytesRead = fs.readSync(this._input, temp, 0, 1, null);
      console.log(`numOfBytes read: ${numOfBytesRead}`);
      // console.log(`position = ${this._position}`);
      if (numOfBytesRead === 0) {
        this._currentbyte = -1;
        return -1;
      }
      this._currentbyte = temp[0];
      console.log('Byte read:', temp);
      // console.log(this._currentbyte);
      this._numbitsremaining = 8;
      // console.log(`this._numbitsremaining1 = ${this._numbitsremaining}`);
    }
    // console.log(`this._numbitsremaining2 = ${this._numbitsremaining}`);
    require('assert')(this._numbitsremaining > 0, 'Number of bits remaining should be positive');
    this._numbitsremaining -= 1;
    // console.log(`this._currentbyte = ${this._currentbyte}`);
    // console.log(`this._numbitsremaining = ${this._numbitsremaining}`);
    return (this._currentbyte >> this._numbitsremaining) & 1; 
  }

  readNoEOF() {
    let result = this.read();
    if (result !== -1) {
      return result;
    } else {
      throw Error('Unexpected EOF');
    }
  }

  /**
   * Closes this stream and the underlying input stream.
   */
  close() {
    fs.closeSync(this._input);
    this._currentbyte = -1;
    this._numbitsremaining = 0;
  }
};