import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditLabel } from './audit-labels.ts';
test('business names use confirmed outcomes while legacy HTTP 200 remains unconfirmed',()=>{
  assert.equal(auditLabel({eventKey:'auth.login',outcome:'success'}),'Đăng nhập thành công');
  assert.equal(auditLabel({eventKey:'auth.login',outcome:'failure'}),'Đăng nhập thất bại');
  assert.match(auditLabel({eventKey:null,outcome:null}),/chưa có xác nhận/);
  assert.match(auditLabel({eventKey:'role.assign',outcome:'success'}),/vai trò/);
});
