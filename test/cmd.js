require('should')
// https://medium.com/@zorrodg/integration-tests-on-node-js-cli-part-1-why-and-how-fa5b1ba552fe
const spawn = require('child_process').spawn
function createProcess (processPath, args = [], env = null) {
  args = [processPath].concat(args)

  // Require which and child_process
  const which = require('which')
  // Find node in PATH
  const node = which.sync('node')

  return spawn(node, args, {
    env: Object.assign(
      {
        NODE_ENV: 'test'
      },
      env
    )
  })
}

const concat = require('concat-stream')
function execute (processPath, args = [], opts = {}) {
  const { env = null } = opts
  const childProcess = createProcess(processPath, args, env)
  childProcess.stdin.setEncoding('utf-8')
  const promise = new Promise((resolve, reject) => {
    childProcess.stderr.once('data', err => {
      reject(err.toString())
    })
    childProcess.on('error', reject)
    childProcess.stdout.pipe(
      concat(result => {
        resolve(result.toString())
      })
    )
  })
  return promise
}
module.exports = { execute }
