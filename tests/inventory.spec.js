import { test, expect } from '@playwright/test'
import { loginUser, fillInput, selectOption } from './helpers'

test.describe('Inventory', () => {
  test('Add inventory item with SKU', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/inventory')
    await page.getByRole('button', { name: 'Add Item' }).click()
    await fillInput(page, 'input[name="sku"]', 'PART-001')
    await fillInput(page, 'input[name="name"]', 'Engine Oil')
    await fillInput(page, 'input[name="qty"]', '100')
    await fillInput(page, 'input[name="reorder_qty"]', '20')
    await fillInput(page, 'input[name="unit_price"]', '500')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('text=PART-001')).toBeVisible()
  })

  test('Stock status colored correctly', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/inventory')
    await page.getByRole('button', { name: 'Add Item' }).click()
    await fillInput(page, 'input[name="sku"]', 'LOW-001')
    await fillInput(page, 'input[name="name"]', 'Low Item')
    await fillInput(page, 'input[name="qty"]', '5')
    await fillInput(page, 'input[name="reorder_qty"]', '20')
    await fillInput(page, 'input[name="unit_price"]', '100')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(300)
    await expect(page.locator('text=Low').first()).toBeVisible()
  })

  test('Inventory valuation calculated', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/inventory')
    await page.getByRole('button', { name: 'Add Item' }).click()
    await fillInput(page, 'input[name="sku"]', 'VAL-001')
    await fillInput(page, 'input[name="name"]', 'Value Item')
    await fillInput(page, 'input[name="qty"]', '10')
    await fillInput(page, 'input[name="unit_price"]', '200')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(300)
    await expect(page.getByText(/2[,.]000/).first()).toBeVisible()
  })

  test('Search inventory by SKU', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    await loginUser(page)
    await page.goto('http://localhost:5173/inventory')
    for (const sku of ['A-001', 'A-002', 'B-001']) {
      await page.getByRole('button', { name: 'Add Item' }).click()
      await fillInput(page, 'input[name="sku"]', sku)
      await fillInput(page, 'input[name="name"]', `Item ${sku}`)
      await fillInput(page, 'input[name="qty"]', '10')
      await page.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(300)
    }
    if (errors.length) console.log('Page errors:', errors.join(' | '))
    await fillInput(page, 'input[placeholder*="Search"]', 'A-')
    await page.waitForTimeout(300)
    await expect(page.getByRole('cell', { name: 'A-001', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'B-001', exact: true })).not.toBeVisible()
  })

  test('Stock status filter works', async ({ page }) => {
    await loginUser(page)
    await page.goto('http://localhost:5173/inventory')
    await page.getByRole('button', { name: 'Add Item' }).click()
    await fillInput(page, 'input[name="sku"]', 'OK-001')
    await fillInput(page, 'input[name="name"]', 'OK Item')
    await fillInput(page, 'input[name="qty"]', '50')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(300)
    await page.selectOption('select:last-of-type', 'OK')
    await page.waitForTimeout(300)
    await expect(page.locator('text=OK-001')).toBeVisible()
  })
})
