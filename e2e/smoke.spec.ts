import { test, expect } from './fixtures'
import { navigateAndWait } from './helpers/navigation'

test.describe('Smoke tests', () => {
  test('/ redirects to /reports', async ({ page }) => {
    await navigateAndWait(page, '/')
    await expect(page).toHaveURL(/\/reports/)
    await expect(page.getByText('Reports')).toBeVisible()
  })

  test('/login loads and contains "Login"', async ({ page }) => {
    await navigateAndWait(page, '/login')
    await expect(page.getByText('Login')).toBeVisible()
  })

  test('/callback loads and contains "Processing authentication"', async ({
    page,
  }) => {
    await navigateAndWait(page, '/callback')
    await expect(
      page.getByText('Processing authentication...')
    ).toBeVisible()
  })

  test('/reports loads and contains "Reports"', async ({ page }) => {
    await navigateAndWait(page, '/reports')
    await expect(page.getByText('Reports')).toBeVisible()
  })

  test('/access loads and contains "Access Grants"', async ({ page }) => {
    await navigateAndWait(page, '/access')
    await expect(page.getByText('Access Grants')).toBeVisible()
  })

  test('/emergency loads and contains "Emergency Contacts"', async ({
    page,
  }) => {
    await navigateAndWait(page, '/emergency')
    await expect(page.getByText('Emergency Contacts')).toBeVisible()
  })

  test('/settings loads and contains "Settings"', async ({ page }) => {
    await navigateAndWait(page, '/settings')
    await expect(page.getByText('Settings')).toBeVisible()
  })
})
