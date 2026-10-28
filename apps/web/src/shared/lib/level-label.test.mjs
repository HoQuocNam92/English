import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('./level-label.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
runInNewContext(code, { exports });
const { localizeLevelFields } = exports;

test('learning path current and next levels are Vietnamese across every promotion', () => {
  for (const [current, next, currentLabel, nextLabel] of [
    ['Beginner', 'Intermediate', 'Cơ bản', 'Trung cấp'],
    ['Intermediate', 'Advanced', 'Trung cấp', 'Nâng cao'],
    ['Advanced', 'Professional', 'Nâng cao', 'Chuyên nghiệp'],
  ]) {
    const input = {
      level: { id: 'current', code: current.toLowerCase(), name: current },
      nextLevel: { id: 'next', code: next.toLowerCase(), name: next },
      domains: [{ name: 'Software Engineering' }],
      title: 'Intermediate reading',
    };
    const result = localizeLevelFields(input);
    assert.equal(result.level.name, currentLabel);
    assert.equal(result.nextLevel.name, nextLabel);
    assert.equal(result.level.code, input.level.code);
    assert.equal(result.nextLevel.code, input.nextLevel.code);
    assert.equal(result.nextLevel.id, 'next');
    assert.equal(result.domains[0].name, 'Software Engineering');
    assert.equal(result.title, input.title);
    assert.equal(input.nextLevel.name, next, 'leave the source response unchanged');
  }
});

test('final level keeps a null nextLevel and Vietnamese labels stay unchanged', () => {
  const result = localizeLevelFields({ level: { name: 'Chuyên nghiệp' }, nextLevel: null });
  assert.equal(result.level.name, 'Chuyên nghiệp');
  assert.equal(result.nextLevel, null);
});
