import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('shows auth screen', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.locator('text=Accounts Ledger')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('toggles between sign in and sign up', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
    await page.getByText('Sign In').click()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('redirects to auth when not logged in', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('shows auth options on landing page', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByText('Sign Up')).toBeVisible()
  })
})
