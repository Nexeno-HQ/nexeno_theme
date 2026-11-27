/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * js/nexeno-albums.js marks the Photos "Tagged photos" list so the theme can lay it out. The page title is
 * translated, so the list must be found the same way in every language.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

// What Photos renders on its tag list in German: the title attribute is translated.
const TAG_LIST = '<main id="app-content-vue"><div roottitle="Fotos mit Tags"></div></main>'

async function hasTagView(url) {
	const { w, doc } = openPage({ html: TAG_LIST, scripts: ['nexeno-albums.js'], url })
	try {
		await settle(60)
		return doc.querySelector('main').classList.contains('tag-view')
	} finally {
		w.close()
	}
}

test('the tag list is marked in any language, with or without index.php', async () => {
	assert.ok(await hasTagView('https://cloud.test/apps/photos/tags/'))
	assert.ok(await hasTagView('https://cloud.test/index.php/apps/photos/tags'))
	assert.ok(await hasTagView('https://cloud.test/nextcloud/index.php/apps/photos/tags/'))
})

test('a single tag and other Photos pages are not marked as the tag list', async () => {
	assert.ok(!(await hasTagView('https://cloud.test/apps/photos/tags/holiday')))
	assert.ok(!(await hasTagView('https://cloud.test/apps/photos/')))
})
