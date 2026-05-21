import { test, expect } from '@playwright/test'

test.describe('PDF export', () => {
  test('clicking Export PDF triggers a file download', async ({ page }) => {
    await page.goto('/')

    // Open first available CV (<li> clickable item, not a link)
    const firstCv = page.locator('ul li').first()
    if (!await firstCv.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip()
      return
    }
    await firstCv.click()

    // Wait for the builder to load (Export PDF button in the header)
    const exportBtn = page.getByRole('button', { name: /export pdf/i })
    await expect(exportBtn).toBeVisible({ timeout: 10000 })

    // Click and wait for download
    const downloadPromise = page.waitForEvent('download')
    await exportBtn.click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  })
})
