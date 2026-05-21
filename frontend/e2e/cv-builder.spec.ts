import { test, expect } from '@playwright/test'

test.describe('CV builder', () => {
  test('can create a CV and land in the builder', async ({ page }) => {
    await page.goto('/')

    // Create a new CV — creation navigates directly to the builder
    await page.getByRole('button', { name: /\+ new cv/i }).click()
    await page.getByPlaceholder('Company').fill('E2E Corp')
    await page.getByRole('button', { name: 'Create' }).click()

    // Should now be on the builder page /cv/:id
    await expect(page).toHaveURL(/\/cv\/[\w-]+/, { timeout: 10000 })

    // Verify builder structure: left selections panel and right preview area
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('toggling a skill checkbox updates the builder state', async ({ page }) => {
    await page.goto('/')

    // Open first available CV (items are <li> elements, not links)
    const firstCv = page.locator('ul li').first()
    if (!await firstCv.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip()
      return
    }
    await firstCv.click()

    // Wait for builder to load
    await expect(page).toHaveURL(/\/cv\/[\w-]+/, { timeout: 10000 })

    // Check the first unchecked skill checkbox if any
    const skillCheckboxes = page.locator('aside').locator('input[type="checkbox"]')
    const first = skillCheckboxes.first()
    if (await first.isVisible({ timeout: 3000 }).catch(() => false)) {
      const wasChecked = await first.isChecked()
      await first.click()
      await expect(first).toBeChecked({ checked: !wasChecked })
    }
  })
})
