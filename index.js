const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const readFile = (path) => fs.promises.readFile(path, 'utf-8');

(async function getDependencies(patterns = [], checkers = []) {
  const checkNode = makeChecker(checkers);
  const pathsWithStats = await Promise.all(
    patterns
      .flatMap((pattern) => glob.sync(pattern))
      .reduce((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
      .map(toPathWithStats),
  );
  const files = pathsWithStats
    .filter(([_, stats]) => stats && stats.isFile())
    .map(([path]) => ({ path, content: readFile(path) }));

  // TODO: Get rid of array somehow
  let filesWithDependencies = [];
  for (let { path, content } of files) {
    const ast = parser.parse(await content, { sourceType: 'module' });
    filesWithDependencies = visit(ast)
      .flatMap(checkNode)
      .map((dependencies) => ({ path, dependencies }))
      .concat(filesWithDependencies);
    // TODO: Merge dependencies of same source file
  }

  console.log(filesWithDependencies);
})(['modules/*'], [checkImportDeclaration]);

function toPathWithStats(path) {
  return new Promise((resolve) =>
    fs.stat(path, (error, stats) => {
      error ? resolve([]) : resolve([path, stats]);
    }),
  );
}

function visit(ast, visited = new WeakSet()) {
  if (!ast || visited.has(ast)) return [];

  if (Array.isArray(ast)) {
    return ast.flatMap((node) => visit(node, visited));
  }

  if (ast.type) {
    return Object.keys(ast)
      .filter((key) => key !== 'comments' && key !== 'trailingComments')
      .flatMap((key) => visit(ast[key], visited.add(ast)))
      .concat(ast);
  }

  return [];
}

function makeChecker(checkers) {
  return function (node) {
    return checkers.flatMap((check) => check(node));
  };
}

function checkImportDeclaration(node) {
  return (node.type === 'ImportDeclaration' && node.source && node.source.value) || [];
}

// TODO: Introduce File abstration
function File(path, content) {
  let dependencies = []; // other Files
  return {};
}
