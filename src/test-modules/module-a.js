import moduleB from './module-b.js'; // 0
import moduleC from './module-c.js'; // 0
import moduleD from 'src/test-modules/module-c.js';

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

const bla = require('./module-b');
const bla2 = require('module-b');

export default {
  module: moduleD,
};
