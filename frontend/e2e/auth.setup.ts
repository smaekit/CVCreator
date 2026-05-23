import { test as setup, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(__dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page, request }) => {
  const email = process.env.E2E_EMAIL ?? 'test@cvcreator.local'
  const password = process.env.E2E_PASSWORD ?? 'Test1234!'

  // Ensure the seed account exists
  await request.post('/api/auth/register', {
    data: { email, password },
  })
  // Register returns 400 if already exists — that's fine; we ignore it

  // Log in via the browser so localStorage is populated
  await page.goto('/login')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait until we reach the CV list (logged in)
  await expect(page).toHaveURL('/cvs')

  // Save state including localStorage (contains the JWT)
  await page.context().storageState({ path: authFile })
})
