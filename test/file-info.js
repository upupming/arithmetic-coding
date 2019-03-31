module.exports = function (filepath) {
  const fs = require('fs') // Load the filesystem module
  const stats = fs.statSync(filepath)
  const fileSizeInBytes = stats.size
  return `file: ${filepath.replace(/^.*[\\/]/, '')}, size: ${fileSizeInBytes}`
}
