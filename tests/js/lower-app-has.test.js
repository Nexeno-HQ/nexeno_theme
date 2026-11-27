/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * scripts/lower-app-has.mjs: each rewritten selector must match exactly the elements the :has() one did,
 * inside #content, in dialogs and popovers Nextcloud adds after it, and in the header.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { JSDOM } = require('jsdom')

const load = () => import('../../scripts/lower-app-has.mjs')

// A Nextcloud page: header, #content with the app's class, then a dialog and a popover added to <body>.
function page(appId, withAppAttribute) {
	const dom = new JSDOM('<!doctype html><html data-nexeno data-nexeno-dark' + (withAppAttribute ? ` data-nexeno-app="${appId}"` : '') + '><body>'
		+ '<header id="header"><button class="button-vue">menu</button></header>'
		+ `<div id="content" class="app-${appId}"><div id="content-vue" class="app-${appId}"><aside class="app-sidebar"><button class="button-vue">a</button></aside></div></div>`
		+ '<div class="modal-mask"><div class="modal-container general-popup"><button class="button-vue">b</button></div></div>'
		+ '<div class="v-popper__popper"><div class="v-popper__inner">c</div></div>'
		+ '</body></html>')
	return dom.window.document
}

const SELECTORS = [
	':root[data-nexeno]:has(.app-deck) .button-vue',
	':root[data-nexeno]:has(.app-deck) aside.app-sidebar:not(.modal__card *)',
	':root[data-nexeno]:has(.app-deck) .modal-container.general-popup .button-vue',
	':root[data-nexeno]:has(.app-deck) .v-popper__inner',
	':root[data-nexeno]:has(.app-deck) #header .button-vue',
	':root[data-nexeno] body:has(.app-deck) .button-vue',
	':root[data-nexeno] body:has(.app-deck) .modal-mask',
	':root[data-nexeno][data-nexeno-dark]:has(.app-deck) .button-vue',
	':root[data-nexeno]:has(.app-spreed) .button-vue',
]

test('rewritten selectors match the same elements on every app page', async () => {
	const { lowerAppHas } = await load()
	for (const selector of SELECTORS) {
		const lowered = lowerAppHas(selector)
		assert.ok(!lowered.includes(':has(.app-'), `${selector} → ${lowered}`)
		for (const appId of ['deck', 'spreed', 'files']) {
			const before = page(appId, false).querySelectorAll(selector)
			const after = page(appId, true).querySelectorAll(lowered)
			assert.strictEqual(after.length, before.length, `${selector} on ${appId}: ${lowered}`)
		}
	}
})

test('one class becomes one attribute, so specificity stays the same', async () => {
	const { lowerAppHas } = await load()
	assert.strictEqual(lowerAppHas(':root[data-nexeno]:has(.app-deck) .x{a:b}'), ':root[data-nexeno][data-nexeno-app=deck] .x{a:b}')
	assert.strictEqual(lowerAppHas(':root[data-nexeno] body:has(.app-deck) .x{a:b}'), ':root[data-nexeno][data-nexeno-app=deck] body .x{a:b}')
})

test('leaves shared Nextcloud classes and other :has() alone', async () => {
	const { lowerAppHas } = await load()
	for (const css of [
		':root[data-nexeno]:has(.app-navigation-caption) .x{a:b}',
		':root[data-nexeno]:has(.app-deck-card) .x{a:b}',
		':root[data-nexeno] .x:has(.app-deck){a:b}',
		':root[data-nexeno]:has(#modal-inner) .x{a:b}',
	]) {
		assert.strictEqual(lowerAppHas(css), css)
	}
})

test('browser tests refuse CSS that skipped the rewrite (npm run watch)', async () => {
	const fs = require('node:fs')
	const os = require('node:os')
	const path = require('node:path')
	const { assertReleaseCss } = await import('../browser/global-setup.mjs')
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexeno-css-'))
	fs.writeFileSync(path.join(dir, 'nexeno-theme.css'), ':root[data-nexeno][data-nexeno-app=deck] .x{a:b}')
	assert.doesNotThrow(() => assertReleaseCss(dir))
	fs.writeFileSync(path.join(dir, 'nexeno-theme-nc35.css'), ':root[data-nexeno]:has(.app-deck) .x{a:b}')
	assert.throws(() => assertReleaseCss(dir), /nexeno-theme-nc35\.css/)
	fs.rmSync(dir, { recursive: true })
})
