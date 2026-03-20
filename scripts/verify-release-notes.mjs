#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const packageJsonPath = path.join(rootDir, 'package.json')
const releaseNotesDir = path.join(rootDir, '.release-notes')

// Ensure .release-notes directory exists
if (!fs.existsSync(releaseNotesDir)) {
  fs.mkdirSync(releaseNotesDir, { recursive: true })
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
const currentVersion = packageJson.version

const releaseNotesFile = path.join(releaseNotesDir, `${currentVersion}.json`)

// Check if release notes already exist for this version
if (fs.existsSync(releaseNotesFile)) {
  console.log(`✓ Release notes for v${currentVersion} already exist.`)
  process.exit(0)
}

console.log(`\n📝 No release notes found for v${currentVersion}`)
console.log('━'.repeat(60))
console.log('Add release notes before publishing. Enter notes as bullet points.')
console.log('(type "done" on a new line when finished)')
console.log('━'.repeat(60))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const notes = []
let isEnteringDescription = false
let currentTitle = ''

function promptForNote() {
  if (isEnteringDescription) {
    rl.question('Description (optional, or press Enter to skip): ', (input) => {
      const description = input.trim()

      notes.push({
        title: currentTitle,
        description: description || `Update in version ${currentVersion}`,
      })

      currentTitle = ''
      isEnteringDescription = false

      promptForNote()
    })
  } else {
    rl.question('\nRelease note title (or "done"): ', (input) => {
      const title = input.trim()

      if (title.toLowerCase() === 'done') {
        if (notes.length === 0) {
          console.error('❌ At least one release note is required before publishing.')
          process.exit(1)
        }

        // Save release notes
        fs.writeFileSync(releaseNotesFile, JSON.stringify(notes, null, 2))
        console.log(`\n✓ Release notes saved for v${currentVersion}`)
        console.log(`  ${notes.length} note(s) added`)
        rl.close()
        process.exit(0)
      }

      if (!title) {
        console.log('⚠ Title cannot be empty.')
        promptForNote()
      } else {
        currentTitle = title
        isEnteringDescription = true
        promptForNote()
      }
    })
  }
}

promptForNote()

rl.on('close', () => {
  if (notes.length > 0) {
    console.log(`\n✓ Release notes ready for v${currentVersion}`)
    process.exit(0)
  }
})
