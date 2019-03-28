const fs = require('fs');
const FrequencyTable = require('./frequency-table');
const BitInputStream = require('./bit-input-stream');
const Long = require('long');
const ArithmeticDecoder = require('./arithmetic-decoder');

function decode(inputfile, outputfile) {
  // const inStream = fs.createReadStream(inputfile);
  // const outStream = fs.createWriteStream(outputfile);
  const bitin = new BitInputStream(inputfile);
  let freqs = readFrequencies(bitin);
  console.log(`freqs.total = ${freqs.total}`);
  decompress(freqs, bitin, outputfile);
}

function readFrequencies(bitin) {
  function readInt(n) {
    let result = new Long(0, 0);
    for (let i = 0; i < n; i++) {
      let tmp = bitin.readNoEOF();
      // console.log(tmp);
      result = result.shiftLeft(1).or(tmp); // Big endian
    }
    return result;
  }
  let freqs = [];
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    freqs[i] = readInt(32).toNumber();
    console.log(`freqs[${i}] = `, freqs[i]);
    acc += freqs[i];
    console.log(`acc = ${acc}`);
  }
  // console.log(freqs.reduce((a, b) => a+b));
  // EOF symbol
  freqs.push(1);
  return new FrequencyTable(freqs);
}

function decompress(freqs, bitin, outputfile) {
  let output = fs.openSync(outputfile, 'w');
  const dec = new ArithmeticDecoder(32, bitin);
  for (;;) {
    let symbol = dec.read(freqs);
    // EOF symbol
    if (symbol === 256) {
      dec.finish();
      break;
    }
    // console.log(`writing ${symbol}`);
    // output.wr();
    fs.writeSync(output, Buffer.from([symbol]), 0, 1, null);
  }
  fs.closeSync(output);
}

module.exports = {
  readFrequencies,
  decode
};