/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * js/nexeno-files.js re-tags the Files rows after each page change. Its own tagging must not count as a
 * new change, otherwise it runs again on every animation frame.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

const TRASH_ROW = '<table class="files-list"><tbody><tr class="files-list__row" data-cy-files-list-row-name="a.txt.d1700000000">'
	+ '<td class="files-list__row-icon"></td><td><button data-cy-files-list-row-action="restore">Restore</button></td></tr></tbody></table>'

test('trash bin: one page change tags the rows once, not on every frame', async () => {
	let passes = 0
	const { w, doc } = openPage({
		html: TRASH_ROW,
		scripts: ['nexeno-files.js'],
		url: 'https://cloud.test/index.php/apps/files/trashbin',
		setup(win) {
			const querySelectorAll = win.document.querySelectorAll.bind(win.document)
			win.document.querySelectorAll = (selector) => {
				if (selector === 'tr.files-list__row') {
					passes++
				}
				return querySelectorAll(selector)
			}
		},
	})
	try {
		await settle(60)
		assert.ok(doc.querySelector('[data-cy-files-list-row-action="restore"]').classList.contains('is-shared'))

		passes = 0
		doc.body.appendChild(doc.createElement('div'))
		await settle(300)
		// One pass for the change, at most one more for the script's own first tagging.
		assert.ok(passes <= 2, `ran ${passes} times after one change`)
	} finally {
		// Stops the page's frames, so a loop cannot keep the test run alive.
		w.close()
	}
})

test('a shared file is marked in the user\'s language', async () => {
	const html = '<table class="files-list"><tbody><tr class="files-list__row" data-cy-files-list-row-name="a.pdf">'
		+ '<td class="files-list__row-icon"></td><td><button data-cy-files-list-row-action="sharing-status">Geteilt</button></td></tr></tbody></table>'
	const { w, doc } = openPage({
		html,
		scripts: ['nexeno-files.js'],
		url: 'https://cloud.test/index.php/apps/files/',
		translations: { files_sharing: { Shared: 'Geteilt' } },
	})
	try {
		await settle(60)
		assert.ok(doc.querySelector('[data-cy-files-list-row-action="sharing-status"]').classList.contains('is-shared'))
	} finally {
		w.close()
	}
})
