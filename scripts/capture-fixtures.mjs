#!/usr/bin/env node
// Phase 1.5 작업 6 — fixture refresh tool for developers.
//
// Logs in with the seeded E2E user against a local BE
// (`./gradlew bootRun --args='--spring.profiles.active=dev'`), replays
// the endpoints in fixture-endpoints.mjs, masks sensitive values, and
// overwrites the matching tests/e2e/fixtures/*.json on disk.
//
// Use case: when the BE PR author changes a response shape, run this to
// regenerate the committed fixtures, then review the diff in their PR
// (per spec §1.4 fixture owner = BE PR author, never auto-commit).
//
// Sensitive values masked
//   - data.token.accessToken           → eyJhbGc...captured-placeholder.signature
//   - data.user.id / data.id (UUIDs)   → 00000000-0000-0000-0000-000000000001
//   - meta.timestamp                   → 2026-05-10T00:00:00 (frozen)
//   - meta.requestId                   → 00000000-0000-0000-0000-000000000099

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENDPOINTS, E2E_USER } from './fixture-endpoints.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, '../tests/e2e/fixtures');
const BE_URL = process.env.E2E_BE_URL ?? 'http://localhost:8080';

const FROZEN_TIMESTAMP = '2026-05-10T00:00:00';
const FROZEN_REQUEST_ID = '00000000-0000-0000-0000-000000000099';
const FROZEN_USER_ID = '00000000-0000-0000-0000-000000000001';
const FROZEN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.captured-placeholder.signature';

function isUuidString(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function mask(value, key) {
  if (Array.isArray(value)) return value.map((v) => mask(v, ''));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = mask(v, k);
    return out;
  }
  if (typeof value === 'string') {
    if (key === 'accessToken') return FROZEN_TOKEN;
    if (key === 'requestId' && isUuidString(value)) return FROZEN_REQUEST_ID;
    if (key === 'timestamp' && /\d{4}-\d{2}-\d{2}T/.test(value)) return FROZEN_TIMESTAMP;
    if (key === 'id' && isUuidString(value)) return FROZEN_USER_ID;
  }
  return value;
}

async function login() {
  const res = await fetch(`${BE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: E2E_USER.email, password: E2E_USER.password }),
  });
  if (!res.ok) {
    throw new Error(`login failed: ${res.status} ${await res.text().catch(() => '')}`);
  }
  return {
    body: await res.json(),
    refreshCookie: res.headers.get('set-cookie') ?? '',
  };
}

async function main() {
  console.log(`[fixture-capture] BE = ${BE_URL}`);
  const loginResult = await login();
  const accessToken = loginResult.body?.data?.token?.accessToken;

  for (const ep of ENDPOINTS) {
    const fixturePath = path.join(FIXTURE_DIR, ep.fixture);

    let body;
    if (ep.fixture === 'auth/login.json') {
      body = loginResult.body;
    } else {
      const headers = { 'Content-Type': 'application/json' };
      if (ep.auth === 'bearer' && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      } else if (ep.auth === 'cookie' && loginResult.refreshCookie) {
        headers.Cookie = loginResult.refreshCookie;
      }

      const init = { method: ep.method, headers };
      if (ep.body) init.body = JSON.stringify(ep.body());

      const res = await fetch(`${BE_URL}${ep.path}`, init);
      if (!res.ok) {
        console.error(`[FAIL] ${ep.fixture} ← ${ep.method} ${ep.path}: HTTP ${res.status}`);
        process.exit(1);
      }
      body = await res.json();
    }

    const masked = mask(body, '');
    await mkdir(path.dirname(fixturePath), { recursive: true });
    await writeFile(fixturePath, JSON.stringify(masked, null, 2) + '\n', 'utf8');
    console.log(`[CAPTURED] ${ep.fixture}`);
  }

  console.log(`\nWrote ${ENDPOINTS.length} fixtures to ${FIXTURE_DIR}. Review the diff before committing.`);
}

main().catch((err) => {
  console.error('[FATAL]', err.message);
  process.exit(2);
});
