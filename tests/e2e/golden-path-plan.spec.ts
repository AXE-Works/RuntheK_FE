import { test, expect } from '@playwright/test';

import authLogin from './fixtures/auth/login.json';
import authRefresh from './fixtures/auth/refresh.json';
import usersProfile from './fixtures/users/profile.json';
import scheduleGenerate from './fixtures/schedule/generate.json';
import tripsCreate from './fixtures/trips/create.json';
import tripsList from './fixtures/trips/list.json';

const E2E_USER = {
  email: 'e2e-user@runthek.test',
  password: 'Test1234!',
};

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

/**
 * Phase 1.5 PR-3 — Golden path scenario A.
 *
 * Adapts spec phase-1.5-e2e.md §작업 2 to the current Vite catch-all SPA:
 *   - main.tsx mounts a single `path="/*"` route, so the URL stays `/`
 *     throughout. We assert DOM state instead of `toHaveURL()`.
 *   - TravelPlanForm gates Generate behind `currentUser`; clicking it while
 *     logged out only shows a toast, so we open AuthModal via the header
 *     "Sign in" button before filling the form.
 *   - City / interest / travel-style choices are clickable `<div>`s, not
 *     `<button>`s. We address them by `data-testid` (added in this PR).
 *
 * BE / AI fixtures live under `./fixtures/**` and mirror the real
 * `ApiResponse<T>` and `ScheduleGenerateResponse` shapes — see
 * phase-1.5-e2e.md §1.4 / §작업 6.
 */
test('비로그인 → 로그인 → 일정 생성 → 저장 → MyTrips', async ({ page }) => {
  // ── BE / AI stubs ─────────────────────────────────────────────────────────
  // Profile probes start unauthenticated; once login responds, AuthContext
  // re-fetches and we want it to succeed.
  let loggedIn = false;

  await page.route('**/api/v1/auth/login', async (route) => {
    loggedIn = true;
    await route.fulfill({
      ...json(authLogin),
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie':
          'refreshToken=rt-placeholder; Path=/api/v1/auth; HttpOnly; SameSite=Lax; Max-Age=604800',
      },
    });
  });

  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill(json(authRefresh));
  });

  await page.route('**/api/v1/users/profile', async (route) => {
    if (!loggedIn) {
      await route.fulfill({ status: 401, body: '' });
      return;
    }
    await route.fulfill(json(usersProfile));
  });

  // AI server (runthek-api.onrender.com/...) — match by path only so the
  // exact host/scheme/version segment doesn't matter.
  await page.route('**/schedules/generate', async (route) => {
    await route.fulfill(json(scheduleGenerate));
  });

  // Trip save → POST /api/v1/trips/with-itinerary  (App.tsx:454-461)
  await page.route('**/api/v1/trips/with-itinerary', async (route) => {
    await route.fulfill(json(tripsCreate, 201));
  });

  // My Trips list → GET /api/v1/trips?...
  await page.route('**/api/v1/trips?**', async (route) => {
    await route.fulfill(json(tripsList));
  });
  await page.route('**/api/v1/trips', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill(json(tripsList));
    } else {
      // Defensive: any non-GET on bare /trips is unexpected in this scenario.
      await route.continue();
    }
  });

  // ── 1. Plan page renders on `/` ──────────────────────────────────────────
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  // ── 2. Open AuthModal via header "Sign in" button ────────────────────────
  // Header sign-in is the first occurrence on the page; the in-modal "Sign
  // In" submit comes later inside `[role="dialog"]`.
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  const authDialog = page.getByRole('dialog');
  await expect(authDialog).toBeVisible();

  // ── 3. Login ─────────────────────────────────────────────────────────────
  await authDialog.getByLabel('Email').fill(E2E_USER.email);
  await authDialog.getByLabel('Password').first().fill(E2E_USER.password);
  await authDialog.getByRole('button', { name: 'Sign In' }).click();
  await expect(authDialog).not.toBeVisible();

  // ── 4. Fill the plan form ────────────────────────────────────────────────
  // Interests (2 picks)
  await page.getByTestId('interest-food').click();
  await page.getByTestId('interest-culture').click();

  // Travel style (replaces the spec's "mid-range" → "balanced")
  await page.getByTestId('style-balanced').click();

  // City
  await page.getByTestId('city-seoul').click();

  // Start date — open the Popover, then jump one row (≈7 days) ahead from
  // the initially focused selectable day and confirm with Enter. Avoids
  // depending on react-day-picker's exact DOM.
  await page.getByRole('button', { name: /pick a date/i }).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  // Duration — Radix Select (combobox + option)
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '3 days' }).click();

  // Generate (now enabled because user/duration/interests/startDate are set)
  const generateBtn = page.getByTestId('btn-generate');
  await expect(generateBtn).toBeEnabled();
  await generateBtn.click();

  // ── 5. Itinerary renders → Save ──────────────────────────────────────────
  const saveBtn = page.getByTestId('btn-save-itinerary');
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();

  // Confirmation dialog → click Confirm
  const confirmDialog = page.getByRole('dialog').last();
  await confirmDialog.getByRole('button', { name: /confirm/i }).click();

  // ── 6. Save success → MyTrips tab visible ────────────────────────────────
  // App.tsx:450 emits a hardcoded toast and switches activeTab to "my-trips".
  // URL stays `/` until Phase 2 PR-8 lands real routes.
  await expect(page.getByText('Trip saved successfully!')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /my trips/i }),
  ).toBeVisible();
});
