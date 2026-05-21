import { test, expect } from '@playwright/test'

test.describe('Profile editing', () => {
  test('can add a skill and see it in the skills list', async ({ page }) => {
    await page.goto('/profile')

    // Click + Add skill (inside the SkillsSection)
    await page.getByRole('button', { name: /\+ add skill/i }).click()

    // Fill in skill name
    const skillName = `E2E-Skill-${Date.now()}`
    await page.getByPlaceholder('Skill name').fill(skillName)

    // Click the Save button scoped to the form that contains the skill name input
    const skillForm = page.locator('form').filter({ has: page.getByPlaceholder('Skill name') })
    await skillForm.getByRole('button', { name: 'Save' }).click()

    // Assert the new skill appears in the list
    await expect(page.getByText(skillName)).toBeVisible()
  })
})
