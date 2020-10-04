import moduleB from './module-b.js'; // 0
import moduleC from './module-c.js'; // 0
import moduleD from 'module-c.js';
import moduleE from '@nested/module-b.js';

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

const f = require('fs'); // 5

require('fs'); // 6

function funct() {
  // 3
  const g = require('fs'); // 3-1
}

const bla = require('./module-b');
const bla2 = require('nested-modules/module-b');

export default {
  module: moduleD,
};
