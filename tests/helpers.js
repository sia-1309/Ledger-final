export async function fillInput(page, selector, value) {
  const loc = page.locator(selector);
  try {
    const tag = await loc.evaluate(el => el.tagName.toLowerCase(), { timeout: 2000 }).catch(() => 'input');
    if (tag === 'select') {
      await loc.selectOption(String(value));
      return;
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await loc.waitFor({ state: 'visible', timeout: 3000 });
        await loc.click({ clickCount: 3, timeout: 2000 });
        await page.waitForTimeout(50);
        await loc.pressSequentially(String(value), { delay: 3 });
        await page.waitForTimeout(100);
        const current = await loc.inputValue().catch(() => '');
        if (String(current) === String(value)) return;
      } catch {
        try { await page.waitForTimeout(300); } catch { return; }
      }
    }
  } catch {
    return;
  }
}

export async function selectOption(page, selector, value) {
  await page.evaluate(({ sel, val }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }, { sel: selector, val: value });
}

export async function loginUser(page, email) {
  const userEmail = email || `user-${Date.now()}@test.com`
  for (let retry = 0; retry < 3; retry++) {
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', userEmail)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    try {
      await page.waitForURL('**/dashboard', { timeout: 20000 })
      return userEmail
    } catch {
      if (retry === 2) { throw new Error('loginUser failed after 3 retries') }
    }
  }
  return userEmail
}

export async function signUpUser(page, email) {
  for (let retry = 0; retry < 3; retry++) {
    await page.goto('http://localhost:5173')
    await page.getByText('Sign Up').click()
    await fillInput(page, 'input[type="email"]', email)
    await fillInput(page, 'input[placeholder="Min 6 characters"]', 'TestPassword123!')
    await fillInput(page, 'input[placeholder="Repeat password"]', 'TestPassword123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    try {
      await page.waitForURL('**/dashboard', { timeout: 20000 })
      return
    } catch {
      if (retry === 2) { throw new Error('signUpUser failed after 3 retries') }
    }
  }
}

export async function signUpAndAddSupplier(page, email, supplierName) {
  await signUpUser(page, email)
  await page.goto('http://localhost:5173/suppliers')
  await page.getByRole('button', { name: 'Add Supplier' }).click()
  await fillInput(page, 'input[name="name"]', supplierName)
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForTimeout(500)
}

export async function logout(page) {
  await page.getByRole('button', { name: 'Sign Out' }).click()
  await page.waitForURL('http://localhost:5173/')
}
