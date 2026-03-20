#!/bin/bash
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"

echo "==> Building MCP server (SEA bundle)..."
npx vite build --config vite.sea.config.ts

echo "==> Creating SEA entry (bootstrap + server-sea.cjs)..."
cat src/main/mcp/sea-bootstrap.cjs out/mcp/server-sea.cjs > out/mcp/sea-entry.cjs

echo "==> Generating SEA blob..."
node --experimental-sea-config sea-config.json

echo "==> Copying node binary..."
cp "$(which node)" out/mcp/tasks-mcp

echo "==> Removing code signature (macOS)..."
codesign --remove-signature out/mcp/tasks-mcp

echo "==> Injecting SEA blob..."
npx postject out/mcp/tasks-mcp NODE_SEA_BLOB out/mcp/sea-prep.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
  --macho-segment-name NODE_SEA

echo "==> Re-signing binary (macOS)..."
codesign --sign - out/mcp/tasks-mcp

echo "==> Done! Binary at: out/mcp/tasks-mcp"
echo "    Size: $(du -h out/mcp/tasks-mcp | cut -f1)"
echo "    SHA-256: $(openssl dgst -sha256 out/mcp/tasks-mcp | awk '{print $2}')"
