/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Visual regression tests (tests/browser): screenshots of real Nextcloud pages with the theme, compared
 * pixel by pixel with the ones taken before a change. Run against a TEST instance only:
 *
 *   NEXENO_URL=http://localhost:8080 NEXENO_USER=<test admin> NEXENO_PASSWORD=<password> \
 *     npx playwright test --update-snapshots   # before the change: take the reference screenshots
 *   ... make the change and rebuild ...
 *   npx playwright test                          # after: any changed pixel fails, with a diff image
 */
import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: 'tests/browser',
	globalSetup: './tests/browser/global-setup.mjs',
	// Reference screenshots depend on the instance's data and the local Chrome, so they stay out of git.
	snapshotPathTemplate: 'tests/browser/.screenshots/{arg}{ext}',
	outputDir: 'tests/browser/.results',
	// The variant is a per-user setting on the server, so tests must not run side by side.
	workers: 1,
	timeout: 60_000,
	reporter: [['list'], ['html', { outputFolder: 'tests/browser/.report', open: 'never' }]],
	expect: {
		toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled', caret: 'hide' },
	},
	use: {
		baseURL: process.env.NEXENO_URL || 'http://localhost:8080',
		// The installed Google Chrome, so no browser download is needed.
		channel: 'chrome',
		locale: 'en-US',
		timezoneId: 'UTC',
	},
})
