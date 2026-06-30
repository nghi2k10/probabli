const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exts = ['.js', '.jsx', '.ts', '.tsx'];
const srcDir = path.join(root, 'src');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    if (exts.includes(path.extname(p))) return [p];
    return [];
  });
}

function resolveImport(from, module) {
  if (!module) return null;
  if (module.startsWith('http') || module.startsWith('data:')) return null;
  if (module.startsWith('@/')) {
    return resolveFile(path.join(root, 'src', module.slice(2)));
  }
  if (module.startsWith('.')) {
    return resolveFile(path.resolve(path.dirname(from), module));
  }
  return null;
}

function resolveFile(candidate) {
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return path.relative(root, candidate).replace(/\\/g, '/');
  for (const ext of exts) {
    const p = candidate + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return path.relative(root, p).replace(/\\/g, '/');
  }
  for (const ext of exts) {
    const p = path.join(candidate, 'index' + ext);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return path.relative(root, p).replace(/\\/g, '/');
  }
  return null;
}

const files = walk(srcDir);
const deps = {};
const importRegex = /^\s*import\s+(?:[\s\S]+?)\s+from\s+['\"](.+?)['\"]/gm;
const importSideEffectRegex = /^\s*import\s+['\"](.+?)['\"]/gm;
const requireRegex = /require\(\s*['\"](.+?)['\"]\s*\)/g;

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  deps[rel] = [];
  const text = fs.readFileSync(file, 'utf8');
  let match;
  importRegex.lastIndex = 0;
  while ((match = importRegex.exec(text)) !== null) {
    const resolved = resolveImport(file, match[1]);
    deps[rel].push(resolved || match[1]);
  }
  importSideEffectRegex.lastIndex = 0;
  while ((match = importSideEffectRegex.exec(text)) !== null) {
    const resolved = resolveImport(file, match[1]);
    deps[rel].push(resolved || match[1]);
  }
  requireRegex.lastIndex = 0;
  while ((match = requireRegex.exec(text)) !== null) {
    const resolved = resolveImport(file, match[1]);
    deps[rel].push(resolved || match[1]);
  }
}

const start = 'src/main.jsx';
const reachable = new Set();
function dfs(file) {
  if (reachable.has(file)) return;
  reachable.add(file);
  for (const dep of deps[file] || []) {
    if (dep && dep.startsWith('src/')) {
      dfs(dep);
    }
  }
}

dfs(start);

const used = new Set();
for (const file of reachable) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  let match;
  importRegex.lastIndex = 0;
  while ((match = importRegex.exec(text)) !== null) {
    const pkg = match[1];
    if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('http')) {
      used.add(pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0]);
    }
  }
  importSideEffectRegex.lastIndex = 0;
  while ((match = importSideEffectRegex.exec(text)) !== null) {
    const pkg = match[1];
    if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('http')) {
      used.add(pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0]);
    }
  }
  requireRegex.lastIndex = 0;
  while ((match = requireRegex.exec(text)) !== null) {
    const pkg = match[1];
    if (!pkg.startsWith('.') && !pkg.startsWith('@/') && !pkg.startsWith('http')) {
      used.add(pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0]);
    }
  }
}

console.log(Array.from(used).sort().join('\n'));
