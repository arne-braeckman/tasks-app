/**
 * afterSign hook for electron-builder.
 *
 * Performs a thorough ad-hoc re-sign of the entire Electron app bundle in the
 * correct order. The `codesign --deep` flag is unreliable for Electron's nested
 * bundle structure (helper .app bundles inside Frameworks are often skipped),
 * which causes macOS dyld to reject the app at launch due to Team ID mismatches
 * between the main binary and the Electron Framework.
 *
 * Correct signing order:
 *   1. dylibs inside Electron Framework
 *   2. Electron Framework binary itself
 *   3. Each Helper .app bundle
 *   4. The main .app bundle last
 */
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

function sign(target) {
  execSync(`codesign --force --sign - "${target}"`, { stdio: 'pipe' })
}

function signDir(dir, ext) {
  if (!fs.existsSync(dir)) return
  for (const file of fs.readdirSync(dir)) {
    if (!ext || file.endsWith(ext)) {
      sign(path.join(dir, file))
    }
  }
}

module.exports = async function afterSign(context) {
  const { appOutDir, packager } = context
  const appName = packager.appInfo.productFilename
  const appPath = path.join(appOutDir, `${appName}.app`)
  const frameworksDir = path.join(appPath, 'Contents', 'Frameworks')
  const electronFw = path.join(frameworksDir, 'Electron Framework.framework', 'Versions', 'A')

  console.log(`  • ad-hoc signing app bundle  path=${appPath}`)

  // 1. Sign dylibs inside Electron Framework
  signDir(path.join(electronFw, 'Libraries'), '.dylib')

  // 2. Sign the Electron Framework binary itself
  sign(path.join(electronFw, 'Electron Framework'))

  // 3. Sign other bundled frameworks (Squirrel, Mantle, ReactiveObjC)
  for (const entry of fs.readdirSync(frameworksDir)) {
    if (entry.endsWith('.framework')) {
      const fwBin = path.join(frameworksDir, entry, 'Versions', 'A', entry.replace('.framework', ''))
      if (fs.existsSync(fwBin)) sign(fwBin)
    }
  }

  // 4. Sign each Helper .app bundle (GPU, Plugin, Renderer, base)
  for (const entry of fs.readdirSync(frameworksDir)) {
    if (entry.endsWith('.app')) {
      sign(path.join(frameworksDir, entry))
    }
  }

  // 5. Sign the main app bundle last
  sign(appPath)

  console.log(`  • ad-hoc signing complete`)
}
