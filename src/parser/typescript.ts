import { parse } from '@babel/parser';
import { Ast } from '../visit';

export default function parseTypescript(input: string): Ast {
  return parse(input, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      'asyncGenerators',
      'bigInt',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'decorators-legacy',
      'doExpressions',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'functionSent',
      'importMeta',
      'logicalAssignment',
      'nullishCoalescingOperator',
      'numericSeparator',
      'objectRestSpread',
      'optionalCatchBinding',
      'optionalChaining',
      'partialApplication',
      ['pipelineOperator', { proposal: 'minimal' }],
      'throwExpressions',
      'topLevelAwait',
    ],
  });
}
