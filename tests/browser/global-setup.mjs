/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Logs the test account in once and keeps the session for every test.
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import { lowerAppHas } from '../../scripts/lower-app-has.mjs'

export const STATE_FILE = 'tests/browser/.auth/state.json'

/**
 * `npm run watch` skips scripts/lower-app-has.mjs, so its CSS differs from the release. Screenshots must
 * test what ships, so refuse to run until a full build has rewritten every stylesheet.
 */
export function assertReleaseCss(cssDir = 'css') {
	const stale = fs.readdirSync(cssDir)
		.filter((file) => /^nexeno-theme.*\.css$/.test(file))
		.filter((file) => {
			const css = fs.readFileSync(`${cssDir}/${file}`, 'utf8')
			return lowerAppHas(css) !== css
		})
	if (stale.length > 0) {
		throw new Error(`Run "npm run build" first: ${stale.join(', ')} not built as released (npm run watch skips a step).`)
	}
}

export default async function globalSetup(config) {
	assertReleaseCss()
	const { baseURL } = config.projects[0].use
	const user = process.env.NEXENO_USER
	const password = process.env.NEXENO_PASSWORD
	if (!user || !password) {
		throw new Error('Set NEXENO_USER and NEXENO_PASSWORD to a test admin account (never a real one).')
	}
	const browser = await chromium.launch({ channel: 'chrome' })
	const page = await browser.newPage({ baseURL })
	await page.goto('/login')
	await page.fill('#user', user)
	await page.fill('#password', password)
	await Promise.all([page.waitForURL((url) => !url.pathname.includes('/login')), page.press('#password', 'Enter')])
	await page.context().storageState({ path: STATE_FILE })
	await browser.close()
}
