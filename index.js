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
  }
})(["modules/*"]);
