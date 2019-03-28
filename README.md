# arithmetic-coding

<p align="center">
  <a href="https://travis-ci.com/upupming/arithmetic-coding/builds"><img src="https://img.shields.io/travis/com/upupming/arithmetic-coding.svg?style=popout-square" alt="travis build status"></a>
  <a href="https://github.com/upupming/arithmetic-coding/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg?style=popout-square" alt="License"></a>
  <a href="https://coveralls.io/github/upupming/arithmetic-coding?branch=master"><img src="https://img.shields.io/coveralls/github/upupming/arithmetic-coding.svg?style=popout-square" alt="Coveralls"></a>
</p>

## Installation

Install as module:

```js
npm i arithmetic-coding
```

Or install as global CLI:

```js
npm i -g arithmetic-coding
```

## API

Simply call `encode` and `decode` function.

```js
const ariCoding = require('arithmetic-coding');
// Encode
ariCoding.encode(__dirname + '/txt/long.txt', __dirname + '/txt/long-encoded.txt');
// Decode
ariCoding.decode(__dirname + '/txt/long-encoded.txt', __dirname + '/txt/long-decoded.txt');
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
```