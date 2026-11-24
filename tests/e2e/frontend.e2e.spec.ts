import { getPayload } from 'payload'
import { test, expect, Page } from '@playwright/test'

import config from '../../src/payload.config.js'

const homePage = {
  title: 'Home',
  slug: 'home',
  path: '/',
  markdownRaw: '# Welcome\n\nHello world.',
  sourcePath: 'home_webtext_locked.md',
  _status: 'published' as const,
}

async function seedHomePage(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'pages',
    where: { sourcePath: { equals: homePage.sourcePath } },
  })

  await payload.create({
    collection: 'pages',
    data: homePage,
  })
}

async function cleanupHomePage(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'pages',
    where: { sourcePath: { equals: homePage.sourcePath } },
  })
}

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedHomePage()

    const context = await browser.newContext()
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await cleanupHomePage()
  })

  test('renders a published page on its route', async () => {
    await page.goto('http://localhost:3000')

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Welcome')
  })

  test('returns 404 for an unknown route', async () => {
    const response = await page.goto(
      'http://localhost:3000/does-not-exist',
    )

    expect(response?.status()).toBe(404)
  })
})
