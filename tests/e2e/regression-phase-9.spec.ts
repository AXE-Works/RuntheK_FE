import { test, expect, type Page } from '@playwright/test';

import authRefresh from './fixtures/auth/refresh.json';
import usersProfile from './fixtures/users/profile.json';
import recommendedList from './fixtures/recommended/list.json';

/**
 * Phase 2 PR-9 회귀 e2e — PR-9 의 새 행동 (main.tsx 의 path="*" Navigate redirect
 * + AppLayout outlet 안 배치) 을 검증한다. PR-9 이전엔 App 컴포넌트의 Navigate 가
 * catch-all 역할이었으나, PR-9 에서 App.tsx 삭제 + react-router-dom v6 표준 패턴
 * (path="*") 으로 교체되었다.
 *
 *   T1. 루트 / → /plan 리다이렉트 + AppLayout 헤더 렌더
 *   T2. 미정의 URL /foo/bar → /plan 리다이렉트 + AppLayout 헤더/푸터 렌더
 *        (옵션 X 결정의 핵심 회귀 가드 — 옵션 Y 였다면 빈 화면이 되어 실패)
 *   T3. 깊은 미정의 URL /some/deep/invalid/segments → /plan 리다이렉트
 *        (path="*" 가 multi-segment path 도 매칭하는지 boundary 검증)
 *
 * 패턴은 regression-phase-8-5.spec.ts 를 그대로 따른다 (setupCommonRoutes /
 * HOOK_VIOLATION_PATTERNS 인라인 정의 / page.route fulfill / fixture static import).
 */

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

/**
 * 비로그인 상태 stub — auth/refresh + users/profile(401) + recommended.
 * PR-9.5 의 3 test 는 모두 인증 흐름을 거치지 않으므로 login 함수 불필요.
 */
async function setupCommonRoutes(page: Page) {
  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill(json(authRefresh));
  });

  await page.route('**/api/v1/users/profile', async (route) => {
    // 비로그인 시 401 — AuthProvider 가 currentUser=null 로 초기화
    await route.fulfill({ status: 401, body: '' });
    // usersProfile 은 import 만 유지 (typecheck noUnusedParameters 회피 — fixtures 디렉토리 일관)
    void usersProfile;
  });

  await page.route('**/api/v1/recommended?**', async (route) => {
    await route.fulfill(json(recommendedList));
  });
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

test('루트 / → /plan 리다이렉트 + AppLayout 헤더 렌더', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  await page.goto('/');
  await page.waitForURL('**/plan');
  await expect(
    page.locator('img[alt="RuntheK - Your Personal Korea Travel Assistant"]'),
  ).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});

test('미정의 URL /foo/bar → /plan 리다이렉트 + AppLayout 헤더/푸터 렌더', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  await page.goto('/foo/bar');
  await page.waitForURL('**/plan');

  // AppLayout outlet 안에 path="*" Navigate 가 배치된 핵심 검증 —
  // 옵션 Y (catch-all 제거) 였다면 헤더/푸터 자체가 없는 빈 화면이었을 것.
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  await expect(
    page.locator('img[alt="RuntheK - Your Personal Korea Travel Assistant"]'),
  ).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});

test('깊은 미정의 URL /some/deep/invalid/segments → /plan 리다이렉트', async ({ page }) => {
  const errors = collectErrors(page);
  await setupCommonRoutes(page);

  await page.goto('/some/deep/invalid/segments');
  await page.waitForURL('**/plan');
  await expect(
    page.getByRole('heading', { name: /korean experience planner/i }),
  ).toBeVisible();

  expect(errors.filter(isHookViolation)).toEqual([]);
});
