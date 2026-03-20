// SEA bootstrap — prepended to server.cjs during MCPB build.
// Extracts native better-sqlite3 addon from SEA assets and patches process.dlopen.

var _seaFs = require('fs');
var _seaPath = require('path');
var _seaOs = require('os');

var _isSea = false;
try { _isSea = require('node:sea').isSea(); } catch (_e) {}

if (_isSea) {
  var _buf = require('node:sea').getRawAsset('better_sqlite3.node');
  var _dir = _seaPath.join(_seaOs.tmpdir(), 'tasks-mcp-native');
  var _addon = _seaPath.join(_dir, 'better_sqlite3.node');

  if (!_seaFs.existsSync(_dir)) {
    _seaFs.mkdirSync(_dir, { recursive: true });
  }
  _seaFs.writeFileSync(_addon, new Uint8Array(_buf));

  var _origDlopen = process.dlopen;
  process.dlopen = function (mod, filename) {
    if (filename.includes('better_sqlite3')) {
      filename = _addon;
    }
    return _origDlopen.call(this, mod, filename);
  };
}

// --- server.cjs follows ---
