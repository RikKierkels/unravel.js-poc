import moduleB from './module-b.js'; // 0
import moduleC from './module-c.js'; // 0

const a = import(() => ''); // 1

const b = () => import(() => ''); // 2-1

function c() {
  // 3
  const d = import(() => ''); // 3-1
}

(function () {
  // 4
  const e = import(() => ''); // 4-1
});

const f = require('fs1'); // 5

require('fs2'); // 6

function funct() {
  // 3
  const g = require('fs3'); // 3-1
}

export default {};
