import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const XLSX = require('xlsx');
const exports = {};
runInNewContext(ts.transpileModule(readFileSync(new URL('../../features/questions/question-excel.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports, require });

test('question import resolves actual catalog names and rejects missing or unknown references', async () => {
  const domains = [{ id: 'd', code: 'CUSTOM', name: 'Chuyên ngành thực tế' }];
  const levels = [{ id: 'l', code: 'custom-level', name: 'Trình độ thực tế' }];
  for (const [domain, level, valid] of [['Chuyên ngành thực tế', 'Trình độ thực tế', true], ['UNKNOWN', 'custom-level', false], ['CUSTOM', 'UNKNOWN', false], ['', '', false]]) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['type', 'prompt', 'context', 'domain', 'level', 'skill', 'A', 'B', 'C', 'D', 'correct'],
      ['single_choice', 'A sufficiently long question?', '', domain, level, 'reading', 'Yes', 'No', '', '', 'A'],
    ]), 'Questions');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const result = await exports.parseQuestionsFromExcel({ arrayBuffer: async () => buffer }, domains, levels);
    assert.equal(result.rows[0].isValid, valid);
    if (valid) {
      assert.equal(result.rows[0].question.domainId, 'd');
      assert.equal(result.rows[0].question.levelName, 'Trình độ thực tế');
    } else assert.equal(result.rows[0].question, undefined);
  }
});
