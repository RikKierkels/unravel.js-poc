const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const readFile = (path) => fs.promises.readFile(path, 'utf-8');

function checkImportDeclaration(node) {
  return (node.type === 'ImportDeclaration' && node.source && node.source.value) || [];
}

function makeChecker(checkers) {
  return function (node) {
    return checkers.flatMap((inspect) => inspect(node));
  };
}

const toPathWithStats = (path) =>
  new Promise((resolve) =>
    fs.stat(path, (error, stats) => {
      error ? resolve([]) : resolve([path, stats]);
    }),
  );

(async function getDependencies(patterns = [], checkers = []) {
  const checkNode = makeChecker(checkers);
  const pathsWithStats = await Promise.all(
    patterns
      .flatMap((pattern) => glob.sync(pattern))
      .reduce((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
      .map(toPathWithStats),
  );
  const files = pathsWithStats.filter(([_, stats]) => stats && stats.isFile()).map(([path]) => readFile(path));

  let dependencies = [];
  for (let file of files) {
    const ast = parser.parse(await file, { sourceType: 'module' });
    dependencies = visit(ast).flatMap(checkNode).concat(dependencies);
  }

  console.log(dependencies);
})(['modules/*'], [checkImportDeclaration]);

function visit(ast, visited = new WeakSet()) {
  if (!ast || visited.has(ast)) return [];

  if (Array.isArray(ast)) {
    return ast.flatMap((node) => visit(node, visited));
  }

  if (ast.type) {
    return Object.keys(ast)
      .filter((key) => key !== 'comments')
      .flatMap((key) => visit(ast[key], visited.add(ast)))
      .concat(ast);
  }

  return [];
}
