const fs = require('fs');
const path = require('path');
const root = process.cwd();
const srcDir = path.join(root, 'src');
const exts = ['.js', '.jsx', '.ts', '.tsx'];
const files = [];
function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else if (exts.includes(path.extname(p))) {
      files.push(p);
    }
  });
}
walk(srcDir);
const relFiles = files.map((f) => path.relative(root, f).replace(/\\/g, '/'));
const deps = {};
const importRegex = /import\s+(?:[\s\S]+?)\s+from\s+['\"](.+?)['\"]/g;
const importSideEffectRegex = /import\s+['\"](.+?)['\"]/g;
const requireRegex = /require\(\s*['\"](.+?)['\"]\s*\)/g;
function resolveImport(from, module) {
  if (!module) return null;
  if (module.startsWith('http') || module.startsWith('data:')) return null;
  if (module.startsWith('@/')) {
    const candidate = path.join(root, 'src', module.slice(2));
    return resolveFile(candidate);
  }
  if (module.startsWith('.')) {
    const candidate = path.resolve(path.dirname(from), module);
    return resolveFile(candidate);
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
for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  deps[rel] = [];
  let match;
  importRegex.lastIndex = 0;
  while ((match = importRegex.exec(text)) !== null) {
    const resolved = resolveImport(file, match[1]);
    if (resolved) deps[rel].push(resolved);
  }
  importSideEffectRegex.lastIndex = 0;
  while ((match = importSideEffectRegex.exec(text)) !== null) {
    const resolved = resolveImport(file, match[1]);
    if (resolved) deps[rel].push(resolved);
  }
  requireRegex.lastIndex = 0;
  while ((match = requireRegex.exec(text)) !== null) {
    const resolved = resolveImport(file, match[1]);
    if (resolved) deps[rel].push(resolved);
  }
}
const start = 'src/main.jsx';
const reachable = new Set();
function dfs(file) {
  if (reachable.has(file)) return;
  reachable.add(file);
  (deps[file] || []).forEach((dep) => dfs(dep));
}
if (!relFiles.includes(start)) {
  console.error('Start file missing:', start);
  process.exit(1);
}
dfs(start);
const unused = relFiles.filter((f) => !reachable.has(f)).sort();
console.log(unused.join('\n'));
