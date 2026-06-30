const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exts = ['.js', '.jsx', '.ts', '.tsx'];
function walk(dir) {
  let files = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(p));
    else if (exts.includes(path.extname(p))) files.push(p);
  });
  return files;
}
const files = walk(path.join(root, 'src'));
const importRx = /^\s*import\s+(?:[\s\S]+?)\s+from\s+['\"](.+?)['\"]/gm;
const importSideEffectRx = /^\s*import\s+['\"](.+?)['\"]/gm;
const requireRx = /require\(\s*['\"](.+?)['\"]\s*\)/g;
const used = new Set();
files.forEach(file => {
  const text = fs.readFileSync(file, 'utf8');
  ;[importRx, importSideEffectRx].forEach(rx => {
    rx.lastIndex = 0;
    let match;
    while ((match = rx.exec(text)) !== null) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('http')) used.add(pkg);
    }
  });
  requireRx.lastIndex = 0;
  let match;
  while ((match = requireRx.exec(text)) !== null) {
    const pkg = match[1];
    if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('http')) used.add(pkg);
  }
});
console.log(Array.from(used).sort().join('\n'));
