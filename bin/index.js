#!/usr/bin/env node

/* eslint-disable no-console */

const program = require('commander')
const pkg = require('../package.json')
const ariCoding = require('../src/index')
const path = require('path')
const chalk = require('chalk')

function getAction (isEncode) {
  return function (file, cmd) {
    try {
      let inputPath = path.resolve(file)
      let outputPath = cmd.output || (file + (isEncode ? '.encoded' : '.decoded'))
      isEncode && ariCoding.encode(inputPath, outputPath)
      !isEncode && ariCoding.decode(inputPath, outputPath)
      console.log(
        chalk.green('File ' + (isEncode ? 'encoded' : 'decoded') + ' successfully')
      )
    } catch (e) {
      console.error(
        chalk.red(e.message)
      )
    }
  }
}

program
  .version(pkg.version, '-v, --version')
program
  .command('encode <file>')
  .alias('e')
  .description('encode a file')
  .option('-o, --output <file>', 'output file path')
  .action(getAction(true))
program
  .command('decode <file>')
  .alias('d')
  .description('decode a file')
  .option('-o, --output <file>', 'output file path')
  .action(getAction(false))

// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

program.parse(process.argv)
