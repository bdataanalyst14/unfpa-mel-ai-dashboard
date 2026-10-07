const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.js';
    if (cache.has(file)) return cache.get(file).exports;
    if (!/\.tsx?$/.test(file)) return require(file);
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    Function('require', 'module', 'exports', output)(id => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (id === 'server-only') return {};
      if (id.startsWith('@/')) return load(path.join(root, 'src', id.slice(2)));
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id));
      return require(id);
    }, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load;
}
module.exports = { loader };
