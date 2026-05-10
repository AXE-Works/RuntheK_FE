// Phase 1.5 작업 6 — shared endpoint map for capture / diff scripts.
//
// Each entry maps a fixture file (under tests/e2e/fixtures/) to the BE
// endpoint that produced it. capture-fixtures.mjs writes responses here;
// fixture-diff.mjs reads them back and compares the BE shape against the
// committed fixture (Nightly job in .github/workflows/e2e-nightly.yml).
//
// Intentionally omitted entries
// - tests/e2e/fixtures/trips/create.json    POST /trips/with-itinerary
//   Requires the full AI → save flow (CreateTripWithItineraryRequest body
//   shape mirrors the AI response). Verifying this needs a live AI call,
//   which Phase 1.5 §1.4 explicitly stubs in every environment.
// - tests/e2e/fixtures/schedule/generate.json
//   This is the AI server (runthek-api.onrender.com), not the BE. AI
//   regression is tracked separately per spec §3.

export const E2E_USER = Object.freeze({
  email: 'e2e-user@runthek.test',
  password: 'Test1234!',
});

/** @typedef {{ fixture: string, method: 'GET'|'POST', path: string, auth: false|'bearer'|'cookie', body?: () => unknown }} EndpointSpec */

/** @type {ReadonlyArray<EndpointSpec>} */
export const ENDPOINTS = Object.freeze([
  {
    fixture: 'auth/login.json',
    method: 'POST',
    path: '/api/v1/auth/login',
    body: () => ({ email: E2E_USER.email, password: E2E_USER.password }),
    auth: false,
  },
  {
    fixture: 'auth/refresh.json',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    body: () => ({}),
    auth: 'cookie',
  },
  {
    fixture: 'users/profile.json',
    method: 'GET',
    path: '/api/v1/users/profile',
    auth: 'bearer',
  },
  {
    fixture: 'trips/list.json',
    method: 'GET',
    path: '/api/v1/trips?page=1&limit=10',
    auth: 'bearer',
  },
]);
