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

  test('redirects / to the default-locale prefix', async () => {
    const response = await page.goto('http://localhost:3000')
    expect(page.url()).toBe('http://localhost:3000/de')
    expect(response?.status()).toBe(200)
  })

  test('renders a published page on its de route', async () => {
    await page.goto('http://localhost:3000/de')

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Welcome')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  })

  test('404s for a page published only in de when read as en', async () => {
    // strict public reads (D11): seeded page has no en version
    const response = await page.goto('http://localhost:3000/en')
    expect(response?.status()).toBe(404)
  })

  test('returns 404 for an unknown route', async () => {
    const response = await page.goto(
      'http://localhost:3000/de/does-not-exist',
    )

    expect(response?.status()).toBe(404)
  })
})
