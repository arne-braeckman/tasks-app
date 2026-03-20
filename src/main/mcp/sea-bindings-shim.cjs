// Shim for the 'bindings' module when running inside a SEA binary.
// Uses process.dlopen directly (bypasses SEA's embedderRequire).

const path = require('path')
const os = require('os')

module.exports = function bindings(name) {
  const addonPath = path.join(os.tmpdir(), 'tasks-mcp-native', name)
  const mod = { exports: {} }
  process.dlopen(mod, addonPath)
  return mod.exports
}
