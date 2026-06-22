import { test, expect } from '@playwright/test'
import { loginUser, fillInput, selectOption } from './helpers'

test.describe('Expenses', () => {
  test('Add expense with category', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/expenses')
    await page.getByRole('button', { name: 'Add Expense' }).click()
    await selectOption(page, 'select[name="category"]', 'Shipping')
    await fillInput(page, 'input[placeholder*="Description"]', 'Parcel delivery')
    await fillInput(page, 'input[type="number"]', '500')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('cell', { name: 'Shipping' })).toBeVisible()
  })

  test('Category filter works', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/expenses')
    const cats = ['Shipping', 'Labour', 'Tools']
    for (const cat of cats) {
      await page.getByRole('button', { name: 'Add Expense' }).click()
      await page.waitForTimeout(500)
      await selectOption(page, 'select[name="category"]', cat)
      await fillInput(page, 'input[type="number"]', '100')
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(500)
    }
    const selects = page.locator('select')
    const filterSelect = selects.first()
    await filterSelect.selectOption('Shipping')
    await page.waitForTimeout(300)
    await expect(page.getByRole('cell', { name: 'Shipping' })).toBeVisible()
  })

  test('Expense analytics show correct totals', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/expenses')
    const amounts = [200, 300, 500]
    for (const amt of amounts) {
      await page.getByRole('button', { name: 'Add Expense' }).click()
      await fillInput(page, 'input[type="number"]', String(amt))
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(500)
    }
    await expect(page.getByText(/1[,.]000/).first()).toBeVisible({ timeout: 5000 })
  })

  test('Delete expense', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/expenses')
    await page.getByRole('button', { name: 'Add Expense' }).click()
    await fillInput(page, 'input[type="number"]', '250')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    page.on('dialog', async (dialog) => { await dialog.accept() })
    await page.getByRole('button', { name: 'Delete' }).first().click()
    await page.waitForTimeout(500)
  })
})
