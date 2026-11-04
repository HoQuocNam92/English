import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts=createRequire(import.meta.url)('typescript');
const source=readFileSync(new URL('../auth/SessionMonitor.tsx',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('streaming revocation logs out immediately, handles split frames and keeps bearer tokens out of URLs',async()=>{
 let cleanup,cleared=0;const redirects=[],requests=[];
 const encoder=new TextEncoder();
 const body=new ReadableStream({start(controller){for(const part of ['event: heartbeat\ndata: {}\n\nevent: rev','oked\r\ndata: {"reason":"SESSION_REVOKED"}\r\n\r\n'])controller.enqueue(encoder.encode(part));controller.close()}});
 const mocks={react:{useEffect:effect=>{cleanup=effect()}},'@/shared/config/env':{API_BASE_URL:'https://example.invalid/api/v1'},'@/shared/api/api-client':{apiClient:{get:async()=>{}}},'@/shared/storage':{AUTH_SESSION_KEY:'session',clearAuthSession:()=>cleared++,sessionStorageTarget:()=>({getItem:()=>JSON.stringify({accessToken:'PRIVATE_BEARER'})})}};
 const exports={};runInNewContext(code,{exports,require:name=>mocks[name],AbortController,TextDecoder,setTimeout:()=>1,clearTimeout:()=>{},fetch:async(url,options)=>{requests.push({url,options});return{ok:true,status:200,body}},window:{location:{replace:path=>redirects.push(path)}}});
 exports.SessionMonitor();await tick();await tick();
 assert.equal(cleared,1);assert.deepEqual(redirects,['/login']);assert.equal(requests[0].options.headers.Authorization,'Bearer PRIVATE_BEARER');assert.ok(!requests[0].url.includes('PRIVATE_BEARER'));cleanup();
});
test('a network failure never masquerades as a revoked session',async()=>{
 let cleanup,cleared=0,retries=0;
 const mocks={react:{useEffect:effect=>{cleanup=effect()}},'@/shared/config/env':{API_BASE_URL:'https://example.invalid'},'@/shared/api/api-client':{apiClient:{get:async()=>{}}},'@/shared/storage':{AUTH_SESSION_KEY:'session',clearAuthSession:()=>cleared++,sessionStorageTarget:()=>({getItem:()=>'{"accessToken":"test"}'})}};
 const exports={};runInNewContext(code,{exports,require:name=>mocks[name],AbortController,TextDecoder,setTimeout:()=>{retries++;return 1},clearTimeout:()=>{},fetch:async()=>{throw Error('offline')},window:{location:{replace:()=>{throw Error('unexpected logout')}}}});
 exports.SessionMonitor();await tick();assert.equal(cleared,0);assert.equal(retries,1);cleanup();
});
