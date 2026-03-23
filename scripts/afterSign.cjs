/**
 * afterSign hook for electron-builder.
 * Re-signs the entire app bundle with a consistent ad-hoc signature so that
 * all frameworks (including the pre-signed Electron Framework) share the same
 * Team ID. Without this, macOS dyld rejects the app at launch due to a
 * Team ID mismatch between the main binary and Electron Framework.
 */
const { execSync } = require('child_process')
const path = require('path')

module.exports = async function afterSign(context) {
  const { appOutDir, packager } = context
  const appName = packager.appInfo.productFilename
  const appPath = path.join(appOutDir, `${appName}.app`)

  console.log(`  • re-signing app bundle with ad-hoc identity  path=${appPath}`)
  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' })
  console.log(`  • ad-hoc re-sign complete`)
}
