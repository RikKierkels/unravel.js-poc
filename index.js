const fs = require("fs");
const glob = require("glob");
const parser = require("@babel/parser");
const readFile = (path) => fs.promises.readFile(path, "utf-8");

const toPathWithStats = (path) =>
  new Promise((resolve) =>
    fs.stat(path, (error, stats) => {
      error ? resolve([]) : resolve([path, stats]);
    }),
  );

(async function getDependencies(patterns = []) {
  const pathsWithStats = await Promise.all(
    patterns
      .flatMap((pattern) => glob.sync(pattern))
      .reduce((paths, path) => (paths.includes(path) ? paths : [...paths, path]), [])
      .map(toPathWithStats),
  );
  const files = pathsWithStats.filter(([_, stats]) => stats && stats.isFile()).map(([path]) => readFile(path));

  for (let file of files) {
    const ast = parser.parse(await file, { sourceType: "module" });
    const nodes = visit(ast);
    console.log(nodes);
    console.log(identifiers.map((identifier) => identifier(nodes)));
  }
})(["modules/*"]);

function visit(ast, visited = new WeakSet()) {
  if (!ast || visited.has(ast)) return [];

  if (Array.isArray(ast)) {
    return ast.flatMap((node) => visit(node, visited));
  }

  if (ast.type) {
    return Object.keys(ast)
      .filter((key) => key !== "comments")
      .flatMap((key) => visit(ast[key], visited.add(ast)))
      .concat(ast);
  }

  return [];
}

// TODO: Shitty name
const identifiers = [identifyImportDeclaration];

function identifyImportDeclaration(node) {
  return node.type === "ImportDeclaration" && node.source && node.source.value;
}
