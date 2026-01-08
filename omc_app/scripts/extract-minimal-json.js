const fs = require('fs');
const buildInfo = JSON.parse(fs.readFileSync('artifacts/build-info/7a5745f1748dc8c07698d3be95e768d9.json', 'utf8'));

const neededFiles = new Set();

const resolveImport = (basePath, importPath) => {
  if (importPath.startsWith('@')) return importPath;
  if (!importPath.startsWith('.')) return importPath;

  const dir = basePath.substring(0, basePath.lastIndexOf('/'));
  const parts = [...dir.split('/'), ...importPath.split('/')];
  const resolved = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.') resolved.push(p);
  }
  return resolved.join('/');
};

const addFile = (filePath) => {
  if (neededFiles.has(filePath) || !buildInfo.input.sources[filePath]) return;
  neededFiles.add(filePath);

  const content = buildInfo.input.sources[filePath].content;
  const importRegex = /import\s+(?:\{[^}]+\}\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const resolved = resolveImport(filePath, match[1]);
    addFile(resolved);
  }
};

// Get contract name from command line or default to OpinionCore
const contractName = process.argv[2] || 'OpinionCore';
const contractPath = `contracts/active/${contractName}.sol`;

// Check for ValidationLibrary dependency
const needsValidationLib = ['OpinionCore', 'PoolManager'].includes(contractName);

addFile(contractPath);

console.log(`Contract: ${contractName}`);
console.log('Total files:', neededFiles.size);

const minimalSources = {};
neededFiles.forEach(file => {
  minimalSources[file] = buildInfo.input.sources[file];
});

const settings = { ...buildInfo.input.settings };
if (needsValidationLib) {
  settings.libraries = {
    'contracts/active/libraries/ValidationLibrary.sol': {
      'ValidationLibrary': '0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5'
    }
  };
}

const output = {
  language: 'Solidity',
  sources: minimalSources,
  settings
};

const outputFile = `deployments/${contractName}-minimal.json`;
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(`Written to ${outputFile}`);
