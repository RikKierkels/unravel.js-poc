import moduleB from "./module-b.js"; // 0

const a = import(() => ""); // 1

const b = () => import(() => ""); // 2-1

function c() {
  // 3
  const d = import(() => ""); // 3-1
}

(function () { // 4
  const e = import(() => ""); // 4-1
});

const a = require("fs"); // 5

require("fs"); // 6

function funct() { // 3
  const b = require("fs"); // 3-1
}

export default {};
