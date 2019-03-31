const assert = require('assert')
const Coder = require('./coder')

module.exports = class ArithmeticDecoder extends Coder {
  /**
   *
   * @param {number} numbits
   * @param {BitInputStream} bitin
   */
  constructor (numbits, bitin) {
    super(numbits)

    // The underlying bit input stream.
    this._input = bitin
    // The current raw code bits being buffered, which is always in the range [low, high].
    this._code = 0
    for (let i = 0; i < this._num_state_bits; i++) {
      this._code = (this._code << 1) | this.readCodeBit()
      // console.log(`this._code_init = ${this._code}`);
    }
    // console.log(`this._code = ${this._code}`);
  }

  /**
   * Decodes the next symbol based on the given frequency table and returns it.
   * Also updates this arithmetic coder's state and may read in some bits.
   * @param {FrequencyTable} freqs
   */
  read (freqs) {
    // Translate from coding range scale to frequency table scale
    let total = freqs.total
    if (this._maximum_total >>> 0 < total >>> 0) {
      throw new RangeError('Cannot decode symbol because total is too large')
    }
    let range = ((this._high - this._low) + 1) >>> 0
    let offset = this._code - this._low
    let value = Math.floor((((offset + 1) * total) - 1) / range)
    // console.log(`this._code_cal = ${this._code}, offset = ${offset}, value = ${value}`);
    assert(Math.floor((value * range) / total) >>> 0 <= offset >>> 0)
    // console.log(`range = ${range.toString(16)}`);
    // console.log(`offset = ${offset.toString(16)}`);
    // console.log(`value = ${value.toString(16)}`);
    // console.log(`total = ${total.toString(16)}, ${typeof total}`);
    assert((value >>> 0 >= 0) && (value >>> 0 < total >>> 0))

    // A kind of binary search.
    // Find highest symbol such that freqs.get_low(symbol) <= value.
    let start = 0
    let end = freqs.symbolLimit
    // console.log(`start = ${start}, end = ${end}, value = ${value.toNumber()}`);
    while (end - start > 1) {
      let middle = (start + end) >>> 1
      // console.log(`freqs.getLow(middle) = ${freqs.getLow(middle)}`);
      if (value >>> 0 < freqs.getLow(middle)) {
        end = middle
      } else {
        start = middle
      }
      // console.log(`start = ${start}, end = ${end}`);
    }

    assert(start + 1 === end)

    let symbol = start
    assert(
      (Math.floor((range * (freqs.getLow(symbol))) / (total)) >>> 0 <= offset >>> 0) &&
      offset >>> 0 <= Math.floor(range * (freqs.getHigh(symbol)) / (total)) >>> 0
    )
    this.update(freqs, symbol)
    if (!(this._low >>> 0 <= this._code >>> 0 && this._code >>> 0 <= this._high >>> 0)) {
      throw new RangeError('Code out of range')
    }
    // console.log('symbol', symbol);
    return symbol
  }

  // Returns the next bit (0 or 1) from the input stream. The end
  // of stream is treated as an infinite number of trailing zeros.
  readCodeBit () {
    let temp = this._input.read()
    // console.log(`readCodeBit: ${temp}`);
    if (temp === -1) {
      temp = 0
    }
    return temp
  }

  _shift () {
    this._code = (this._code << 1) & (this._state_mask) | (this.readCodeBit())
    // console.log(`this._code_shift = ${this._code}`);
  }
  _underflow () {
    this._code = this._code & (this._half_range) | (
      this._code << 1 & (this._state_mask >>> 1)
    ) | (this.readCodeBit())
    // console.log(`this._code_underflow = ${this._code}`);
  }
  finish () {
    this._input.close()
  }
}
