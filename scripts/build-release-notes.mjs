#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const releaseNotesDir = path.join(rootDir, '.release-notes')
const outputFile = path.join(rootDir, 'src/main/data/releaseNotesData.ts')

// Create output directory if needed
const outputDir = path.dirname(outputFile)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const releaseNotes = {}

// Read all .json files in .release-notes directory
if (fs.existsSync(releaseNotesDir)) {
  const files = fs.readdirSync(releaseNotesDir).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const version = path.basename(file, '.json')
    const filePath = path.join(releaseNotesDir, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    releaseNotes[version] = content
  }
}

// Generate TypeScript file
const content = `// Auto-generated file - do not edit manually
// Generated from .release-notes directory

export interface ReleaseNote {
  title: string
  description: string
}

export const releaseNotesData: Record<string, ReleaseNote[]> = ${JSON.stringify(releaseNotes, null, 2)}
`

fs.writeFileSync(outputFile, content)
console.log('✓ Release notes data generated')
