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

    await navigateAndWait(page, '/login')
    await expect(page).toHaveURL(/\/login/)

    expect(errors).toEqual([])
  })

  test('/login loads and contains sign-in UI', async ({ page }) => {
    await navigateAndWait(page, '/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('/callback loads and shows loader', async ({ page }) => {
    await navigateAndWait(page, '/callback')
    await expect(page.getByRole('status')).toBeVisible()
  })

  test('unauthenticated /reports redirects to /login', async ({ page }) => {
    await navigateAndWait(page, '/reports')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('unauthenticated /access redirects to /login', async ({ page }) => {
    await navigateAndWait(page, '/access')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated /emergency redirects to /login', async ({ page }) => {
    await navigateAndWait(page, '/emergency')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated /settings redirects to /login', async ({ page }) => {
    await navigateAndWait(page, '/settings')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirect to /login includes callbackUrl', async ({ page }) => {
    await navigateAndWait(page, '/reports')
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Freports/)
  })
})
