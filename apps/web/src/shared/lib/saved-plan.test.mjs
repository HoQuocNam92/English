import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';
test('plan screen only shows progression and setup when needed, without fixed-week plan or home action', () => {
 const ts=createRequire(import.meta.url)('typescript');let available=null;const exports={};const jsx=(type,props)=>({type,props});
 const mocks={'react/jsx-runtime':{jsx,jsxs:jsx},react:{useState:()=>[available,value=>{available=value}]},'next/link':{default:'link'},'@/shared/layout':{LearnerShell:'shell'},'@/shared/ui/LearningPathJourney':{LearningPathJourney:'journey'}};
 const code=ts.transpileModule(readFileSync(new URL('../../../app/(learner)/learn/plan/page.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 runInNewContext(code,{exports,require:name=>{assert.ok(name in mocks,name);return mocks[name]}});
 let tree=nodes(exports.default());assert.equal(tree.filter(node=>node.type==='journey').length,1);assert.equal(tree.find(node=>node.type==='journey').props.full,true);
 tree.find(node=>node.type==='journey').props.onAvailability(false);tree=nodes(exports.default());assert.ok(tree.some(node=>node.type==='link'&&node.props.href==='/learn/profile?tab=goals'));
 assert.ok(!tree.some(node=>node.type==='link'&&node.props.href==='/learn'));assert.ok(!label(exports.default()).includes('4 tuần'));
});
