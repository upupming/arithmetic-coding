const assert = require('assert')

/**
 * A mutable table of symbol frequencies. The number
 * of symbols cannot be changed after construction.
 * The current algorithm for calculating cumulative
 * frequencies takes linear time, but there exist faster
 * algorithms such as Fenwick trees.
 *
 * For example:
 *  symbols: 0, 1, 2, 3
 *  freqs:   3, 4, 5, 6
 *  total: 18
 *  cumulative:   3, 7, 12, 18
 */
module.exports = class FrequencyTable {
  /**
   * Constructs a simple frequency table in one of two ways:
   * 1. FrequencyTable(array):
   *    Build a frequency table from the given sequence of symbol frequencies
   * 2. FrequencyTable(freqtable):
   *    Builds a frequency table by copying the given frequency table
   */
  constructor (freqs) {
    if (freqs instanceof FrequencyTable) {
      let symbolLimit = freqs.symbolLimit
      this._frequencies = []
      for (let i = 0; i < symbolLimit; i++) {
        this._frequencies[i] = freqs.get(i)
      }
    } else { // Assume it is an array sequence
      this._frequencies = Array.from(freqs)
    }

    // `_frequencies` is an array of the frequency for each symbol.
    // Its length is at least 1, ans each element is non-negative.
    if (this._frequencies.length < 1) {
      throw new Error('At least 1 symbol needed')
    }
    this._frequencies.forEach(freq => {
      if (freq < 0) {
        throw new RangeError('Negative frequency')
      }
    })

    // Always equal to the sum of `frequencies`
    this._total = this._frequencies.reduce((partialSum, a) => partialSum + a)

    // _cumulative[i] is the sum of `frequencies` in range [0, i)
    // Initialized lazily. When it is no None, the data is valid.
    this._cumulative = null
  }

  /**
   * Returns the number of symbols in this frequencies table,
   * which is at least 1.
   */
  get symbolLimit () {
    return this._frequencies.length
  }
  /**
   * Returns the total of all symbol frequencies.
   * The returned value is at least 0 and is always equal to
   * `getHigh(symbolLimit - 1)`
   */
  get total () {
    // console.log(this._frequencies.toString());
    return this._total
  }
  /**
   * Returns the sum of the frequencies of all the symbols strictly
   * below the given symbol value.
   * The returned value is at least 0.
   */
  getLow (symbol) {
    if (symbol === 0) return 0
    this._checkSymbol(symbol - 1)
    if (this._cumulative === null) {
      this._initCumulative()
    }
    return this._cumulative[symbol - 1]
  }
  /**
   * Returns the sum of the frequencies of the given symbol and all the
   * symbols below the given symbol value.
   * The returned value is at least 0.
   */
  getHigh (symbol) {
    this._checkSymbol(symbol)
    if (this._cumulative === null) {
      this._initCumulative()
    }
    return this._cumulative[symbol]
  }

  /**
   * Returns the frequency of the given symbol.
   * The returned value is at least 0.
   * @param {number} symbol in range [0, symbolLimit)
   */
  get (symbol) {
    this._checkSymbol(symbol)
    return this._frequencies[symbol]
  }
  /**
   * Sets the frequency of the given symbol to the given value.
   * The frequency value must be at least 0.
   * If an error is thrown, then the state is left unchanged.
   * @param {number} symbol
   * @param {number} freq >= 0
   */
  set (symbol, freq) {
    this._checkSymbol(symbol)
    if (freq < 0) {
      throw new RangeError('Negative frequency')
    }
    let sumFreqOfOthers = this._total - this._frequencies[symbol]
    assert(
      sumFreqOfOthers >= 0,
      'Sum of frequency of other symbols should be non-negative'
    )
    this._total = sumFreqOfOthers + freq
    this._frequencies[symbol] = freq
    this._cumulative = null
  }
  /**
   * Increments the frequency of the given symbol
   * @param {number} symbol
   */
  increment (symbol) {
    this._checkSymbol(symbol)
    this._total += 1
    this._frequencies[symbol] += 1
    this._cumulative = null
  }
  _checkSymbol (symbol) {
    if (symbol >= 0 && symbol < this._frequencies.length) {

    } else {
      throw new RangeError('Symbol out of range')
    }
  }
  /**
   * Recomputes the array of cumulative symbol frequencies.
   * For example:
   *    if _frequencies = [1, 2, 3, 4]
   *    then _cumulative = [1, 3, 6, 10]
   */
  _initCumulative () {
    let cumul = Array.from(this._frequencies)
    for (let i = 1; i < cumul.length; i++) {
      cumul[i] += cumul[i - 1]
    }
    this._cumulative = cumul
  }
  /**
   * Returns a string representation of this frequency table,
   * useful for debugging only, and the format is subject to change.
   */
  toString () {
    let result = ''
    for (let i = 0; i < this._frequencies.length; i++) {
      result += `${i}\t${this._frequencies[i]}\n`
    }
    return result
  }
}
