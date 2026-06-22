import { test, expect } from '@playwright/test'
import { fillInput } from './helpers'

test.describe('Authentication', () => {
  test('Sign Up creates new account and auto-logs in', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    const email = `user-${Date.now()}@test.com`
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForURL('**/dashboard')
    expect(page.url()).toContain('dashboard')
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible()
  })

  test('Sign Up with existing email shows error', async ({ page }) => {
    const email = `existing-${Date.now()}@test.com`
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForURL('**/dashboard')
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await page.waitForURL('http://localhost:5173/')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.locator('text=/already.*registered|already.*exists|rate limit/')).toBeVisible({ timeout: 10000 })
  })

  test('Sign Up with weak password shows error', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', 'test@example.com')
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'ab')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'ab')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('must be at least 6')).toBeVisible({ timeout: 10000 })
  })

  test('Sign In with valid credentials', async ({ page }) => {
    const email = `user-${Date.now()}@test.com`
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForURL('**/dashboard')
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await page.waitForURL('http://localhost:5173/')
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[type="password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/dashboard')
    expect(page.url()).toContain('dashboard')
  })

  test('Sign In with incorrect password shows error', async ({ page }) => {
    const email = `user-${Date.now()}@test.com`
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForURL('**/dashboard')
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await page.waitForURL('http://localhost:5173/')
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[type="password"]', 'WrongPassword123!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.locator('text=/Invalid login|Invalid/i')).toBeVisible({ timeout: 10000 })
  })

  test('Sign In with non-existent email shows error', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 10000 })
    await fillInput(page, 'input[type="email"]', 'nonexistent@test.com')
    await fillInput(page, 'input[type="password"]', 'AnyPassword123!')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Invalid').or(page.getByText('invalid'))).toBeVisible({ timeout: 10000 })
  })

  test('Password visibility toggle works', async ({ page }) => {
    await page.goto('http://localhost:5173')
    const pwInput = page.locator('input[type="password"]')
    await pwInput.fill('TestPassword123!')
    const showBtn = page.getByRole('button', { name: 'Show' })
    await showBtn.click()
    await page.waitForTimeout(200)
    const textInputs = page.locator('input[type="text"]')
    const visible = await textInputs.count()
    expect(visible).toBeGreaterThanOrEqual(1)
  })

  test('Session persists after page reload', async ({ page }) => {
    const email = `user-${Date.now()}@test.com`
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForURL('**/dashboard')
    await page.reload()
    expect(page.url()).toContain('dashboard')
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible()
  })

  test('Sign Out clears session', async ({ page }) => {
    const email = `user-${Date.now()}@test.com`
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await page.waitForURL('**/dashboard')
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await page.waitForURL('http://localhost:5173/')
    const url = page.url()
    expect(url.includes('dashboard')).toBeFalsy()
  })

  test('Toggle between Sign In and Sign Up modes', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await page.getByText('Sign Up').click()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
    await page.getByText('Sign In').click()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('Protected routes redirect unauthenticated users', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard')
    const onAuth = page.getByRole('button', { name: 'Sign In' })
    await expect(onAuth).toBeVisible({ timeout: 5000 })
  })
})
