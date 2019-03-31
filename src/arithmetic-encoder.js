const Coder = require('./coder');

module.exports = class ArithmeticEncoder extends Coder {
  /**
   * 
   * @param {number} numbits 
   * @param {BitOutputStream} bitout 
   */
  constructor(numbits, bitout) {
    super(numbits);

    // The underlying bit output stream.
    this._output = bitout;
    // Number of saved underflow bits. This value can grow without bound.
    this._num_underflow = 0;
  }

  /**
   * Encodes the given symbol based on the given frequency table.
   * This updates this arithmetic coder's state and may write out some bits. 
   * @param {*} freqs 
   * @param {*} symbol 
   */
  write(freqs, symbol) {
    // console.log('writing symbol', symbol);
    this.update(freqs, symbol);
  }
  /**
   * Terminates the arithmetic coding by flushing any buffered bits, so that the output can be decoded properly.
   * It is important that this method must be called at the end of the each encoding process.
   * Note that this method merely writes data to the underlying output stream but does not close it.
   */
  finish() {
    this._output.write(1);
    this._output.close();
  }
  _shift() {
    let bit = this._low >>> (this._num_state_bits - 1);
    // console.log(`bit = ${bit}`);
    this._output.write(bit);

    // Write out the saved underflow bits
    for (let i = 0; i < this._num_underflow; i++) {
      // console.log(`bit ^ 1 = ${bit ^ 1}`);
      this._output.write(bit ^ 1);
    }
    this._num_underflow = 0;
  }
  _underflow() {
    this._num_underflow += 1;
  }
};