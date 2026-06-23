import { test, expect } from '@playwright/test'
import { loginUser, fillInput } from './helpers'

test.describe('Suppliers', () => {
  test('Add supplier with all fields', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    await page.getByRole('button', { name: 'Add Supplier' }).click()
    await fillInput(page, 'input[name="name"]', 'ABC Auto Parts')
    await fillInput(page, 'input[name="phone"]', '9876543210')
    await fillInput(page, 'textarea[name="address"]', '123 Main St, City')
    await fillInput(page, 'input[name="email"]', 'supplier@example.com')
    await fillInput(page, 'input[name="opening_balance"]', '50000')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=ABC Auto Parts')).toBeVisible()
  })

  test('Add supplier with minimum fields', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    await page.getByRole('button', { name: 'Add Supplier' }).click()
    await fillInput(page, 'input[name="name"]', 'Min Supplier')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=Min Supplier')).toBeVisible()
  })

  test('Edit supplier updates information', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    await page.getByRole('button', { name: 'Add Supplier' }).click()
    await fillInput(page, 'input[name="name"]', 'Old Name')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await fillInput(page, 'input[name="name"]', 'New Name')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=New Name')).toBeVisible()
    await expect(page.locator('text=Old Name')).not.toBeVisible()
  })

  test('Delete supplier with confirmation', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    await page.getByRole('button', { name: 'Add Supplier' }).click()
    await fillInput(page, 'input[name="name"]', 'To Delete')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    page.on('dialog', async (dialog) => { await dialog.accept() })
    await page.getByRole('button', { name: 'Delete' }).first().click()
    await page.waitForTimeout(500)
    await expect(page.locator('text=To Delete')).not.toBeVisible()
  })

  test('Search supplier by name', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Add Supplier' }).click()
      await fillInput(page, 'input[name="name"]', `Supplier ${i}`)
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(300)
    }
    await fillInput(page, 'input[placeholder*="Search"]', 'Supplier 1')
    await page.waitForTimeout(300)
    await expect(page.locator('text=Supplier 1')).toBeVisible()
    await expect(page.locator('text=Supplier 0')).not.toBeVisible()
  })

  test('Supplier detail view shows balance and transactions', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    await page.getByRole('button', { name: 'Add Supplier' }).click()
    await fillInput(page, 'input[name="name"]', 'Detail Test')
    await fillInput(page, 'input[name="opening_balance"]', '10000')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    await page.locator('text=Detail Test').click()
    await expect(page.locator('text=Detail Test')).toBeVisible()
    await expect(page.getByText(/10[,.]000/).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Transactions/i })).toBeVisible()
  })

  test('Record transaction for supplier', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    await page.getByRole('button', { name: 'Add Supplier' }).click()
    await fillInput(page, 'input[name="name"]', 'Trans Supplier')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    await page.locator('text=Trans Supplier').click()
    await page.getByRole('button', { name: 'Transaction' }).click()
    await fillInput(page, 'input[name="invoice_no"]', 'INV001')
    await fillInput(page, 'input[name="total"]', '5000')
    await page.getByRole('button', { name: 'Save Transaction' }).click()
    await page.waitForTimeout(500)
  })

  test('Duplicate supplier names allowed', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/suppliers')
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: 'Add Supplier' }).click()
      await page.waitForTimeout(300)
      await fillInput(page, 'input[name="name"]', 'Same Name')
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(500)
    }
    const count = await page.locator('text=Same Name').count()
    expect(count).toBe(2)
  })
})
