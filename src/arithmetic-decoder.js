const Long = require('long');
const assert = require('assert');

module.exports = class ArithmeticDecoder {
  /**
   * 
   * @param {number} numbits 
   * @param {BitInputStream} bitin 
   */
  constructor(numbits, bitin) {
    if (numbits < 1) {
      throw Error('State size out of range');
    }
    // -- Configuration fields --
    // Number of bits for the 'low' and 'high' state variables. Must be at least 1.
    // - Larger values are generally better - they allow a larger maximum frequency total (maximum_total),
    //   and they reduce the approximation error inherent in adapting fractions to integers;
    //   both effects reduce the data encoding loss and asymptotically approach the efficiency
    //   of arithmetic coding using exact fractions.
    // - But larger state sizes increase the computation time for integer arithmetic,
    //   and compression gains beyond ~30 bits essentially zero in real-world applications.
    // - Python has native bigint arithmetic, so there is no upper limit to the state size.
    //   For Java and C++ where using native machine-sized integers makes the most sense,
    //   they have a recommended value of num_state_bits=32 as the most versatile setting.
    this._num_state_bits = numbits;
    // console.log(`this._num_state_bits: ${this._num_state_bits}`);
    // Maximum range (high+1-low) during coding (trivial), which is 2^num_state_bits = 1000...000.
    this._full_range = new Long(1, 0).shiftLeft(numbits);
    // console.log(`this._full_range: ${this._full_range.toString(16)}`);
    // The top bit at width num_state_bits, which is 0100...000.
    this._half_range = this._full_range.shiftRightUnsigned(1); // Non-zero
    // The second highest bit at width num_state_bits, which is 0010...000. This is zero when num_state_bits=1.
    this._quarter_range = this._half_range.shiftRightUnsigned(1); // Can be zero
    // Minimum range (high+1-low) during coding (non-trivial), which is 0010...010.
    this._minimum_range = this._quarter_range.add(2); // At least 2
    // Maximum allowed total from a frequency table at all times during coding. This differs from Java
    // and C++ because Python's native bigint avoids constraining the size of intermediate computations.
    this._maximum_total = this._minimum_range;
    // console.log(`this._maximum_total: ${this._maximum_total.toString(16)}`);
    // Bit mask of num_state_bits ones, which is 0111...111.
    this._state_mask = this._full_range.sub(1);
    // console.log(`this._state_mask: ${this._state_mask.toString(16)}`);

    // -- State fields --
    // Low end of this arithmetic coder's current range. Conceptually has an infinite number of trailing 0s.
    this._low = new Long(0, 0);
    // console.log(`this._low: ${this._low.toString(16)}`);
    // High end of this arithmetic coder's current range. Conceptually has an infinite number of trailing 1s.
    this._high = this._state_mask;
    // console.log(`this._high: ${this._high.toString(16)}`);


    // The underlying bit input stream.
    this._input = bitin;
    // The current raw code bits being buffered, which is always in the range [low, high].
    this._code = new Long(0, 0);
    for (let i = 0; i < this._num_state_bits; i++) {
      this._code = this._code.shiftLeft(1).or(this.readCodeBit());
      // console.log(`this._code_init = ${this._code}`);
    }
    // console.log(`this._code = ${this._code}`);
  }

  /**
   * Decodes the next symbol based on the given frequency table and returns it.
   * Also updates this arithmetic coder's state and may read in some bits.
   * @param {FrequencyTable} freqs 
   */
  read(freqs) {
    // Translate from coding range scale to frequency table scale
    let total = freqs.total;
    if (this._maximum_total.lessThan(total)) {
      throw RangeError('Cannot decode symbol because total is too large');
    }
    let range = this._high.sub(this._low).add(1);
    let offset = this._code.sub(this._low);
    let value = offset.add(1).mul(total).sub(1).div(range);
    // console.log(`this._code_cal = ${this._code}, offset = ${offset}, value = ${value}`);
    assert(value.mul(range).div(total).lessThanOrEqual(offset));
    // console.log(`value = ${value.toString(16)}`);
    // console.log(`total = ${total.toString(16)}`);
    assert(value.greaterThanOrEqual(0) && value.lessThan(total));

    // A kind of binary search. 
    // Find highest symbol such that freqs.get_low(symbol) <= value.
    let start = 0;
    let end = freqs.symbolLimit;
    // console.log(`start = ${start}, end = ${end}, value = ${value.toNumber()}`);
    while (end - start > 1) {
      let middle = (start + end) >>> 1;
      // console.log(`freqs.getLow(middle) = ${freqs.getLow(middle)}`);
      if (value.lessThan(freqs.getLow(middle))) {
        end = middle;
      } else {
        start = middle;
      }
      // console.log(`start = ${start}, end = ${end}`);
    }

    assert(start + 1 === end);

    let symbol = start;
    assert(
      range.mul(freqs.getLow(symbol)).div(total).lessThanOrEqual(offset) &&
      offset.lessThan(range.mul(freqs.getHigh(symbol)).div(total))
    );
    this.update(freqs, symbol);
    if (!(this._low.lessThanOrEqual(this._code) && this._code.lessThanOrEqual(this._high))) {
      throw new RangeError('Code out of range');
    }
    // console.log('symbol', symbol);
    return symbol;
  }

  // Returns the next bit (0 or 1) from the input stream. The end
  // of stream is treated as an infinite number of trailing zeros.
  readCodeBit() {
    let temp = this._input.read();
    // console.log(`readCodeBit: ${temp}`);
    if (temp === -1) {
      temp = 0;
    }
    return temp;
  }

  // Updates the code range (low and high) of this arithmetic coder as a result
  // of processing the given symbol with the given frequency table.
  // Invariants that are true before and after encoding/decoding each symbol
  // (letting full_range = 2^num_state_bits):
  // - 0 <= low <= code <= high < full_range. ('code' exists only in the decoder.)
  //   Therefore these variables are unsigned integers of num_state_bits bits.
  // - low < 1/2 * full_range <= high.
  //   In other words, they are in different halves of the full range.
  // - (low < 1/4 * full_range) || (high >= 3/4 * full_range).
  //   In other words, they are not both in the middle two quarters.
  // - Let range = high - low + 1, then full_range/4 < minimum_range
  //   <= range <= full_range. These invariants for 'range' essentially
  //   dictate the maximum total that the incoming frequency table can have.
  update(freqs, symbol) {
    // State check
    let low = this._low;
    let high = this._high;
    // console.log(`======== Updating ${symbol} =========`);
    // console.log(`this._low = ${this._low.toString(16)}`, `this._high = ${this._high.toString(16)}`);
    if (low.greaterThanOrEqual(high) || low.and(this._state_mask).notEquals(low) || high.and(this._state_mask).notEquals(high)) {
      throw RangeError('Low or high out of range');
    }
    let range = high.sub(low).add(1);
    if (!(this._minimum_range.lessThanOrEqual(range) && range.lessThanOrEqual(this._full_range))) {
      throw RangeError('Range out of range');
    }

    // Frequency table values check
    let total = freqs.total;
    let symlow = freqs.getLow(symbol);
    let symhigh = freqs.getHigh(symbol);
    // console.log(`symlow = ${symlow.toString(16)}`, `symhigh = ${symhigh.toString(16)}`);
    // console.log(`total = ${total}`);
    if (symlow === symhigh) {
      throw Error('Symbol has zero frequency');
    }
    if (this._maximum_total.lessThan(total)) {
      throw Error('Cannot code symbol because total is too large');
    }

    // Update 
    let newlow = low.add(range.mul(symlow).div(total));
    let newhigh = low.add(range.mul(symhigh).div(total)).sub(1);
    this._low = newlow;
    this._high = newhigh;
    // console.log(`newlow = ${newlow.toString(16)}`, `newhigh = ${newhigh.toString(16)}`);

    // While low and high have the same top bit value, shift them out
    while (((this._low.xor(this._high)).and(this._half_range)).equals(0)) {
      this._shift();
      this._low = this._low.shiftLeft(1).and(this._state_mask);
      this._high = this._high.shiftLeft(1).and(this._state_mask).or(1);
    }

    // Now low's top bit must be 0 and high's top bit must be 1

    // While low's top two bits are 01 and high's are 10, delete the second highest bit of both
    while ((this._low.and(this._high.not()).and(this._quarter_range)).notEquals(0)) {
      this._underflow();
      this._low = this._low.shiftLeft(1).xor(this._half_range);
      this._high = this._high.xor(this._half_range).shiftLeft(1).or(this._half_range).or(1);
    }
  }

  _shift() {
    this._code = this._code.shiftLeft(1).and(this._state_mask).or(this.readCodeBit());
    // console.log(`this._code_shift = ${this._code}`);
  }
  _underflow() {
    this._code = this._code.and(this._half_range).or(
      this._code.shiftLeft(1).and(this._state_mask.shiftRightUnsigned(1))
    ).or(this.readCodeBit());
    // console.log(`this._code_underflow = ${this._code}`);
  }
  finish() {
    this._input.close();
  }
};