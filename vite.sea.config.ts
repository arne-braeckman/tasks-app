import { defineConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'module'

// Build config for SEA (Single Executable Application) MCP server.
// Bundles ALL JS dependencies inline including better-sqlite3.
// The 'bindings' module is aliased to a shim that loads the native
// addon from a temp directory (extracted by sea-bootstrap.cjs at startup).

const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]

export default defineConfig({
  resolve: {
    alias: {
      bindings: resolve(__dirname, 'src/main/mcp/sea-bindings-shim.cjs'),
    },
  },
  build: {
    outDir: 'out/mcp',
    target: 'node20',
    lib: {
      entry: resolve(__dirname, 'src/main/mcp/server.ts'),
      formats: ['cjs'],
      fileName: 'server-sea',
    },
    rollupOptions: {
      external: nodeBuiltins,
      output: {
        format: 'cjs',
        entryFileNames: 'server-sea.cjs',
      },
    },
    minify: false,
    emptyOutDir: false,
  },
})
