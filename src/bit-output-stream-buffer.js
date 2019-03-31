/**
 * A stream where bits can be written to.
 * Because they are written to an underlying byte stream,
 * the end of the stream is padded with 0's up to a multiple of 8 bits.
 * The bits are written in big endian.
 */
module.exports = class BitOutputStreamToBuffer {
  constructor () {
    // The underlying file stream to write to
    this._bytes = []
    // The accumulated bits for the current byte,
    // always in range [0x00, 0xFF]
    this._currentbyte = 0
    // Number of accumulated bits in the current byte,
    // always in range [0, 7)
    this._numbitsfilled = 0
  }

  /**
   * Write a bit to the stream. The given bit must be 0 or 1.
   */
  write (b) {
    if (b !== 0 && b !== 1) {
      throw new RangeError(`Bit to write must be 0 or 1, but got ${b.toString()}`)
    }
    this._currentbyte = (this._currentbyte << 1) | b
    this._numbitsfilled += 1
    if (this._numbitsfilled === 8) {
      this._bytes.push(this._currentbyte)
      this._currentbyte = 0
      this._numbitsfilled = 0
    }
  }
  close () {
    while (this._numbitsfilled !== 0) {
      this.write(0)
    }
  }
  get buffer () {
    return Buffer.from(this._bytes)
  }
}
