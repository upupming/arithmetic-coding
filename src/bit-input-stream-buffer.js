/**
 * A stream where bits can be read. 
 * Because they come from an underlying byte stream,
 * the total number of bits is always a multiple of 8. 
 * The bits are read in big endian.
 */
module.exports = class BitInputStreamFromBuffer {
  /**
   * 
   * @param {Buffer} inBuffer 
   */
  constructor(inBuffer) {
    // The underlying buffer to read from
    this._buffer = inBuffer;

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
      if (this._buffer.length === 0) {
        this._currentbyte = -1;
        return -1;
      }
      // console.log(`this._cachedBytes = ${this._cachedBytes}`);
      this._currentbyte = this._buffer[0];
      this._buffer = this._buffer.slice(1);
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
    this._currentbyte = -1;
    this._numbitsremaining = 0;
  }
};