/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * js/nexeno-favorites.js re-checks the Dashboard widget lists after page changes. Typing elsewhere (Talk,
 * Text) must not wake it, but a file name changed in place in a widget must.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

const PAGE = '<ul><li class="item-list__entry"><h3>notes.txt</h3></li></ul><div id="editor"><p>hello</p></div>'

test('typing outside the widget lists does not re-run the checks', async () => {
	let passes = 0
	const { w, doc } = openPage({
		html: PAGE,
		scripts: ['nexeno-favorites.js'],
		url: 'https://cloud.test/index.php/apps/dashboard/',
		setup(win) {
			const querySelectorAll = win.document.querySelectorAll.bind(win.document)
			win.document.querySelectorAll = (selector) => {
				if (selector === '.item-list__entry') {
					passes++
				}
				return querySelectorAll(selector)
			}
		},
	})
	try {
		await settle(60)
		passes = 0
		const text = doc.querySelector('#editor p').firstChild
		for (const letter of 'world') {
			text.data += letter
			await settle(20)
		}
		assert.strictEqual(passes, 0, `ran ${passes} times while typing`)
	} finally {
		w.close()
	}
})

test('a file renamed in place in a widget list gets its new class', async () => {
	const { w, doc } = openPage({ html: PAGE, scripts: ['nexeno-favorites.js'], url: 'https://cloud.test/index.php/apps/dashboard/' })
	try {
		await settle(60)
		const entry = doc.querySelector('.item-list__entry')
		assert.ok(entry.classList.contains('file-list'), 'a .txt without preview is shown as a file')
		entry.querySelector('h3').firstChild.data = 'photo.jpg'
		await settle(60)
		assert.ok(!entry.classList.contains('file-list'), 'renamed to an image: shown as a preview')
	} finally {
		w.close()
	}
})
