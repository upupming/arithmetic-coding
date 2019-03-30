const fs = require('fs');
const FrequencyTable = require('./frequency-table');
const BitOutputStream = require('./bit-output-stream');
const BitOutputStreamToBuffer = require('./bit-output-stream-buffer');
const ArithmeticEncoder = require('./arithmetic-encoder');

const CACHE_SIZE = 20000;
const NUM_OF_BITS = 31;

/**
 * Returns a frequency table based on the bytes 
 * in the given file.
 * Also contains an extra entry for symbol 256,
 * whose frequency is set to 0.
 * @param {string} inputfile obsolute path of a file
 */
function getFrequencies(inputfile) {
  let input = fs.openSync(inputfile, 'r');
  let freqs = new FrequencyTable(
    new Array(257).fill(0)
  );
  const temp = Buffer.alloc(CACHE_SIZE);
  let bytesRead;
  for (;;) {
    if((bytesRead = fs.readSync(input, temp, 0, temp.length, null)) === 0) {
      break;
    } else {
      for (let i = 0; i < bytesRead; i++) {
        freqs.increment(temp[i]);
      }
    }
  }
  return freqs;
}

/**
 * Returns a frequency table based on the bytes 
 * in the given Buffer.
 * Also contains an extra entry for symbol 256,
 * whose frequency is set to 0.
 * @param {Buffer} buffer 
 */
function getFrequenciesFromBuffer(buffer) {
  let freqs = new FrequencyTable(
    new Array(257).fill(0)
  );
  for (let byte of buffer) {
    freqs.increment(byte);
  }
  return freqs;
}

/**
 * Encode a file using arithmetic coding algorithm
 * @param {string} inputfile Absolute path of the input file
 * @param {string} outputfile Absolute path of the output file
 */
function encode(inputfile, outputfile) {
  let freqs = getFrequencies(inputfile);
  // EOF symbol gets a frequency of 1
  freqs.increment(256);
  
  const bitout = new BitOutputStream(outputfile);
  
  writeFrequencies(bitout, freqs);
  compress(freqs, inputfile, bitout);
}

/**
 * Encode a Buffer using arithmetic coding algorithm
 * @param {Buffer} inBuffer Input buffer
 */
function encodeFromBuffer(inBuffer) {
  let freqs = getFrequenciesFromBuffer(inBuffer);
  // EOF symbol gets a frequency of 1
  freqs.increment(256);
  
  const bitout = new BitOutputStreamToBuffer();
  
  writeFrequencies(bitout, freqs);
  compressFromBuffer(freqs, inBuffer, bitout);
  return bitout.buffer;
}

/**
 * Write the frequency table to encoded file.
 * @param {BitOutputStream} bitout the output stream
 * @param {FrequencyTable} freqs 
 */
function writeFrequencies(bitout, freqs) {
  for (let i = 0; i < 256; i++) {
    // console.log(freqs);
    write_int(bitout, NUM_OF_BITS, freqs.get(i));
  }
}

/**
 * 
 * @param {BitOutputStream} bitout the output stream
 * @param {number} numbits 
 * @param {byte} value 
 */
function write_int(bitout, numbits, value) {
  for (let i = numbits - 1; i >= 0; i--) {
    // Big endian
    bitout.write((value >> i) & 1);
  }
}

/**
 * 
 * @param {FrequencyTable} freqs 
 * @param {string} inputfile 
 * @param {BitOutputStream} bitout 
 */
function compress(freqs, inputfile, bitout) {
  let enc = new ArithmeticEncoder(NUM_OF_BITS, bitout);
  let input = fs.openSync(inputfile, 'r');
  for(;;) {
    const temp = Buffer.alloc(CACHE_SIZE);
    let bytesRead;
    if ((bytesRead = fs.readSync(input, temp, 0, temp.length, null)) === 0) {
      break;
    } else {
      for (let i = 0; i < bytesRead; i++) {
        enc.write(freqs, temp[i]);
      }
    }
  }
  // EOF
  enc.write(freqs, 256);
  // Flush remaining code bit
  enc.finish();
  // console.log('Encoded okay!');
}

/**
 * 
 * @param {FrequencyTable} freqs 
 * @param {Buffer} inBuffer 
 * @param {BitOutputStreamToBuffer} bitout 
 */
function compressFromBuffer(freqs, inBuffer, bitout) {
  let enc = new ArithmeticEncoder(NUM_OF_BITS, bitout);
  for (let byte of inBuffer) {
    enc.write(freqs, byte);
  }
  // EOF
  enc.write(freqs, 256);
  // Flush remaining code bit
  enc.finish();
  // console.log('Encoded okay!');
}

module.exports = {
  getFrequencies,
  encode,
  encodeFromBuffer
};