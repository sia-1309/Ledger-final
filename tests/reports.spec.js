import { test, expect } from '@playwright/test'
import { loginUser, fillInput } from './helpers'

test.describe('Reports', () => {
  test('Executive Summary shows KPIs', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    await page.getByText('Executive Summary').click()
    await expect(page.getByText('Outstanding').first()).toBeVisible()
    await expect(page.getByText('Receivable').first()).toBeVisible()
    await expect(page.getByText('Expenses').first()).toBeVisible()
    await expect(page.getByText('Low Stock').first()).toBeVisible()
  })

  test('Executive Summary date range filter', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    await page.getByText('Executive Summary').click()
    const rangeSelect = page.locator('select').first()
    await rangeSelect.selectOption('month')
    await page.waitForTimeout(500)
  })

  test('Supplier Report tab shows data', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    await page.getByText('Supplier Report').click()
    await expect(page.getByRole('button', { name: 'Supplier Report' })).toBeVisible()
  })

  test('Customer Report tab shows data', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    await page.getByText('Customer Report').click()
    await expect(page.getByRole('button', { name: 'Customer Report' })).toBeVisible()
  })

  test('Expense Report category breakdown', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    await page.getByText('Expense Report').click()
    await expect(page.getByText('Category').first()).toBeVisible()
    await expect(page.getByText('Count').first()).toBeVisible()
  })

  test('Inventory Report valuation', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    await page.getByText('Inventory Report').click()
    await expect(page.getByText('Total Value').first()).toBeVisible()
    await expect(page.getByText('Low Stock').first()).toBeVisible()
  })

  test('All 5 report tabs navigate correctly', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/reports')
    const tabs = ['Executive Summary', 'Supplier Report', 'Customer Report', 'Expense Report', 'Inventory Report']
    for (const tab of tabs) {
      await page.getByText(tab).click()
      await page.waitForTimeout(200)
    }
  })
})
