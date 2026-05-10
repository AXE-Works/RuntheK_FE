#!/usr/bin/env node
// Phase 1.5 작업 6 — fixture drift detector for the Nightly job.
//
// Logs in with the seeded E2E user, replays the endpoints declared in
// fixture-endpoints.mjs, and compares the live BE response shape against
// the committed fixture. Exits 1 (CI failure → Issue auto-created) on
// any drift; 0 when every fixture matches.
//
// "Shape" means: every key present in the fixture must exist in the live
// response with the same primitive type. Live extras are tolerated.
// Fixture nulls do not require a matching key — the BE wraps with
// @JsonInclude(NON_NULL), so a null field can legitimately be absent.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENDPOINTS, E2E_USER } from './fixture-endpoints.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, '../tests/e2e/fixtures');
const BE_URL = process.env.E2E_BE_URL ?? 'http://localhost:8080';

let driftCount = 0;

async function login() {
  const res = await fetch(`${BE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: E2E_USER.email, password: E2E_USER.password }),
  });
  if (!res.ok) {
    throw new Error(`login failed: ${res.status} ${await res.text().catch(() => '')}`);
  }
  const json = await res.json();
  return {
    accessToken: json?.data?.token?.accessToken,
    refreshCookie: res.headers.get('set-cookie') ?? '',
  };
}

function compareShape(expected, actual, prefix = '') {
  const drift = [];

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      drift.push(`${prefix || '(root)'}: expected array, got ${typeof actual}`);
      return drift;
    }
    if (expected.length === 0 || actual.length === 0) return drift;
    drift.push(...compareShape(expected[0], actual[0], `${prefix}[0]`));
    return drift;
  }

  if (expected === null) return drift;

  if (typeof expected !== 'object') {
    if (typeof expected !== typeof actual) {
      drift.push(`${prefix}: expected ${typeof expected}, got ${typeof actual}`);
    }
    return drift;
  }

  for (const key of Object.keys(expected)) {
    const e = expected[key];
    const present = key in actual;
    if (!present) {
      // Tolerate null fields being elided by @JsonInclude(NON_NULL).
      if (e === null) continue;
      drift.push(`missing key: ${prefix}${key}`);
      continue;
    }
    const a = actual[key];
    if (e === null) continue; // null fixture allows any actual value
    if (typeof e !== typeof a) {
      drift.push(`type mismatch: ${prefix}${key} (expected ${typeof e}, got ${typeof a})`);
      continue;
    }
    if (typeof e === 'object' && e !== null) {
      drift.push(...compareShape(e, a, `${prefix}${key}.`));
    }
  }

  return drift;
}

async function main() {
  console.log(`[fixture-diff] BE = ${BE_URL}`);
  const session = await login();

  for (const ep of ENDPOINTS) {
    const fixturePath = path.join(FIXTURE_DIR, ep.fixture);
    const expected = JSON.parse(await readFile(fixturePath, 'utf8'));

    const headers = { 'Content-Type': 'application/json' };
    if (ep.auth === 'bearer' && session.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    } else if (ep.auth === 'cookie' && session.refreshCookie) {
      headers.Cookie = session.refreshCookie;
    }

    const init = { method: ep.method, headers };
    if (ep.body) init.body = JSON.stringify(ep.body());

    const res = await fetch(`${BE_URL}${ep.path}`, init);
    if (!res.ok) {
      console.error(`[ERROR] ${ep.fixture} ← ${ep.method} ${ep.path}: HTTP ${res.status}`);
      driftCount++;
      continue;
    }

    let actual;
    try {
      actual = await res.json();
    } catch (parseErr) {
      console.error(`[ERROR] ${ep.fixture}: response is not JSON (${parseErr.message})`);
      driftCount++;
      continue;
    }

    const drift = compareShape(expected, actual);
    if (drift.length > 0) {
      console.error(`[DRIFT] ${ep.fixture}`);
      for (const line of drift) console.error(`  - ${line}`);
      driftCount++;
    } else {
      console.log(`[OK]    ${ep.fixture}`);
    }
  }

  if (driftCount > 0) {
    console.error(`\n${driftCount} fixture(s) drifted from BE. Capture fresh ones with \`npm run e2e:fixture-capture\` and review the diff before committing.`);
    process.exit(1);
  }
  console.log(`\nAll ${ENDPOINTS.length} fixtures match BE shape.`);
}

main().catch((err) => {
  console.error('[FATAL]', err.message);
  process.exit(2);
});
