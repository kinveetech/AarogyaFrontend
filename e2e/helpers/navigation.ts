import type { Page } from '@playwright/test'

export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
}

export async function navigateAndWait(
  page: Page,
  path: string
): Promise<void> {
  await page.goto(path)
  await waitForPageReady(page)
}
