import { test, expect, type Page } from '@playwright/test';

import authLogin from './fixtures/auth/login.json';
import authRefresh from './fixtures/auth/refresh.json';
import usersProfile from './fixtures/users/profile.json';
import scheduleGenerate from './fixtures/schedule/generate.json';
import tripsCreate from './fixtures/trips/create.json';
import tripsList from './fixtures/trips/list.json';

/**
 * Phase 2 PR-4 회귀 e2e — golden-path-plan.spec.ts 가 cover 하지 못하는
 * 3건을 격리 검증한다:
 *
 *   1. auth:logout 이벤트 → ItineraryDraftProvider 자체 구독으로 state 리셋
 *      (PR-4 신규 listener)
 *   2. MyTrips 에서 수동 logout → MyTrip Rules of Hooks 위반 미발현
 *      (PR-3 우회 호환성: handleLogout 동기 setter → await logout 순서)
 *   3. Regenerate (modify API) → applyRegenerateResult 가 currentItinerary
 *      / rawAIResponse 동시 갱신 (PR-4 신규 combined action)
 *
 * fixture / route 패턴은 golden-path-plan.spec.ts 를 그대로 재사용한다.
 */

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
 * 로그인 / 토큰 갱신 / 프로필 / 일정 생성 — 3 시나리오 모두 공통.
 * 호출 후 시나리오별 추가 stub 은 각 test 가 직접 등록한다.
 */
async function setupCommonRoutes(page: Page) {
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

  await page.route('**/schedules/generate', async (route) => {
    await route.fulfill(json(scheduleGenerate));
  });
}

/**
 * 로그인 → Plan 폼 채우기 → Generate.
 * btn-save-itinerary 가 보일 때까지 대기 (ItineraryDisplay 렌더 완료 신호).
 */
async function loginAndGenerate(page: Page) {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Sign in' }).first().click();
  const authDialog = page.getByRole('dialog');
  await expect(authDialog).toBeVisible();
  await authDialog.getByLabel('Email').fill(E2E_USER.email);
  await authDialog.getByLabel('Password').first().fill(E2E_USER.password);
  await authDialog.getByRole('button', { name: 'Sign In' }).click();
  await expect(authDialog).not.toBeVisible();

  await page.getByTestId('interest-food').click();
  await page.getByTestId('interest-culture').click();
  await page.getByTestId('style-balanced').click();
  await page.getByTestId('city-seoul').click();

  await page.getByRole('button', { name: /pick a date/i }).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '3 days' }).click();

  const generateBtn = page.getByTestId('btn-generate');
  await expect(generateBtn).toBeEnabled();
  await generateBtn.click();

  await expect(page.getByTestId('btn-save-itinerary')).toBeVisible();
}

test('auth:logout 이벤트 → currentItinerary / currentUser 리셋', async ({ page }) => {
  await setupCommonRoutes(page);
  await loginAndGenerate(page);

  // Provider listener 격리 검증: utils/api.ts → 401 → refresh fail → dispatch
  // chain 은 골든패스가 implicit cover. 본 시나리오는 dispatch 를 받았을 때
  // ItineraryDraftProvider / AuthProvider 가 정확히 state 를 리셋하는지를 본다.
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  });

  // AuthProvider: currentUser=null → 헤더 Sign in 재노출
  await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible();
  // ItineraryDraftProvider: currentItinerary=null → ItineraryDisplay unmount,
  // App.tsx 잔류 useEffect: showHero=true / activeTab="plan" → plan form 헤딩 재노출
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();
  // 저장 버튼이 사라졌는지 명시적으로 확인 (currentItinerary 리셋 증거)
  await expect(page.getByTestId('btn-save-itinerary')).not.toBeVisible();
});

test('MyTrips 에서 수동 로그아웃 → console error 0 + state 리셋', async ({ page }) => {
  // React Rules of Hooks 위반은 console.error 로 emit 된다.
  // pageerror 는 white screen 같은 throw 를 잡는다.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  await setupCommonRoutes(page);
  // 추가 stub: 일정 저장 / MyTrips 목록 / 로그아웃
  await page.route('**/api/v1/trips/with-itinerary', async (route) => {
    await route.fulfill(json(tripsCreate, 201));
  });
  await page.route('**/api/v1/trips?**', async (route) => {
    await route.fulfill(json(tripsList));
  });
  await page.route('**/api/v1/trips', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill(json(tripsList));
    } else {
      await route.continue();
    }
  });
  await page.route('**/api/v1/auth/logout', async (route) => {
    await route.fulfill(json({ success: true, data: null }, 200));
  });

  await loginAndGenerate(page);

  // Save → my-trips 진입 (MyTrip 컴포넌트 마운트)
  await page.getByTestId('btn-save-itinerary').click();
  const confirmDialog = page.getByRole('dialog').last();
  await confirmDialog.getByRole('button', { name: /confirm/i }).click();
  await expect(
    page.getByRole('heading', { name: /my trips/i, level: 1 }),
  ).toBeVisible();

  // 사용자 dropdown 열기 → Sign out. 헤더의 Language dropdown 도 Radix 라
  // aria-haspopup="menu" 만으로는 모호 — testid 로 user-menu 만 안정 매칭.
  // i18n 키 nav.logout 의 EN 값은 "Sign out".
  await page.getByTestId('btn-user-menu').click();
  await page.getByRole('menuitem', { name: /sign out/i }).click();

  // currentUser=null → Sign in 재노출 (AuthProvider.logout)
  await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible();
  // currentItinerary=null → plan form 재노출 (handleLogout 의 resetDraft)
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  // PR-3 우회가 살아있다면 (handleLogout 동기 setter → await logout)
  // MyTrip 의 Rules of Hooks 위반은 발현되지 않는다. console error 0 건이어야
  // 한다. (Phase 1.5 backlog #1 sonner Toaster 미마운트는 console.error 를
  // 발생시키지 않으므로 단순 [] 비교로 충분.)
  expect(errors).toEqual([]);
});

test('Regenerate → applyRegenerateResult → currentItinerary 갱신', async ({ page }) => {
  await setupCommonRoutes(page);

  // 기존 fixture 를 in-test 로 mutate — day 1 title 만 다르게 하여 갱신 증명.
  const modified = JSON.parse(JSON.stringify(scheduleGenerate));
  modified.itinerary[0].day_title = 'Day 1 - Modified Royal Seoul';
  // POST /schedules/{id}/modify (services/scheduleApi.ts:465)
  await page.route('**/schedules/*/modify', async (route) => {
    await route.fulfill(json(modified));
  });

  await loginAndGenerate(page);

  // 초기 itinerary 의 day 1 title 이 노출되는지 확인 (generate 결과)
  await expect(page.getByText(/Day 1 - Royal Seoul/).first()).toBeVisible();

  // ItineraryDisplay 의 "Refine this plan" 다이얼로그 트리거.
  // i18n 키 trips:itinerary.modifyRegenerate 의 EN 값.
  await page.getByRole('button', { name: /refine this plan/i }).first().click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox').fill('Add more nature spots');
  // 다이얼로그 내부의 "Regenerate Itinerary" 버튼.
  // i18n 키 trips:itinerary.regenerateItinerary.
  await dialog.getByRole('button', { name: /regenerate itinerary/i }).click();

  // applyRegenerateResult 가 currentItinerary + rawAIResponse 를 동시 갱신했다면
  // 변경된 day 1 title 이 노출되어야 한다.
  await expect(page.getByText(/Day 1 - Modified Royal Seoul/).first()).toBeVisible();
});
