const fs = require('fs')
const FrequencyTable = require('./frequency-table')
const BitInputStream = require('./bit-input-stream')
const BitInputStreamFromBuffer = require('./bit-input-stream-buffer')
const ArithmeticDecoder = require('./arithmetic-decoder')

const NUM_OF_BITS = 31

/**
 * Decode a file using arithmetic coding algorithm
 * @param {string} inputfile Absolute path of the input file
 * @param {string} outputfile Absolute path of the output file
 */
function decode (inputfile, outputfile) {
  // const inStream = fs.createReadStream(inputfile);
  // const outStream = fs.createWriteStream(outputfile);
  const bitin = new BitInputStream(inputfile)
  let freqs = readFrequencies(bitin)
  // console.log(`freqs.total = ${freqs.total}`);
  decompress(freqs, bitin, outputfile)
}

/**
 * Decode a Buffer using arithmetic coding algorithm
 * @param {Buffer} inBuffer Input buffer
 */
function decodeFromBuffer (inBuffer) {
  // const inStream = fs.createReadStream(inputfile);
  // const outStream = fs.createWriteStream(outputfile);
  const bitin = new BitInputStreamFromBuffer(inBuffer)
  let freqs = readFrequencies(bitin)
  // console.log(`freqs.total = ${freqs.total}`);
  return decompressToBuffer(freqs, bitin)
}

function readFrequencies (bitin) {
  function readInt (n) {
    let result = 0
    for (let i = 0; i < n; i++) {
      let tmp = bitin.readNoEOF()
      // console.log(tmp);
      result = result << 1 | tmp // Big endian
    }
    return result
  }
  let freqs = []
  // let acc = 0;
  for (let i = 0; i < 256; i++) {
    freqs[i] = readInt(NUM_OF_BITS)
    // console.log(`freqs[${i}] = `, freqs[i]);
    // acc += freqs[i];
    // console.log(`acc = ${acc}`);
  }
  // console.log(freqs.reduce((a, b) => a+b));
  // EOF symbol
  freqs.push(1)
  return new FrequencyTable(freqs)
}

function decompress (freqs, bitin, outputfile) {
  let output = fs.openSync(outputfile, 'w')
  let bytes = []
  const dec = new ArithmeticDecoder(NUM_OF_BITS, bitin)
  for (;;) {
    let symbol = dec.read(freqs)
    // EOF symbol
    if (symbol === 256) {
      dec.finish()
      break
    }
    // console.log(`writing ${symbol}`);
    // output.wr();
    bytes.push(symbol)
  }
  fs.writeSync(output, Buffer.from(bytes), 0, bytes.length, null)
  fs.closeSync(output)
}

/**
 *
 * @param {FrequencyTable} freqs
 * @param {BitInputStreamFromBuffer} bitin
 */
function decompressToBuffer (freqs, bitin) {
  let buffer = Buffer.alloc(0)
  let bytes = []
  const dec = new ArithmeticDecoder(NUM_OF_BITS, bitin)
  for (;;) {
    let symbol = dec.read(freqs)
    // EOF symbol
    if (symbol === 256) {
      dec.finish()
      break
    }
    // console.log(`writing ${symbol}`);
    bytes.push(symbol)
  }
  buffer = Buffer.from(bytes)
  return buffer
}

module.exports = {
  readFrequencies,
  decode,
  decodeFromBuffer
}
