import { defineConfig } from 'vite'
import { resolve } from 'path'

// Build config for standalone MCP server
export default defineConfig({
  build: {
    outDir: 'out/mcp',
    target: 'node20',
    lib: {
      entry: resolve(__dirname, 'src/main/mcp/server.ts'),
      formats: ['cjs'],
      fileName: 'server',
    },
    rollupOptions: {
      external: [
        'better-sqlite3',
        'drizzle-orm',
        'drizzle-orm/better-sqlite3',
        'drizzle-orm/sqlite-core',
        'nanoid',
        '@modelcontextprotocol/sdk',
        '@modelcontextprotocol/sdk/server/mcp.js',
        '@modelcontextprotocol/sdk/server/stdio.js',
        'zod',
        'path',
        'fs',
        'os',
        'crypto',
        'node:path',
        'node:fs',
        'node:os',
        'node:crypto',
        'bindings',
        'file-uri-to-path',
      ],
      output: {
        format: 'cjs',
        entryFileNames: 'server.cjs',
      },
    },
    ssr: true,
    minify: false,
  },
})
