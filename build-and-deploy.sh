#!/bin/bash
# Build and deploy cinqueterre.travel to GitHub Pages

set -e

echo "=== Building Cinqueterre.travel ==="

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Run the Node.js build script
node build-all-pages.js

echo ""
echo "=== Build complete! ==="
echo "Files in dist/:"
ls -la dist/ | head -20
echo ""
echo "Total files:"
find dist -type f | wc -l

# Check if we should deploy
if [ "$1" != "--no-deploy" ]; then
  echo ""
  echo "=== Deploying to gh-pages ==="

  cd dist

  # Initialize git
  git init

  # Configure git identity for this repo
  git config user.email "deploy@cinqueterre.travel"
  git config user.name "Cinqueterre Deploy"

  git checkout -b gh-pages
  git add -A
  git commit -m "Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

  # Add remote and push
  git remote add origin https://github.com/swarmpress/cinqueterre.travel.git
  git push -f origin gh-pages

  echo ""
  echo "=== Deployed! ==="
  echo "Site will be available at https://cinqueterre.travel in a few minutes"
else
  echo ""
  echo "Skipping deploy (--no-deploy flag)"
  echo "To deploy manually, run:"
  echo "  cd dist && npx gh-pages -d . -b gh-pages"
fi
