# arithmetic-coding

<p align="center">
  <a href="https://travis-ci.com/upupming/arithmetic-coding/builds"><img src="https://img.shields.io/travis/com/upupming/arithmetic-coding.svg?style=popout-square" alt="travis build status"></a>
  <a href="https://github.com/upupming/arithmetic-coding/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg?style=popout-square" alt="License"></a>
  <a href="https://coveralls.io/github/upupming/arithmetic-coding?branch=master"><img src="https://img.shields.io/coveralls/github/upupming/arithmetic-coding.svg?style=popout-square" alt="Coveralls"></a>
</p>

## Installation

```js
npm i arithmetiic-coding
```

## API

Simply call `encode` and `decode` function.

```js
const ariCoding = require('arithmetiic-coding');
// Encode
ariCoding.encode(__dirname + '/txt/long.txt', __dirname + '/txt/long-encoded.txt');
// Decode
ariCoding.decode(__dirname + '/txt/long-encoded.txt', __dirname + '/txt/long-decoded.txt');
```

## Command-line interface

> Under developing...