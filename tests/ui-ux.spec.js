import { test, expect } from '@playwright/test'
import { loginUser, fillInput } from './helpers'

test.describe('UI/UX', () => {
  test('No console errors on auth page', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })

  test('No console errors on dashboard', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    await loginUser(page)
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })

  test('Responsive layout mobile no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await loginUser(page)
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientW = await page.evaluate(() => window.innerWidth)
    expect(scrollW).toBeLessThanOrEqual(clientW + 10)
  })

  test('Responsive layout tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await loginUser(page)
    await page.goto('http://localhost:5173/dashboard')
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientW = await page.evaluate(() => window.innerWidth)
    expect(scrollW).toBeLessThanOrEqual(clientW + 10)
  })

  test('Responsive layout desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await loginUser(page)
    await page.goto('http://localhost:5173/dashboard')
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientW = await page.evaluate(() => window.innerWidth)
    expect(scrollW).toBeLessThanOrEqual(clientW + 10)
  })

  test('Browser back button works', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/dashboard')
    await page.goto('http://localhost:5173/suppliers')
    await page.goBack()
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {})
    expect(page.url()).toContain('dashboard')
  })

  test('Sidebar navigation links exist', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/dashboard')
    const links = ['Dashboard', 'Suppliers', 'Customers', 'Expenses', 'Inventory', 'Reports', 'Settings']
    for (const link of links) {
      await expect(page.getByText(link)).toBeVisible()
    }
  })

  test('Page title is Accounts Ledger', async ({ page }) => {
    await page.goto('http://localhost:5173')
    const title = await page.title()
    expect(title).toBe('Accounts Ledger')
  })
})
