/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * js/nexeno-state.js on the Appearance settings page: turning the theme on and off, choosing a variant,
 * and what happens when the server does not save it.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

function settingsPage(variant, lastVariant, assets = null) {
	const enabled = variant !== 'off'
	const selected = enabled ? variant : lastVariant
	const state = (key, value) => `<input type="hidden" id="initial-state-nexeno_theme-${key}" value="${Buffer.from(JSON.stringify(value)).toString('base64')}">`
	const radio = (v) => `<input type="radio" name="nexeno_theme-variant" value="${v}"${enabled ? '' : ' disabled'}${selected === v ? ' checked' : ''}>`
	const html = '<div id="app-content"><div id="settings-personal-theming"><div class="theming__preview--dark"><input type="radio" id="core-dark"></div></div>'
		+ `<div id="nexeno_theme-settings"><input type="checkbox" id="nexeno_theme-enabled"${enabled ? ' checked' : ''}>${radio('system')}${radio('light')}${radio('dark')}</div></div>`
		+ state('variant', variant) + state('user-themes', ['default']) + (assets ? state('assets', assets) : '')
	const page = openPage({ html, scripts: ['nexeno-state.js'], themeOn: false })
	page.doc.body.setAttribute('data-theme-default', '')
	page.doc.body.dataset.themes = 'default'
	return page
}

const ok = (themes) => ({ ok: true, status: 200, json: async () => ({ enabledThemes: themes }) })
const fail = { ok: false, status: 500, json: async () => ({}) }
const click = (w, el) => {
	el.checked = el.type === 'checkbox' ? !el.checked : true
	el.dispatchEvent(new w.Event('change', { bubbles: true }))
}
const markers = (doc) => ['data-nexeno', 'data-nexeno-light', 'data-nexeno-dark'].filter((a) => doc.body.hasAttribute(a))

test('turning the theme on saves it and shows the Nexeno look at once', async () => {
	const { w, doc, toasts, requests } = settingsPage('off', 'dark')
	await settle()
	click(w, doc.getElementById('nexeno_theme-enabled'))
	assert.deepStrictEqual(markers(doc), ['data-nexeno', 'data-nexeno-dark'])
	await settle()
	assert.deepStrictEqual(requests.map((r) => r.body), [{ variant: 'dark' }])
	requests[0].resolve(ok(['dark']))
	await settle()
	assert.strictEqual(doc.body.dataset.themes, 'dark')
	assert.strictEqual(toasts[0][0], 'success')
})

test('turning the theme on marks the open app for the stylesheets', async () => {
	const { w, doc } = settingsPage('off', 'dark')
	doc.getElementById('app-content').insertAdjacentHTML('beforebegin', '<div id="content" class="app-settings"></div>')
	await settle()
	assert.strictEqual(doc.documentElement.dataset.nexenoApp, undefined)
	click(w, doc.getElementById('nexeno_theme-enabled'))
	assert.strictEqual(doc.documentElement.dataset.nexenoApp, 'settings')
})

test('turning the theme on fails: the page goes back to off', async () => {
	const { w, doc, toasts, requests } = settingsPage('off', 'dark')
	await settle()
	click(w, doc.getElementById('nexeno_theme-enabled'))
	await settle()
	requests[0].resolve(fail)
	await settle()
	assert.deepStrictEqual(markers(doc), [])
	assert.strictEqual(doc.getElementById('nexeno_theme-enabled').checked, false)
	assert.strictEqual(doc.querySelector('input[value="dark"]').disabled, true)
	assert.strictEqual(doc.body.dataset.themes, 'default')
	assert.deepStrictEqual(toasts.map((x) => x[0]), ['error'])
})

test('changing dark to light fails: dark is selected again', async () => {
	const { w, doc, requests } = settingsPage('dark', 'dark')
	await settle()
	click(w, doc.querySelector('input[value="light"]'))
	await settle()
	requests[0].resolve(fail)
	await settle()
	assert.deepStrictEqual(markers(doc), ['data-nexeno', 'data-nexeno-dark'])
	assert.strictEqual(doc.querySelector('input[value="dark"]').checked, true)
})

test('two quick clicks are saved one after the other and the last one wins', async () => {
	const { w, doc, requests } = settingsPage('dark', 'dark')
	await settle()
	click(w, doc.querySelector('input[value="light"]'))
	click(w, doc.querySelector('input[value="system"]'))
	await settle()
	assert.strictEqual(requests.length, 1, 'the second save waits for the first')
	requests[0].resolve(fail)
	await settle()
	assert.deepStrictEqual(markers(doc), ['data-nexeno', 'data-nexeno-light'], 'an older failure does not undo the newer click')
	assert.deepStrictEqual(requests.map((r) => r.body.variant), ['light', 'system'])
	requests[1].resolve(ok(['default']))
	await settle()
	assert.strictEqual(doc.body.dataset.themes, 'light', 'system: Nextcloud default swapped for light')
})

test('Nextcloud\'s own theme buttons stay locked while the theme is on, also when added later', async () => {
	const { doc } = settingsPage('dark', 'dark')
	await settle()
	assert.strictEqual(doc.getElementById('core-dark').disabled, true)
	const added = doc.createElement('div')
	added.className = 'theming__preview--light'
	added.innerHTML = '<input type="radio" id="core-light">'
	doc.getElementById('settings-personal-theming').appendChild(added)
	await settle(60)
	assert.strictEqual(doc.getElementById('core-light').disabled, true)
})

