# arithmetic-coding

<a href="https://travis-ci.com/upupming/arithmetic-coding/builds"><img src="https://img.shields.io/travis/com/upupming/arithmetic-coding.svg?style=popout-square" alt="travis build status"></a>
<a href="https://github.com/upupming/arithmetic-coding/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg?style=popout-square" alt="License"></a>
<a href="https://coveralls.io/github/upupming/arithmetic-coding?branch=master"><img src="https://img.shields.io/coveralls/github/upupming/arithmetic-coding.svg?style=popout-square" alt="Coveralls"></a>
<a href="https://www.npmjs.com/package/arithmetic-coding"><img src="https://img.shields.io/npm/v/arithmetic-coding.svg?style=flat-square" alt="npm"></a>

- English Documentation
- [Chinese Documentation](./README-zh.md)

## Installation

Install as module for API usage:

```js
npm i arithmetic-coding
```

Or install as global CLI:

```js
npm i -g arithmetic-coding
```

## API

From file path:

```js
const ariCoding = require('arithmetic-coding');
// Encode from file
ariCoding.encode(__dirname + '/txt/long.txt', __dirname + '/txt/long-encoded.txt');
// Decode from file
ariCoding.decode(__dirname + '/txt/long-encoded.txt', __dirname + '/txt/long-decoded.txt');
```

From `Buffer`:

```js
let data = Buffer.from('Example data', 'utf8');
// Encode from Buffer
let encoded = encode.encodeFromBuffer(data);
console.log(`encoded = ${encoded}`);
// Decode from Buffer
let decoded = decode.decodeFromBuffer(encoded);
console.log(`decoded = ${decoded}`);
```

## Command-line interface

```js
$ ari-coding -h
Usage: index [options] [command]

Options:
  -v, --version              output the version number
  -h, --help                 output usage information

Commands:
  encode|e [options] <file>  encode a file
  decode|d [options] <file>  decode a file

$ ari-coding encode -h
Usage: encode|e [options] <file>

encode a file

Options:
  -o, --output <file>  output file path
  -h, --help           output usage information
```

## Performance

You can see the latest [travis test](https://travis-ci.com/upupming/arithmetic-coding) for running time used by each test.

Some benchmarks are shown below:

| File size (Bytes) | total time | encode time | decode time |
| ----------------- | ---------- | ----------- | ----------- |
| 60640             | 110ms      | small       | 110ms       |
| 2130640           | 2940ms     | 426ms       | 2514ms      |

## About the algorithm

1. [Wikipedia](https://en.wikipedia.org/wiki/Arithmetic_coding)
2. [How to implement practical encoder/decoder](http://www.drdobbs.com/cpp/data-compression-with-arithmetic-encodin/240169251)
3. [Reference-arithmetic-coding on GitHub](https://github.com/nayuki/Reference-arithmetic-coding)