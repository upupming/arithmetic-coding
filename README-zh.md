# arithmetic-coding

<a href="https://www.npmjs.com/package/arithmetic-coding"><img src="https://img.shields.io/npm/v/arithmetic-coding.svg?style=flat-square" alt="npm"></a>
<a href="https://www.codacy.com/app/upupming/arithmetic-coding?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=upupming/arithmetic-coding&amp;utm_campaign=Badge_Grade"><img alt="Codacy grade" src="https://img.shields.io/codacy/grade/c26ae1fe65e8470da349e8f9bd3cd71f.svg?style=flat-square"></a>
<a href="https://www.codacy.com/app/upupming/arithmetic-coding?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=upupming/arithmetic-coding&amp;utm_campaign=Badge_Coverage"><img src="https://img.shields.io/codacy/coverage/c26ae1fe65e8470da349e8f9bd3cd71f.svg?style=flat-square"/></a>
<a href="https://travis-ci.com/upupming/arithmetic-coding/builds"><img src="https://img.shields.io/travis/com/upupming/arithmetic-coding.svg?style=popout-square" alt="travis build status"></a>
<a href="https://github.com/upupming/arithmetic-coding/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg?style=popout-square" alt="License"></a>

- [英文文档](./README.md)
- 中文文档

## 安装

安装为模块供 API 调用：

```js
npm i arithmetic-coding
```

或者全局安装为命令行界面：

```js
npm i -g arithmetic-coding
```

## API

通过指定文件目录调用：

```js
const ariCoding = require('arithmetic-coding');
// 从文件编码
ariCoding.encode(__dirname + '/txt/long.txt', __dirname + '/txt/long-encoded.txt');
// 从文件解码
ariCoding.decode(__dirname + '/txt/long-encoded.txt', __dirname + '/txt/long-decoded.txt');
```

通过传入 `Buffer` 调用：

```js
let data = Buffer.from('Example data', 'utf8');
// 从 Buffer 编码
let encoded = encode.encodeFromBuffer(data);
console.log(`encoded = ${encoded}`);
// 从 Buffer 解码
let decoded = decode.decodeFromBuffer(encoded);
console.log(`decoded = ${decoded}`);
```

## 命令行界面

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

## 性能

您可以查看 [travis 测试日志](https://travis-ci.com/upupming/arithmetic-coding) 得知最新版本的运行时间。

一些运行测试结果如下：

| 文件大小 (字节) | 总运行时间 | 编码时间 | 解码时间 |
| --------------- | ---------- | -------- | -------- |
| 60640           | 110ms      | 极小     | 110ms    |
| 2130640         | 2940ms     | 426ms    | 2514ms   |

## 关于算数编码算法

1. [维基百科](https://en.wikipedia.org/wiki/Arithmetic_coding)
2. [编码/解码的实际可用的实现](http://www.drdobbs.com/cpp/data-compression-with-arithmetic-encodin/240169251)
3. [GitHub 上 Reference-arithmetic-coding 的源代码](https://github.com/nayuki/Reference-arithmetic-coding)