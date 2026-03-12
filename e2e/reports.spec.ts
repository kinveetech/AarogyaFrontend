import { test, expect } from './fixtures'
import { navigateAndWait } from './helpers/navigation'

test.describe('Reports page', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await navigateAndWait(page, '/reports')
    await expect(page).toHaveURL(/\/login/)
  })

  test('page heading is visible after login redirect', async ({ page }) => {
    // Until auth fixture is implemented, this verifies the redirect flow
    await navigateAndWait(page, '/reports')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  // The following tests require authentication — they will run once
  // the `authenticatedPage` fixture sets up session cookies.

  test.describe('authenticated', () => {
    test.skip(true, 'Requires auth fixture — enable when authenticatedPage is ready')

    test('page loads with heading', async ({ authenticatedPage: page }) => {
      await navigateAndWait(page, '/reports')
      await expect(page.getByRole('heading', { name: 'My Reports' })).toBeVisible()
    })

    test('search input is visible', async ({ authenticatedPage: page }) => {
      await navigateAndWait(page, '/reports')
      await expect(page.getByPlaceholder('Search reports...')).toBeVisible()
    })

    test('upload button is visible', async ({ authenticatedPage: page }) => {
      await navigateAndWait(page, '/reports')
      await expect(page.getByRole('button', { name: 'Upload Report' })).toBeVisible()
    })

    test('upload button navigates to upload page', async ({ authenticatedPage: page }) => {
      await navigateAndWait(page, '/reports')
      await page.getByRole('button', { name: 'Upload Report' }).click()
      await expect(page).toHaveURL(/\/reports\/upload/)
    })

    test('type filter pills are visible', async ({ authenticatedPage: page }) => {
      await navigateAndWait(page, '/reports')
      await expect(page.getByRole('button', { name: 'All Types' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Blood Test' })).toBeVisible()
    })

    test('pagination controls are visible with data', async ({ authenticatedPage: page }) => {
      await navigateAndWait(page, '/reports')
      // Only shows when there are reports
      const pagination = page.getByTestId('pagination-info')
      if (await pagination.isVisible()) {
        await expect(pagination).toContainText('Showing')
      }
    })
  })
})
