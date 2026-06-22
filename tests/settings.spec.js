import { test, expect } from '@playwright/test'
import { loginUser, fillInput, selectOption } from './helpers'

test.describe('Settings', () => {
  test('Update shop name persists', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await page.waitForTimeout(500)
    await fillInput(page, 'input[placeholder*="Shop"]', 'My Auto Parts')
    await page.waitForTimeout(200)
    const val = await page.inputValue('input[placeholder*="Shop"]')
    expect(val).toBe('My Auto Parts')
    await page.getByRole('button', { name: 'Save Settings' }).click()
    await expect(page.locator('text=Saved!')).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(500)
    await page.reload()
    await page.waitForTimeout(500)
    const name = await page.locator('input[placeholder*="Shop"]').inputValue()
    expect(name).toBe('My Auto Parts')
  })

  test('Change currency', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await page.selectOption('select[name="currency"]', '$')
    await page.getByRole('button', { name: 'Save Settings' }).click()
    await page.waitForTimeout(500)
    await page.goto('http://localhost:5173/dashboard')
  })

  test('Change date format', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await page.selectOption('select[name="date_format"]', 'DD-MM-YYYY')
    await page.getByRole('button', { name: 'Save Settings' }).click()
    await page.waitForTimeout(500)
  })

  test('Theme toggle dark mode', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await page.selectOption('select[name="theme"]', 'dark')
    await page.getByRole('button', { name: 'Save Settings' }).click()
    await page.waitForTimeout(500)
    const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    expect(isDark).toBe(true)
  })

  test('Theme toggle light mode', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await page.selectOption('select[name="theme"]', 'light')
    await page.getByRole('button', { name: 'Save Settings' }).click()
    await page.waitForTimeout(500)
    const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    expect(isDark).toBe(false)
  })

  test('Backup download button exists', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await expect(page.getByRole('button', { name: /Backup/i })).toBeVisible()
  })

  test('Danger zone visible', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await expect(page.locator('text=Danger Zone')).toBeVisible()
    await expect(page.locator('text=Reset All Data')).toBeVisible()
  })

  test('About section visible', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/settings')
    await expect(page.locator('text=Accounts Ledger v1.0.0')).toBeVisible()
  })
})
