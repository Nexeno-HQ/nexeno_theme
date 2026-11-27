/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * js/nexeno-modal.js marks Nextcloud dialogs so the Nexeno styles can reach them, and leaves the page
 * alone while the theme is off.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

const dialog = (title, inner = '') => `<div class="modal-container"><h2 class="dialog__name">${title}</h2>${inner}</div>`

async function classesOf(html, { translations, themeOn = true, url } = {}) {
	const { doc } = openPage({ html, scripts: ['nexeno-modal.js'], translations, themeOn, url })
	await settle(60)
	return doc.querySelector('.modal-container').className
}

test('password dialog is found by its own class in any language', async () => {
	// German title from @nextcloud/password-confirmation, which the theme's copy does not match.
	const classes = await classesOf(dialog('Authentifizierung erforderlich', '<div class="_passwordDialog_joix2_2"></div>'),
		{ translations: { nexeno_theme: { 'Authentication required': 'Authentifizierung benötigt' } } })
	assert.match(classes, /\bauth-popup\b/)
})

test('password dialog is still found by the theme\'s copy of its title', async () => {
	assert.match(await classesOf(dialog('Authentication required')), /\bauth-popup\b/)
})

test('encryption dialog is found by the settings app\'s translation, also where the theme has none', async () => {
	const classes = await classesOf(dialog('Potwierdź włączenie szyfrowania'),
		{ translations: { settings: { 'Confirm enabling encryption': 'Potwierdź włączenie szyfrowania' } } })
	assert.match(classes, /\bencryption-popup\b/)
})

test('log reader dialog is found by the logreader app\'s translation', async () => {
	const classes = await classesOf(dialog('Ustawienia dziennika logów'),
		{ translations: { logreader: { 'Log reader settings': 'Ustawienia dziennika logów' } } })
	assert.match(classes, /\blog-reader-popup\b/)
})

test('a dialog with another title gets none of these classes', async () => {
	const classes = await classesOf(dialog('Rename file'))
	assert.doesNotMatch(classes, /auth-popup|encryption-popup|log-reader-popup/)
})

test('with the theme off, dialogs are left exactly as Nextcloud made them', async () => {
	const classes = await classesOf(dialog('Authentication required', '<div class="_passwordDialog_joix2_2"></div>'), { themeOn: false })
	assert.strictEqual(classes, 'modal-container')
})
