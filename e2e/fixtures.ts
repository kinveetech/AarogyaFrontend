import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

type Fixtures = {
  authenticatedPage: Page
}

/**
 * Custom test fixtures for Aarogya E2E tests.
 * `authenticatedPage` is a placeholder — will set up session cookies
 * once NextAuth integration is complete.
 */
export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    // TODO: Set up authenticated session (NextAuth cookies) once auth is implemented
    await use(page)
  },
})

export { expect } from '@playwright/test'
