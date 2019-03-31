module.exports = class Coder {
  constructor (numbits) {
    if (numbits < 1) {
      throw new Error('State size out of range')
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
    this._num_state_bits = numbits
    // console.log(`this._num_state_bits: ${this._num_state_bits}`);
    // Maximum range (high+1-low) during coding (trivial), which is 2^num_state_bits = 1000...000.
    this._full_range = 1 << numbits >>> 0
    // console.log(`this._full_range: ${this._full_range.toString(16)}`);
    // The top bit at width num_state_bits, which is 0100...000.
    this._half_range = this._full_range >>> 1
    // The second highest bit at width num_state_bits, which is 0010...000. This is zero when num_state_bits=1.
    this._quarter_range = this._half_range >>> 1 // Can be zero
    // Minimum range (high+1-low) during coding (non-trivial), which is 0010...010.
    this._minimum_range = this._quarter_range + 2 // At least 2
    // Maximum allowed total from a frequency table at all times during coding. This differs from Java
    // and C++ because Python's native bigint avoids constraining the size of intermediate computations.
    this._maximum_total = this._minimum_range
    // console.log(`this._maximum_total: ${this._maximum_total.toString(16)}`);
    // Bit mask of num_state_bits ones, which is 0111...111.
    this._state_mask = this._full_range - 1
    // console.log(`this._state_mask: ${this._state_mask.toString(16)}`);

    // -- State fields --
    // Low end of this arithmetic coder's current range. Conceptually has an infinite number of trailing 0s.
    this._low = 0
    // console.log(`this._low: ${this._low.toString(16)}`);
    // High end of this arithmetic coder's current range. Conceptually has an infinite number of trailing 1s.
    this._high = this._state_mask
    // console.log(`this._high: ${this._high.toString(16)}`);
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
  update (freqs, symbol) {
    // State check
    let low = this._low
    let high = this._high
    // console.log(`======== Updating ${symbol} =========`);
    // console.log(`this._low = ${this._low.toString(16)}`);
    // console.log(`this._high = ${this._high.toString(16)}`);
    // console.log(`low & this._state_mask = ${low & this._state_mask.toString(16)}`);
    // console.log(`high & (this._state_mask) = ${high & (this._state_mask).toString(16)}`);
    if (low >>> 0 >= high >>> 0 || ((low & this._state_mask) !== low) || ((high & (this._state_mask)) !== high)) {
      throw new RangeError(`Low or high out of range, low = ${low}, high = ${high}`)
    }
    let range = high - low + 1
    // console.log(`range = ${range.toString(16)}`);
    if (!(this._minimum_range >>> 0 <= range >>> 0 && range >>> 0 <= this._full_range >>> 0)) {
      throw new RangeError('Range out of range')
    }

    // Frequency table values check
    let total = freqs.total
    let symlow = freqs.getLow(symbol)
    let symhigh = freqs.getHigh(symbol)
    // console.log(`symlow = ${symlow.toString(16)}`);
    // console.log(`symhigh = ${symhigh.toString(16)}`);
    if (symlow === symhigh) {
      throw new Error('Symbol has zero frequency')
    }
    if (this._maximum_total >>> 0 <= total >>> 0) {
      throw new Error('Cannot code symbol because total is too large')
    }

    // Update
    // console.log(`total = ${total.toString(16)}`);
    let newlow = low + Math.floor(range * symlow / total)
    let newhigh = low + Math.floor(range * symhigh / total) - 1
    // console.log(`newlow = ${newlow.toString(16)}`);
    // console.log(`newhigh = ${newhigh.toString(16)}`);
    this._low = newlow
    this._high = newhigh

    // While low and high have the same top bit value, shift them out
    while (((this._low ^ this._high) & (this._half_range)) === 0) {
      this._shift()
      this._low = (this._low << 1) & (this._state_mask)
      this._high = (this._high << 1) & (this._state_mask) | 1
    }

    // Now low's top bit must be 0 and high's top bit must be 1

    // While low's top two bits are 01 and high's are 10, delete the second highest bit of both
    while ((this._low & (~this._high) & (this._quarter_range)) !== 0) {
      this._underflow()
      this._low = (this._low << 1) ^ (this._half_range)
      this._high = ((this._high ^ (this._half_range)) << 1) | this._half_range | 1
    }
  }
}
