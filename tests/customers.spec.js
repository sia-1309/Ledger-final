import { test, expect } from '@playwright/test'
import { loginUser, fillInput } from './helpers'

test.describe('Customers', () => {
  test('Add customer with all fields', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    await page.getByRole('button', { name: 'Add Customer' }).click()
    await fillInput(page, 'input[name="name"]', 'John Buyer')
    await fillInput(page, 'input[name="phone"]', '9876543210')
    await fillInput(page, 'input[name="email"]', 'buyer@example.com')
    await fillInput(page, 'input[name="opening_balance"]', '25000')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=John Buyer')).toBeVisible()
  })

  test('Add customer with minimum fields', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    await page.getByRole('button', { name: 'Add Customer' }).click()
    await fillInput(page, 'input[name="name"]', 'Min Customer')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=Min Customer')).toBeVisible()
  })

  test('Edit customer updates information', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    await page.getByRole('button', { name: 'Add Customer' }).click()
    await fillInput(page, 'input[name="name"]', 'Old Name')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await fillInput(page, 'input[name="name"]', 'Updated Name')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=Updated Name')).toBeVisible()
  })

  test('Delete customer with confirmation', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    await page.getByRole('button', { name: 'Add Customer' }).click()
    await fillInput(page, 'input[name="name"]', 'Delete Me')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    page.on('dialog', async (dialog) => { await dialog.accept() })
    await page.getByRole('button', { name: 'Delete' }).first().click()
    await page.waitForTimeout(500)
    await expect(page.locator('text=Delete Me')).not.toBeVisible()
  })

  test('Search customer by name', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Add Customer' }).click()
      await fillInput(page, 'input[name="name"]', `Customer ${i}`)
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(300)
    }
    await fillInput(page, 'input[placeholder*="Search"]', 'Customer 1')
    await page.waitForTimeout(300)
    await expect(page.locator('text=Customer 1')).toBeVisible()
    await expect(page.locator('text=Customer 0')).not.toBeVisible()
  })

  test('Customer detail view', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    await page.getByRole('button', { name: 'Add Customer' }).click()
    await fillInput(page, 'input[name="name"]', 'Detail Cust')
    await fillInput(page, 'input[name="opening_balance"]', '5000')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    await page.locator('text=Detail Cust').click()
    await expect(page.locator('text=Detail Cust')).toBeVisible()
    await expect(page.locator('text=Invoices')).toBeVisible()
    await expect(page.locator('text=Receipts')).toBeVisible()
  })

  test('Record sale for customer', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    await page.getByRole('button', { name: 'Add Customer' }).click()
    await fillInput(page, 'input[name="name"]', 'Sale Cust')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)
    await page.locator('text=Sale Cust').click()
    await page.getByRole('button', { name: 'Sale' }).click()
    await fillInput(page, 'input[name="invoice_no"]', 'INV-001')
    await fillInput(page, 'input[name="total"]', '15000')
    await page.getByRole('button', { name: 'Save Sale' }).click()
    await page.waitForTimeout(500)
  })

  test('Duplicate customer names allowed', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/customers')
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: 'Add Customer' }).click()
      await page.waitForTimeout(500)
      await page.locator('input[name="name"]').fill('Dup Cust')
      await page.waitForTimeout(200)
      const v = await page.locator('input[name="name"]').inputValue()
      expect(v).toBe('Dup Cust')
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(500)
    }
    const count = await page.locator('text=Dup Cust').count()
    expect(count).toBe(2)
  })
})
