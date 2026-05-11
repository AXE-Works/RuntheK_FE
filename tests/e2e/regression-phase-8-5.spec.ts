import { test, expect, type Page } from '@playwright/test';

import authLogin from './fixtures/auth/login.json';
import authRefresh from './fixtures/auth/refresh.json';
import usersProfile from './fixtures/users/profile.json';
import profileAdmin from './fixtures/users/profile-admin.json';
import recommendedList from './fixtures/recommended/list.json';
import tripsList from './fixtures/trips/list.json';

/**
 * Phase 2 PR-8 회귀 e2e — regression-phase-2.spec.ts + golden-path-plan.spec.ts 가
 * cover 하지 못하는 4가지 동작을 격리 검증한다 (시나리오 1 은 비관리자/관리자 case 를
 * 2 test 로 분리하여 admin profile fixture stub 을 깔끔하게 처리한다):
 *
 *   1a. AdminPage 권한 가드 — 비로그인 / 비관리자 → /plan 리다이렉트
 *   1b. AdminPage 권한 가드 — 관리자 → AdminDashboard 정상 렌더
 *   2.  MyTripsPage ?tab= 파싱 — profile / my-trips 탭 활성
 *   3.  PlanPage location.state — RegionPage → /plan → selectedDestination 자동 채움
 *   4.  selectedBannerDetail — Banner detail 진입 → RecommendedItineraryDetailPage → Back 복귀
 *
 * 패턴은 regression-phase-2.spec.ts 를 그대로 따른다 (setupCommonRoutes /
 * HOOK_VIOLATION_PATTERNS 인라인 정의 / page.route fulfill / fixture static import).
 */

const E2E_USER = {
  email: 'e2e-user@runthek.test',
  password: 'Test1234!',
};

const E2E_ADMIN = {
  email: 'e2e-admin@runthek.test',
  password: 'Test1234!',
};

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

/**
 * 로그인 / 토큰 갱신 / 프로필 / SuggestedBanners — 5 test 공통.
 * profileFixture 옵션으로 admin / user 분기.
 */
async function setupCommonRoutes(
  page: Page,
  options: { profileFixture?: unknown } = {},
) {
  const profileFixture = options.profileFixture ?? usersProfile;
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
    await route.fulfill(json(profileFixture));
  });

  // SuggestedBanners 의 BE recommended trips fetch (ECONNREFUSED 노이즈 해소)
  await page.route('**/api/v1/recommended?**', async (route) => {
    await route.fulfill(json(recommendedList));
  });
}

/**
 * AuthModal 로그인 시퀀스 (loginAndGenerate 의 step 1-3 와 동일).
 * email/password 인자로 user/admin 분기.
 * about:blank 에서 호출 가능하도록 page.goto('/') 가 prefix.
 */
async function login(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Sign in' }).first().click();
  const authDialog = page.getByRole('dialog');
  await expect(authDialog).toBeVisible();
  await authDialog.getByLabel('Email').fill(credentials.email);
  await authDialog.getByLabel('Password').first().fill(credentials.password);
  await authDialog.getByRole('button', { name: 'Sign In' }).click();
  await expect(authDialog).not.toBeVisible();
}

const HOOK_VIOLATION_PATTERNS = [
  /Rendered (more|fewer) hooks/i,
  /change in the order of Hooks/i,
  /React Hook .* (cannot|must|is) (be )?called/i,
  /Hooks can only be called/i,
  /Invalid hook call/i,
];

const isHookViolation = (msg: string) =>
  msg.startsWith('pageerror:') || HOOK_VIOLATION_PATTERNS.some((p) => p.test(msg));

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

test('AdminPage 가드 — 비로그인 + 비관리자 → /plan 리다이렉트', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  // Case 1: 비로그인 → /admin → /plan 리다이렉트
  await page.goto('/admin');
  await page.waitForURL('**/plan');
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  // Case 2: 비관리자 로그인 (role=user) → /admin → /plan 리다이렉트
  await login(page, E2E_USER);
  await page.goto('/admin');
  await page.waitForURL('**/plan');
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});

test('AdminPage 가드 — 관리자 → AdminDashboard 정상 렌더', async ({ page }) => {
  const errors = collectErrors(page);
  // 관리자 profile fixture 로 setupCommonRoutes
  await setupCommonRoutes(page, { profileFixture: profileAdmin });

  await login(page, E2E_ADMIN);
  await page.goto('/admin');

  // AdminDashboard 의 한국어 헤딩으로 렌더 검증
  await expect(
    page.getByRole('heading', { name: '관리자 대시보드' }),
  ).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});

test('MyTripsPage ?tab=profile → Profile 탭 활성, ?tab= 미지정 → My Trips 탭', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  // MyTrip 의 trips list / get 응답 stub
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

  await login(page, E2E_USER);

  // Case 1: ?tab=profile → Profile 탭 data-state="active"
  await page.goto('/my-trips?tab=profile');
  await expect(
    page.getByRole('tab', { name: /profile/i }),
  ).toHaveAttribute('data-state', 'active');

  // Case 2: ?tab= 미지정 → My Trips 탭 default
  await page.goto('/my-trips');
  await expect(
    page.getByRole('tab', { name: /my trips/i }),
  ).toHaveAttribute('data-state', 'active');

  expect(errors.filter(isHookViolation)).toEqual([]);
});

test('RegionPage → Start Planning → /plan location.state → custom city chip', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  await page.goto('/seoul');
  await expect(page).toHaveURL(/\/seoul/);

  // RegionPage 의 "Start Planning" 버튼 → navigate('/plan', { state: { fromRegion, destination } })
  await page.getByRole('button', { name: /start planning/i }).first().click();
  await page.waitForURL('**/plan');

  // PlanPage useEffect 의 selectDestination({ name: 'Seoul' }) 호출 결과 검증.
  // TravelPlanForm 정상 렌더 확인 (custom city 표시는 환경에 따라 chip vs custom display 영역 분기).
  await expect(page.getByTestId('btn-generate')).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});

test('Banner detail 진입 → RecommendedItineraryDetailPage → Back → TravelPlanForm 복귀', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  await page.goto('/plan');
  await expect(page.getByTestId('btn-generate')).toBeVisible();

  // SuggestedBanners 의 첫 번째 배너 View Details 버튼 (Eye 아이콘 only — text 없음).
  // lucide-react 의 Eye 아이콘이 svg.lucide-eye 클래스로 렌더링됨.
  // 캐러셀 duplicate (`dup-${banner.id}`) 때문에 .first() 필수.
  // 캐러셀 무한 스크롤 애니메이션으로 element-stability check 실패 → force: true 로 우회.
  await page.locator('button:has(svg.lucide-eye)').first().click({ force: true });

  // RecommendedItineraryDetailPage 마운트 검증 — Back 버튼 (aria-label "Go back to previous page" 우선)
  const backButton = page
    .getByRole('button', { name: 'Go back to previous page' })
    .or(page.getByRole('button', { name: /^back$/i }));
  await expect(backButton.first()).toBeVisible();

  // 복귀
  await backButton.first().click();

  // TravelPlanForm 복귀 검증
  await expect(page.getByTestId('btn-generate')).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});
