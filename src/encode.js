const fs = require('fs');
const FrequencyTable = require('./frequency-table');
const BitOutputStream = require('./bit-output-stream');
const ArithmeticEncoder = require('./arithmetic-encoder');

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
  const temp = Buffer.alloc(100);
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
 * Decode a file using arithmetic coding algorithm
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
 * Write the frequency table to encoded file.
 * @param {BitOutputStream} bitout the output stream
 * @param {FrequencyTable} freqs 
 */
function writeFrequencies(bitout, freqs) {
  for (let i = 0; i < 256; i++) {
    // console.log(freqs);
    write_int(bitout, 32, freqs.get(i));
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
  let enc = new ArithmeticEncoder(32, bitout);
  let input = fs.openSync(inputfile, 'r');
  for(;;) {
    const temp = Buffer.alloc(100);
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

module.exports = {
  getFrequencies,
  encode
};