/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * The helper scripts only prepare pages for the Nexeno styles. With the theme off they must leave
 * every page exactly as Nextcloud made it; with it on they do their work.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

const CASES = [
	{
		script: 'nexeno-usernotification.js',
		html: '<div id="s"><table class="activitysettings"><tr><td>x</td></tr></table></div>',
		applied: (doc) => !!doc.querySelector('.activitysettings-table-wrapper'),
	},
	{
		script: 'nexeno-app-bundles.js',
		html: '<div class="appstoreApp__content"><section></section><table></table></div>',
		applied: (doc) => !!doc.querySelector('.table-wrapper') && !!doc.querySelector('.table-wrapper-section'),
	},
	{
		script: 'nexeno-workflow.js',
		html: '<main class="workflow"></main>',
		url: 'https://cloud.test/index.php/settings/admin/workflow',
		applied: (doc) => doc.querySelector('main').classList.contains('admin-workflow'),
	},
	{
		script: 'nexeno-navigation.js',
		html: '<main class="app-content"><table id="app-tokens-table"></table></main>',
		url: 'https://cloud.test/index.php/settings/user/security',
		applied: (doc) => !!doc.querySelector('.app-tokens-table-wrapper') && doc.querySelector('main').classList.contains('security'),
	},
	{
		script: 'nexeno-files.js',
		html: '<table class="files-list"><tbody><tr class="files-list__row" data-cy-files-list-row-name="a.pdf"><td class="files-list__row-icon"></td></tr></tbody></table>',
		url: 'https://cloud.test/index.php/apps/files/',
		applied: (doc) => doc.querySelector('tr').getAttribute('data-nexeno-type') === 'pdf',
	},
]

for (const c of CASES) {
	test(`${c.script}: works with the theme on, changes nothing with it off`, async () => {
		const on = openPage({ html: c.html, scripts: [c.script], url: c.url })
		await settle(60)
		assert.ok(c.applied(on.doc), 'applied with the theme on')

		const off = openPage({ html: c.html, scripts: [c.script], url: c.url, themeOn: false })
		// The same page with no script at all: the parser tidies HTML (adds <tbody>), so compare with that.
		const untouched = openPage({ html: c.html, scripts: [], url: c.url, themeOn: false })
		await settle(60)
		assert.strictEqual(off.doc.body.innerHTML, untouched.doc.body.innerHTML, 'page untouched with the theme off')
	})
}
