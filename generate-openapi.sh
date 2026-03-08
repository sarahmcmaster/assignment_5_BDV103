#!/bin/bash

# Generate tsoa spec and routes
npx tsoa spec-and-routes

# Add ts-nocheck to generated routes file so tsc doesn't fail on tsoa output
node -e "const fs=require('fs'); const p='build/routes.ts'; const s=fs.readFileSync(p,'utf8'); if(!s.startsWith('// @ts-nocheck')) fs.writeFileSync(p, '// @ts-nocheck\n'+s);"

# Generate TypeScript client SDK from OpenAPI spec (requires Java)
if which java > /dev/null 2>&1; then
  npx @openapitools/openapi-generator-cli generate -i ./build/swagger.json -o ./client -g typescript-fetch
else
  echo "Java not found - skipping client SDK generation (will work in devcontainer)"
fi