#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const src = path.join(process.cwd(), 'public');
const dest = path.join(process.cwd(), '../ftp_lbg-site');

function log(...args){ console.log(...args); }

function removeDir(dir) {
  if (!dir) return Promise.resolve();
  if (fsp.rm) return fsp.rm(dir, { recursive: true, force: true });
  return fsp.rmdir(dir, { recursive: true }).catch(() => {});
}

async function copyRecursive(srcPath, destPath) {
  // Deprecated: keep for backward-compat but prefer selective copy below
  if (fsp.cp) return fsp.cp(srcPath, destPath, { recursive: true });
  const stat = await fsp.stat(srcPath);
  if (stat.isDirectory()) {
    await fsp.mkdir(destPath, { recursive: true });
    const entries = await fsp.readdir(srcPath);
    for (const entry of entries) {
      await copyRecursive(path.join(srcPath, entry), path.join(destPath, entry));
    }
  } else {
    await fsp.copyFile(srcPath, destPath);
  }
}

async function selectiveCopy(baseSrc, baseDest) {
  const allowedExts = new Set([
    '.html', '.htm', '.css', '.js', '.json', '.map',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.ttf', '.woff', '.woff2', '.eot', '.otf'
  ]);
  const excludedNames = new Set(['node_modules']);

  async function copyDirFiltered(srcDir, destDir) {
    const entries = await fsp.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (excludedNames.has(entry.name)) continue;
      const fullPath = path.join(srcDir, entry.name);
      const rel = path.relative(baseSrc, fullPath).split(path.sep).join('/');
      if (entry.isDirectory()) {
        await copyDirFiltered(fullPath, path.join(baseDest, rel));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (allowedExts.has(ext) || ext === '.html') {
          const destFile = path.join(baseDest, rel);
          await fsp.mkdir(path.dirname(destFile), { recursive: true });
          await fsp.copyFile(fullPath, destFile);
        }
      }
    }
  }

  await copyDirFiltered(baseSrc, baseDest);
}

// Run build
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let build;
try {
  build = spawn(npmCmd, ['run', 'build'], { stdio: 'inherit' });
} catch (err) {
  console.warn('spawn failed, retrying with shell:', err && err.message);
  build = spawn(`${npmCmd} run build`, { shell: true, stdio: 'inherit' });
}

build.on('error', (err) => {
  console.error('Failed to start build process:', err);
  process.exit(3);
});

build.on('close', async (code) => {
  if (code !== 0) {
    console.error('Build failed with code', code);
    process.exit(code);
  }
  try {
    await removeDir(dest);
    await selectiveCopy(src, dest);
    await postProcessHtml(dest);
    console.log('Site packaged to', dest);
    process.exit(0);
  } catch (err) {
    console.error('Packaging failed:', err);
    process.exit(2);
  }
});

async function postProcessHtml(siteDir) {
  const files = [];
  async function findHtml(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await findHtml(full);
      else if (entry.isFile() && full.endsWith('.html')) files.push(full);
    }
  }
  await findHtml(siteDir);

  const replacements = [
    { from: /"\/assets\/node_modules\/bootstrap\/css\/bootstrap.min.css"/g, to: '"https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"' },
    { from: /"\/assets\/node_modules\/bootstrap\/js\/bootstrap.min.js"/g, to: '"https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"' },
    { from: /"\/assets\/node_modules\/jquery\/dist\/jquery.min.js"/g, to: '"https://code.jquery.com/jquery-3.5.1.min.js"' },
    { from: /"\/assets\/node_modules\/popper\/dist\/popper.min.js"/g, to: '"https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"' },
    { from: /"\/assets\/node_modules\/owl.carousel\/dist\/assets\/owl.carousel.min.css"/g, to: '"https://unpkg.com/owl.carousel@2.3.4/dist/assets/owl.carousel.min.css"' },
    { from: /"\/assets\/node_modules\/owl.carousel\/dist\/assets\/owl.theme.default.min.css"/g, to: '"https://unpkg.com/owl.carousel@2.3.4/dist/assets/owl.theme.default.min.css"' },
    { from: /"\/assets\/node_modules\/owl.carousel\/dist\/owl.carousel.min.js"/g, to: '"https://unpkg.com/owl.carousel@2.3.4/dist/owl.carousel.min.js"' },
    { from: /"\/assets\/node_modules\/aos\/dist\/aos.css"/g, to: '"https://unpkg.com/aos@2.3.4/dist/aos.css"' },
    { from: /"\/assets\/node_modules\/aos\/dist\/aos.js"/g, to: '"https://unpkg.com/aos@2.3.4/dist/aos.js"' }
  ];

  for (const file of files) {
    let content = String(await fsp.readFile(file, 'utf8'));
    let changed = false;
    for (const r of replacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    }
    if (changed) await fsp.writeFile(file, content, 'utf8');
  }
}