test('theme off: its files are added only when it is turned on, once and in order', async () => {
	const assets = {
		styles: ['/custom_apps/nexeno_theme/css/nexeno-theme.css?v=2', '/custom_apps/nexeno_theme/css/nexeno-theme-nc35.css?v=2'],
		scripts: ['/custom_apps/nexeno_theme/js/nexeno-files.js?v=2', '/custom_apps/nexeno_theme/js/nexeno-modal.js?v=2'],
	}
	const { w, doc } = settingsPage('off', 'dark', assets)
	// settings-personal.php already put the main stylesheet on this page.
	const existing = doc.createElement('link')
	existing.rel = 'stylesheet'
	existing.href = '/custom_apps/nexeno_theme/css/nexeno-theme.css?v=1'
	doc.head.appendChild(existing)
	const added = () => Array.from(doc.head.querySelectorAll('link, script')).filter((el) => el !== existing)
		.map((el) => new w.URL(el.href || el.src).pathname)
	await settle()
	assert.deepStrictEqual(added(), [], 'nothing loads while the theme is off')

	const toggle = doc.getElementById('nexeno_theme-enabled')
	click(w, toggle)
	assert.deepStrictEqual(added(), [
		'/custom_apps/nexeno_theme/css/nexeno-theme-nc35.css',
		'/custom_apps/nexeno_theme/js/nexeno-files.js',
		'/custom_apps/nexeno_theme/js/nexeno-modal.js',
	])
	assert.ok(Array.from(doc.head.querySelectorAll('script')).every((el) => el.async === false), 'scripts run in list order')

	// Off and on again; the files switch with the page at once, before the server answers.
	click(w, toggle)
	click(w, toggle)
	assert.strictEqual(added().length, 3, 'turning it on again adds nothing twice')
})

for (const { id, path } of [
	{ id: 'nexeno_theme-login-style-enabled', path: '/apps/nexeno_theme/login-style' },
	{ id: 'nexeno_theme-organisation-colour-enabled', path: '/apps/nexeno_theme/organisation-colour' },
	{ id: 'nexeno_theme-app-menu-enabled', path: '/apps/nexeno_theme/app-menu' },
]) {
	const adminPage = () => openPage({ html: `<input type="checkbox" id="${id}" autocomplete="off">`, scripts: ['nexeno-state.js'], themeOn: false })

	test(`admin switch ${id} saves to ${path}`, async () => {
		const { w, doc, toasts, requests } = adminPage()
		const input = doc.getElementById(id)
		click(w, input)
		assert.strictEqual(input.disabled, true)
		assert.strictEqual(requests[0].url, '/index.php' + path)
		assert.deepStrictEqual(requests[0].body, { enabled: true })
		requests[0].resolve({ ok: true, status: 200 })
		await settle()
		assert.strictEqual(input.checked, true)
		assert.strictEqual(input.disabled, false)
		assert.deepStrictEqual(toasts.map((x) => x[0]), ['success'])
	})

	test(`admin switch ${id} flips back when the server does not save it`, async () => {
		const { w, doc, toasts, requests } = adminPage()
		const input = doc.getElementById(id)
		click(w, input)
		requests[0].resolve(fail)
		await settle()
		assert.strictEqual(input.checked, false)
		assert.strictEqual(input.disabled, false)
		assert.deepStrictEqual(toasts.map((x) => x[0]), ['error'])
	})
}

test('"system" from the overview page (src/store.js): this tab swaps "default" for the device setting', async () => {
	const channels = []
	const { doc } = openPage({
		html: '',
		scripts: ['nexeno-state.js'],
		themeOn: false,
		setup(w) {
			// The device is dark; it does not ask for more contrast.
			w.matchMedia = (query) => ({ matches: query.includes('dark'), addEventListener() {} })
			w.BroadcastChannel = class {
				constructor() {
					channels.push(this)
				}

				postMessage() {}
			}
		},
	})
	await settle()
	// src/store.js posts the server's answer as it is, with Nextcloud's "default" placeholder.
	channels[0].onmessage({ data: { variant: 'system', themes: ['default', 'opendyslexic'] } })
	assert.strictEqual(doc.body.dataset.themes, 'dark,opendyslexic')
	assert.ok(doc.body.hasAttribute('data-nexeno-dark'))
})

test('a change from another tab selects that variant here, so clicking the old one still saves it', async () => {
	const channels = []
	const radio = (v) => `<input type="radio" name="nexeno_theme-variant" value="${v}"${v === 'dark' ? ' checked' : ''}>`
	const initial = (key, value) => `<input type="hidden" id="initial-state-nexeno_theme-${key}" value="${Buffer.from(JSON.stringify(value)).toString('base64')}">`
	const { w, doc, requests } = openPage({
		html: `<div id="nexeno_theme-settings"><input type="checkbox" id="nexeno_theme-enabled" checked>${radio('system')}${radio('light')}${radio('dark')}</div>`
			+ initial('variant', 'dark') + initial('user-themes', ['default']),
		scripts: ['nexeno-state.js'],
		themeOn: false,
		setup(win) {
			win.BroadcastChannel = class {
				constructor() {
					channels.push(this)
				}

				postMessage() {}
			}
		},
	})
	await settle()
	channels[0].onmessage({ data: { variant: 'light', themes: ['light'] } })
	assert.strictEqual(doc.querySelector('input[value="light"]').checked, true)
	assert.strictEqual(doc.querySelector('input[value="dark"]').checked, false)

	click(w, doc.querySelector('input[value="dark"]'))
	await settle()
	assert.deepStrictEqual(requests.map((r) => r.body.variant), ['dark'])

	// Turned off in the other tab: the switch follows, and dark stays selected for the next turn-on.
	channels[0].onmessage({ data: { variant: 'off', themes: ['default'] } })
	assert.strictEqual(doc.getElementById('nexeno_theme-enabled').checked, false)
	assert.strictEqual(doc.querySelector('input[value="dark"]').checked, true)
})
