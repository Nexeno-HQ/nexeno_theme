/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Files, the file picker and the Dashboard share one file-type rule (js/nexeno-filetypes.js), so the
 * same file gets the same icon class everywhere.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

test('the rule: images, videos, own extension, trash bin names and no extension', () => {
	const { w } = openPage({ html: '', scripts: [] })
	assert.strictEqual(w.nexenoFileType('Plan.PSD'), 'image')
	assert.strictEqual(w.nexenoFileType('clip.mov'), 'video')
	assert.strictEqual(w.nexenoFileType('notes.md'), 'md')
	assert.strictEqual(w.nexenoFileType('photo.jpg.d1712345678'), 'image')
	assert.strictEqual(w.nexenoFileType('README'), 'file')
	assert.strictEqual(w.nexenoFileType('.hidden'), 'file')
	assert.strictEqual(w.nexenoFileType('odd.<x>'), 'file')
})

test('a .psd gets the same class in Files, the file picker and the Dashboard', async () => {
	const files = openPage({
		html: '<table class="files-list"><tbody><tr class="files-list__row" data-cy-files-list-row-name="plan.psd"><td class="files-list__row-icon"></td></tr></tbody></table>',
		scripts: ['nexeno-files.js'],
		url: 'https://cloud.test/index.php/apps/files/',
	})
	const picker = openPage({
		html: '<div class="modal-container"><table><tr class="file-picker__row" data-filename="plan.psd"></tr></table></div>',
		scripts: ['nexeno-modal.js'],
	})
	const dashboard = openPage({
		html: '<img class="activity-entry__preview-image" src="/core/img/filetypes/image.svg" alt="Open plan.psd">',
		scripts: ['nexeno-favorites.js'],
		url: 'https://cloud.test/index.php/apps/dashboard/',
	})
	try {
		await settle(60)
		assert.strictEqual(files.doc.querySelector('tr').getAttribute('data-nexeno-type'), 'image')
		assert.strictEqual(picker.doc.querySelector('tr').getAttribute('data-nexeno-type'), 'image')
		assert.ok(dashboard.doc.querySelector('img').classList.contains('image'))
	} finally {
		files.w.close()
		picker.w.close()
		dashboard.w.close()
	}
})
