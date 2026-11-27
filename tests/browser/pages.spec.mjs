/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Screenshot of each page, in Nexeno Light and Nexeno Dark, on a desktop and a phone screen.
 * See playwright.config.mjs for how to run it.
 */
import { expect, test } from '@playwright/test'
import { STATE_FILE } from './global-setup.mjs'

// Pages of the apps enabled on the test instance; a page whose app is missing is skipped.
const PAGES = [
	['dashboard', '/apps/dashboard/'],
	['files', '/apps/files/'],
	['files-recent', '/apps/files/recent'],
	['photos', '/apps/photos/'],
	['activity', '/apps/activity/'],
	['deck', '/apps/deck/'],
	['talk', '/apps/spreed/'],
	['calendar', '/apps/calendar/dayGridMonth/2026-01-01'],
	['contacts', '/apps/contacts/'],
	['tasks', '/apps/tasks/'],
	['cospend', '/apps/cospend/'],
	['theme-page', '/apps/nexeno_theme/'],
	['profile', '/u/nexeno-vrt'],
	['settings-personal-info', '/settings/user'],
	['settings-appearance', '/settings/user/theming'],
	['settings-security', '/settings/user/security'],
	['settings-notifications', '/settings/user/notifications'],
	['settings-sharing', '/settings/user/sharing'],
	['admin-overview', '/settings/admin/overview'],
	['admin-basic', '/settings/admin'],
	['admin-sharing', '/settings/admin/sharing'],
	['admin-security', '/settings/admin/security'],
	['admin-theming', '/settings/admin/theming'],
	['admin-server-info', '/settings/admin/serverinfo'],
	['apps-installed', '/settings/apps/installed'],
	['users', '/settings/users'],
]

const SCREENS = [
	['desktop', { width: 1440, height: 900 }],
	['phone', { width: 390, height: 844 }],
]

test.use({ storageState: STATE_FILE })

async function setVariant(page, variant) {
	await page.goto('/settings/user/theming')
	const status = await page.evaluate(async (v) => {
		const response = await fetch(window.OC.generateUrl('/apps/nexeno_theme/variant'), {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', requesttoken: window.OC.requestToken },
			body: JSON.stringify({ variant: v }),
		})
		return response.status
	}, variant)
	expect(status).toBe(200)
}

// Waits until the page has stopped loading and changing, so two runs give the same picture.
async function settle(page) {
	// Some admin pages poll the server and never go fully quiet; after 15 s carry on anyway.
	await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
	await page.evaluate(() => document.fonts.ready)
	await page.waitForTimeout(1500)
}

for (const variant of ['light', 'dark']) {
	test.describe(variant, () => {
		test.beforeAll(async ({ browser }) => {
			const context = await browser.newContext({ storageState: STATE_FILE })
			await setVariant(await context.newPage(), variant)
			await context.close()
		})

		for (const [screenName, viewport] of SCREENS) {
			for (const [name, path] of PAGES) {
				test(`${name} ${screenName}`, async ({ page }) => {
					await page.setViewportSize(viewport)
					const response = await page.goto(path)
					test.skip(response === null || response.status() === 404, `${path} is not available`)
					await settle(page)
					await expect(page).toHaveScreenshot(`${variant}/${screenName}/${name}.png`, {
						fullPage: true,
						// Clocks, relative times and avatars made from initials change between runs.
						mask: [page.locator('time, .live-relative-timestamp, .dashboard__greeting, .nc-datetime')],
					})
				})
			}
		}
	})
}
