import { test, expect } from './fixtures'
import { navigateAndWait } from './helpers/navigation'

test.describe('Smoke tests', () => {
  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await navigateAndWait(page, '/')
    await expect(page).toHaveURL(/\/reports/)

    expect(errors).toEqual([])
  })

  test('/ redirects to /reports', async ({ page }) => {
    await navigateAndWait(page, '/')
    await expect(page).toHaveURL(/\/reports/)
    await expect(page.getByRole('main').getByText('Reports')).toBeVisible()
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
    await expect(page.getByRole('main').getByText('Reports')).toBeVisible()
  })

  test('/access loads and contains "Access Grants"', async ({ page }) => {
    await navigateAndWait(page, '/access')
    await expect(page.getByRole('main').getByText('Access Grants')).toBeVisible()
  })

  test('/emergency loads and contains "Emergency Contacts"', async ({
    page,
  }) => {
    await navigateAndWait(page, '/emergency')
    await expect(page.getByRole('main').getByText('Emergency Contacts')).toBeVisible()
  })

  test('/settings loads and contains "Settings"', async ({ page }) => {
    await navigateAndWait(page, '/settings')
    await expect(page.getByRole('main').getByText('Settings')).toBeVisible()
  })

  test('sidebar navigation works between portal routes', async ({ page }) => {
    await navigateAndWait(page, '/reports')
    await expect(page.getByRole('main').getByText('Reports')).toBeVisible()

    const sidebar = page.getByRole('navigation', { name: /main navigation/i })
    await sidebar.getByRole('link', { name: /access/i }).click()
    await page.waitForURL(/\/access/)
    await expect(page.getByRole('main').getByText('Access Grants')).toBeVisible()

    await sidebar.getByRole('link', { name: /settings/i }).click()
    await page.waitForURL(/\/settings/)
    await expect(page.getByRole('main').getByText('Settings')).toBeVisible()
  })
})
