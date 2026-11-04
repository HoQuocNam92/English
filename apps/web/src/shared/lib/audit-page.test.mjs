import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts=createRequire(import.meta.url)('typescript');
function load(path,mocks={}){const code=ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;const exports={};runInNewContext(code,{exports,URLSearchParams,Date,setTimeout:()=>1,clearTimeout:()=>{},document:{activeElement:null,addEventListener(){},removeEventListener(){}},require:name=>{assert.ok(name in mocks,name);return mocks[name]}});return exports}
const labels=load('./audit-labels.ts');
const nodes=tree=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(nodes):[tree,...nodes(tree.props?.children)];
const text=tree=>typeof tree==='string'||typeof tree==='number'?String(tree):Array.isArray(tree)?tree.map(text).join(''):tree?.props?text(tree.props.children):'';
const id='11111111-1111-4111-8111-111111111111';
const row={id,actorEmail:'admin@example.invalid',actorId:id,method:'POST',route:'/api/v1/auth/login',targetIds:[],statusCode:200,createdAt:'2026-11-04T00:00:00Z',ipAddress:'127.0.0.1',eventKey:null,outcome:null,severity:'info',requestId:null,targetType:null,requestedCount:null,updatedCount:null,skippedCount:null};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness({fail=false}={}){
 let cursor=0,effects=[],failed=fail;const state=[],requests=[];
 const react={useState:init=>{const index=cursor++;if(!(index in state))state[index]=typeof init==='function'?init():init;return[state[index],value=>state[index]=typeof value==='function'?value(state[index]):value]},useRef:init=>{const index=cursor++;return state[index]??={current:init}},useEffect:(effect,deps)=>{const index=cursor++;if(!state[index]||deps.some((value,i)=>value!==state[index][i])){state[index]=deps;effects.push(effect)}}};
 const jsx=(type,props)=>({type,props});
 const Page=load('../../../app/(admin)/admin/audit-logs/page.tsx',{react,'react/jsx-runtime':{jsx,jsxs:jsx},'@/shared/ui/Pagination':{Pagination:'pagination'},'@/shared/ui/PageHeader':{PageHeader:'header'},'@/shared/ui/Modal':{Modal:'modal'},'@/shared/ui/Dropdown':{Dropdown:'select'},'@/shared/lib/audit-labels':labels,'@/shared/api/api-client':{apiClient:{get:async path=>{requests.push(path);if(path.includes('/alerts'))return{data:[]};if(path==='/audit-logs/'+id)return{...row,eventKey:'role.assign',outcome:'success',oldValues:{roles:[]},newValues:{roles:[{code:'admin'}]}};if(failed){failed=false;throw Error('Không tải được nhật ký')}return{data:[row],meta:{total:51,totalPages:3,nextCursor:id}}}}}}).default;
 const render=()=>{cursor=0;effects=[];const tree=Page();const run=effects;effects=[];run.forEach(effect=>effect());return tree};
 return{render,requests,find:predicate=>nodes(render()).find(predicate)};
}
test('audit page keeps legacy 200 unconfirmed, exposes all server filters, and opens real detail data',async()=>{
 const h=harness();h.render();await tick();
 const rows=nodes(h.render()).filter(node=>node.type==='tr');assert.match(text(rows[1]),/Chưa xác nhận nghiệp vụ/);assert.ok(!text(rows[1]).includes('Thành công'));
 assert.ok(h.find(node=>node.type==='input'&&node.props.type==='datetime-local'));
 h.find(node=>node.type==='input'&&node.props.placeholder==='Email hoặc mã tài khoản').props.onChange({target:{value:id}});
 const action=nodes(h.render()).find(node=>node.type==='select'&&node.props.value===''&&nodes(node).some(option=>option.props?.value==='role.assign'));
 action.props.onChange({target:{value:'role.assign'}});
 h.find(node=>node.type==='form').props.onSubmit({preventDefault(){}});h.render();await tick();
 const query=new URLSearchParams(h.requests.filter(path=>path.startsWith('/audit-logs?')).at(-1).split('?')[1]);assert.equal(query.get('actor'),id);assert.equal(query.get('eventKey'),'role.assign');
 h.find(node=>node.type==='button'&&text(node)==='Xem').props.onClick();h.render();await tick();
 const modal=h.find(node=>node.type==='modal');assert.equal(modal.props.open,true);assert.match(text(modal),/Trước thay đổi/);assert.match(text(modal),/Sau thay đổi/);assert.ok(h.requests.includes('/audit-logs/'+id));
});
test('audit page retries storage failures and uses shared pagination and sends page and size to the backend',async()=>{
 const h=harness({fail:true});h.render();await tick();assert.match(text(h.render()),/Không tải được nhật ký/);
 h.find(node=>node.type==='button'&&text(node)==='Thử lại').props.onClick();h.render();await tick();
 h.find(node=>node.type==='pagination').props.onPageChange(3);h.render();await tick();
 let query=new URLSearchParams(h.requests.filter(path=>path.startsWith('/audit-logs?')).at(-1).split('?')[1]);assert.equal(query.get('page'),'3');assert.equal(query.get('limit'),'10');assert.equal(query.has('cursor'),false);
 h.find(node=>node.type==='pagination').props.onLimitChange(20);h.render();await tick();
 query=new URLSearchParams(h.requests.filter(path=>path.startsWith('/audit-logs?')).at(-1).split('?')[1]);assert.equal(query.get('page'),'1');assert.equal(query.get('limit'),'20');
});
