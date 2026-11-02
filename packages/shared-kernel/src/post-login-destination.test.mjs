import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postLoginDestination } from './post-login-destination.ts';

test('first login sends unfinished and missing learner profiles to setup on both clients', async () => {
  for (const mobile of [false, true]) {
    const expected = mobile ? '/(onboarding)/goal' : '/onboarding';
    for (const profile of [null, {}, { onboardingCompleted: false }]) {
      assert.equal(await postLoginDestination({ mobile, loadProfile: async () => profile }), expected);
    }
    for (const error of [{ status: 404 }, { statusCode: 404 }]) {
      assert.equal(await postLoginDestination({ mobile, loadProfile: async () => { throw error; } }), expected);
    }
  }
});
test('returning learners skip setup; staff do not fetch learner profiles', async () => {
  for (const mobile of [false, true]) assert.equal(await postLoginDestination({ mobile, loadProfile: async () => ({ onboardingCompleted: true }) }), mobile ? '/(tabs)/home' : '/learn');
  for (const role of ['admin', 'teacher']) assert.equal(await postLoginDestination({ role, loadProfile: async () => { throw new Error('Must not fetch'); } }), '/admin/dashboard');
});
test('network and authorization failures never silently bypass onboarding', async () => {
  for (const error of [new Error('Offline'), { status: 503 }, { statusCode: 401 }]) await assert.rejects(() => postLoginDestination({ loadProfile: async () => { throw error; } }));
});
