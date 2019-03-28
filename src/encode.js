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
  return new Promise((resolve, reject) => {
    let freqs = new FrequencyTable(
      new Array(257).fill(0)
    );
    fs.open(inputfile, 'r', function(err, fd) {
      if (err) {
        reject(err);
        return;
      }
      const buffer = Buffer.alloc(1);
      for (;;) {
        const num = fs.readSync(fd, buffer, 0, 1, null);
        if (num === 0) {
          fs.close(fd, () => resolve(freqs));
          break;
        }
        freqs.increment(buffer[0]);
        // console.log(buffer[0], freqs.get(buffer[0]));
      }
    });
  });
}

async function encode(inputfile, outputfile) {
  let freqs = await getFrequencies(inputfile);
  // EOF symbol gets a frequency of 1
  freqs.increment(256);
  
  const inStream = fs.createReadStream(inputfile);
  const bitout = new BitOutputStream(outputfile);
  
  writeFrequencies(bitout, freqs);
  compress(freqs, inStream, bitout);
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
 * @param {ReadableStream} inStream 
 * @param {BitOutputStream} bitout 
 */
async function compress(freqs, inStream, bitout) {
  let enc = new ArithmeticEncoder(32, bitout);
  await new Promise(resolve => {
    inStream.on('data', data => {
      // console.log('data = ', data);
      for (let byte of data) {
        // console.log(byte);
        // console.log('writing', byte);
        enc.write(freqs, byte);
      }
    });
    inStream.on('end', () => {
      // console.log('input stream closed');
      resolve();
    });
  });
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