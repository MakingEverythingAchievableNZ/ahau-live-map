#!/usr/bin/env node
// Regenerates the README_MAP object embedded in index.html from the individual
// files under readmes/. Run this after editing any readmes/**/*.md file.
//
//   node scripts/sync-readmes.js
//
// No dependencies - plain Node fs/path only.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const readmesDir = path.join(repoRoot, 'readmes');
const indexPath = path.join(repoRoot, 'index.html');

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

const map = {};
for (const file of walk(readmesDir)) {
  const relPath = path.relative(readmesDir, file);
  const id = relPath.slice(0, -'.md'.length).split(path.sep).join('/');
  map[id] = fs.readFileSync(file, 'utf8');
}

const idCount = Object.keys(map).length;
if (idCount === 0) {
  console.error('No .md files found under readmes/ - refusing to write an empty README_MAP');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
const re = /const README_MAP = \{.*?\};\n/s;
if (!re.test(html)) {
  console.error('Could not find "const README_MAP = {...};" in index.html');
  process.exit(1);
}

const replacement = 'const README_MAP = ' + JSON.stringify(map) + ';\n';
fs.writeFileSync(indexPath, html.replace(re, replacement));

console.log(`Synced ${idCount} README(s) from readmes/ into index.html`);
