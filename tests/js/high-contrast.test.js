/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * High contrast on top of Nexeno Light and Dark. It is on when the user chose one of Nextcloud's high-contrast
 * themes or the device asks for more contrast. A chosen high-contrast theme decides light or dark, as its name
 * says ("Dark theme with high contrast mode"); otherwise the Nexeno variant does. <body> gets exactly one
 * Nextcloud theme and <html> the matching Nexeno marker, so light and dark colours never mix, plus
 * data-nexeno-hc for the Nexeno high-contrast colours. The first-paint script (PHP) and nexeno-state.js must
 * apply the same rule.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { execFileSync } = require('child_process')
const path = require('path')
const { openPage, settle } = require('./page.js')

const ROOT = path.join(__dirname, '..', '..')

/** The first-paint script exactly as the server prints it. */
function firstPaintScript(variant, bodyThemes) {
	return execFileSync('php', ['-r', 'require "tests/bootstrap.php"; echo OCA\\NexenoTheme\\Listener\\BeforeTemplateRenderedListener::firstPaintScript($argv[1], json_decode($argv[2]));', '--', variant, JSON.stringify(bodyThemes)], { cwd: ROOT, encoding: 'utf8' })
}

/** matchMedia for a device that is dark and/or asks for more contrast; change() fires its listeners. */
function device({ dark = false, moreContrast = false } = {}) {
	const listeners = []
	const settings = { dark, moreContrast }
	return {
		settings,
		install(w) {
			w.matchMedia = (query) => {
				const media = {
					get matches() {
						return query.includes('contrast') ? settings.moreContrast : settings.dark
					},
					addEventListener(type, listener) {
						listeners.push({ query, listener })
					},
				}
				return media
			}
		},
		change(kind) {
			listeners.filter((l) => l.query.includes(kind)).forEach((l) => l.listener())
		},
	}
}

const themesOf = (doc) => doc.body.dataset.themes
const hcMarker = (doc) => doc.documentElement.hasAttribute('data-nexeno-hc')
/** 'light' or 'dark' from the Nexeno markers on <html>, which pick the Nexeno colours. */
const nexenoShade = (doc) => ['light', 'dark'].filter((v) => doc.documentElement.hasAttribute('data-nexeno-' + v)).join(',')

for (const [name, variant, themes, dev, expected, marker] of [
	['Nextcloud\'s dark high contrast chosen, Nexeno Light: dark', 'light', ['light', 'dark-highcontrast'], {}, 'dark-highcontrast', true],
	['Nextcloud\'s light high contrast chosen, Nexeno Dark: light', 'dark', ['dark', 'light-highcontrast', 'opendyslexic'], {}, 'light-highcontrast,opendyslexic', true],
	['no high contrast: unchanged', 'dark', ['dark', 'opendyslexic'], {}, 'dark,opendyslexic', false],
	['device asks for more contrast, System default on a dark device', 'system', ['default', 'opendyslexic'], { dark: true, moreContrast: true }, 'dark-highcontrast,opendyslexic', true],
	['device asks for more contrast, Nexeno Light: the Nexeno variant decides', 'light', ['light'], { dark: true, moreContrast: true }, 'light-highcontrast', true],
]) {
	test(`first paint: ${name}`, () => {
		const d = device(dev)
		const { w, doc } = openPage({ html: '', scripts: [], themeOn: false, setup: d.install })
		w.eval(firstPaintScript(variant, themes))
		assert.strictEqual(themesOf(doc), expected)
		assert.strictEqual(hcMarker(doc), marker)
		assert.strictEqual(nexenoShade(doc), expected.startsWith('dark') ? 'dark' : 'light', 'Nexeno colours match Nextcloud\'s')
		// Exactly one data-theme-* per theme id, so no light and dark colours from Nextcloud at once.
		assert.deepStrictEqual(Array.from(doc.body.attributes).map((a) => a.name).filter((n) => n.startsWith('data-theme-')).sort(),
			expected.split(',').map((id) => 'data-theme-' + id).sort())
	})
}

function appearancePage({ variant, lastVariant = 'dark', userThemes, dev = device() }) {
	const enabled = variant !== 'off'
	const selected = enabled ? variant : lastVariant
	const state = (key, value) => `<input type="hidden" id="initial-state-nexeno_theme-${key}" value="${Buffer.from(JSON.stringify(value)).toString('base64')}">`
	const radio = (v) => `<input type="radio" name="nexeno_theme-variant" value="${v}"${enabled ? '' : ' disabled'}${selected === v ? ' checked' : ''}>`
	const core = (id) => `<div class="theming__preview--${id}"><input type="radio" id="core-${id}"></div>`
	const html = '<div id="app-content"><div id="settings-personal-theming">'
		+ ['default', 'light', 'dark', 'light-highcontrast', 'dark-highcontrast', 'opendyslexic'].map(core).join('') + '</div>'
		// As templates/settings-personal.php renders the hint: hidden unless a chosen high-contrast theme decides.
		+ `<div id="nexeno_theme-settings"><input type="checkbox" id="nexeno_theme-enabled"${enabled ? ' checked' : ''}>`
		+ `<p id="nexeno_theme-high-contrast-hint"${enabled && userThemes.some((id) => id.endsWith('-highcontrast')) ? '' : ' hidden'}>High contrast is on</p>`
		+ `${radio('system')}${radio('light')}${radio('dark')}</div></div>`
		+ state('variant', variant) + state('user-themes', userThemes)
	const page = openPage({ html, scripts: ['nexeno-state.js'], themeOn: false, setup: dev.install })
	return { ...page, dev }
}

/** Sets <body> the way the first-paint script or Nextcloud's own theme picker does. */
function writeBody(doc, themes) {
	Array.from(doc.body.attributes).filter((a) => a.name.startsWith('data-theme-')).forEach((a) => doc.body.removeAttribute(a.name))
	themes.forEach((id) => doc.body.setAttribute('data-theme-' + id, ''))
	doc.body.setAttribute('data-themes', themes.join(','))
}

const ok = (themes) => ({ ok: true, status: 200, json: async () => ({ enabledThemes: themes }) })
const click = (w, el) => {
	el.checked = el.type === 'checkbox' ? !el.checked : true
	el.dispatchEvent(new w.Event('change', { bubbles: true }))
}

test('turning the theme on keeps the user\'s Nextcloud high contrast, turning it off gives it back', async () => {
	const { w, doc, requests } = appearancePage({ variant: 'off', lastVariant: 'light', userThemes: ['dark-highcontrast'] })
	writeBody(doc, ['dark-highcontrast'])
	await settle()

	click(w, doc.getElementById('nexeno_theme-enabled'))
	assert.strictEqual(themesOf(doc), 'dark-highcontrast', 'at once, before the server answers; the chosen dark wins over Nexeno Light')
	assert.strictEqual(nexenoShade(doc), 'dark')
	assert.ok(hcMarker(doc))
	await settle()
	requests[0].resolve(ok(['light', 'dark-highcontrast']))
	await settle()
	assert.strictEqual(themesOf(doc), 'dark-highcontrast', 'the server\'s marker is resolved the same way')
	assert.strictEqual(nexenoShade(doc), 'dark')

	click(w, doc.getElementById('nexeno_theme-enabled'))
	assert.strictEqual(themesOf(doc), 'dark-highcontrast', 'off: the user\'s own Nextcloud themes')
	assert.ok(!hcMarker(doc))
	assert.strictEqual(nexenoShade(doc), '')
	w.close()
})

test('Nextcloud\'s high-contrast buttons stay usable while the theme is on; its other themes stay locked', async () => {
	const { w, doc } = appearancePage({ variant: 'dark', userThemes: ['default'] })
	await settle(60)
	assert.strictEqual(doc.getElementById('core-light-highcontrast').disabled, false)
	assert.strictEqual(doc.getElementById('core-dark-highcontrast').disabled, false)
	assert.strictEqual(doc.getElementById('core-dark').disabled, true)
	assert.strictEqual(doc.getElementById('core-default').disabled, true)
	w.close()
})

test('Nextcloud\'s picker turns high contrast on and off: its light or dark wins, the rest follows, without a loop', async () => {
	const { w, doc } = appearancePage({ variant: 'dark', userThemes: ['default'] })
	writeBody(doc, ['dark'])
	await settle()

	let writes = 0
	new w.MutationObserver((records) => {
		writes += records.length
	}).observe(doc.body, { attributes: true, attributeFilter: ['data-themes'] })

	// Nextcloud's picker writes the user's new choice, light high contrast, over Nexeno Dark.
	writeBody(doc, ['light-highcontrast'])
	await settle(100)
	assert.strictEqual(themesOf(doc), 'light-highcontrast')
	assert.ok(!doc.body.hasAttribute('data-theme-dark'))
	assert.strictEqual(nexenoShade(doc), 'light', 'the Nexeno colours switch to light with it')
	assert.ok(hcMarker(doc))
	assert.ok(writes <= 2, `body written ${writes} times`)

	// Dark high contrast: everything dark again.
	writeBody(doc, ['dark-highcontrast'])
	await settle(100)
	assert.strictEqual(themesOf(doc), 'dark-highcontrast')
	assert.strictEqual(nexenoShade(doc), 'dark')

	// And off again: Nextcloud goes back to its default theme, the Nexeno variant (Dark) decides again.
	writeBody(doc, ['default'])
	await settle(100)
	assert.strictEqual(themesOf(doc), 'dark')
	assert.strictEqual(nexenoShade(doc), 'dark')
	assert.ok(!hcMarker(doc))

	// The user's latest Nextcloud choice is what comes back when the Nexeno theme is turned off.
	click(w, doc.getElementById('nexeno_theme-enabled'))
	assert.strictEqual(themesOf(doc), 'default')
	w.close()
})

test('the device\'s "increase contrast" setting switches high contrast while the page is open', async () => {
	const dev = device()
	const { w, doc } = appearancePage({ variant: 'light', userThemes: ['default', 'opendyslexic'], dev })
	writeBody(doc, ['light', 'opendyslexic'])
	await settle()

	dev.settings.moreContrast = true
	dev.change('contrast')
	assert.strictEqual(themesOf(doc), 'light-highcontrast,opendyslexic')
	assert.ok(hcMarker(doc))

	dev.settings.moreContrast = false
	dev.change('contrast')
	assert.strictEqual(themesOf(doc), 'light,opendyslexic')
	assert.ok(!hcMarker(doc))
	w.close()
})

const radios = (doc) => Array.from(doc.querySelectorAll('input[name="nexeno_theme-variant"]'))
const hint = (doc) => doc.getElementById('nexeno_theme-high-contrast-hint')

test('high contrast chosen in Nextcloud: Nexeno options stay clickable with none shown as chosen, Nextcloud\'s others stay locked', async () => {
	const { w, doc } = appearancePage({ variant: 'light', userThemes: ['dark-highcontrast'] })
	await settle(60)
	assert.ok(radios(doc).every((r) => !r.disabled))
	assert.ok(radios(doc).every((r) => !r.checked), 'none is applied, and a click on any of them must count')
	assert.strictEqual(hint(doc).hidden, false)
	assert.ok(radios(doc).every((r) => r.getAttribute('aria-describedby') === 'nexeno_theme-high-contrast-hint'))
	for (const id of ['default', 'light', 'dark', 'opendyslexic']) {
		assert.strictEqual(doc.getElementById('core-' + id).disabled, true, `${id}: locked`)
	}
	for (const id of ['light-highcontrast', 'dark-highcontrast']) {
		assert.strictEqual(doc.getElementById('core-' + id).disabled, false, `${id}: usable`)
	}
	w.close()
})

/** Records the user's clicks Nextcloud's own list would act on (the "Default" theme). */
function watchNextcloudDefault(doc) {
	const clicks = []
	doc.getElementById('core-default').addEventListener('change', (event) => clicks.push(event.target.checked))
	return clicks
}

for (const [name, picked] of [['another option (Dark)', 'dark'], ['the option saved before (Light)', 'light']]) {
	test(`picking ${name} during high contrast turns it off in Nextcloud and applies that Nexeno option`, async () => {
		const { w, doc, requests } = appearancePage({ variant: 'light', userThemes: ['dark-highcontrast', 'opendyslexic'] })
		writeBody(doc, ['dark-highcontrast', 'opendyslexic'])
		await settle(60)
		const defaultClicks = watchNextcloudDefault(doc)

		click(w, doc.querySelector(`input[value="${picked}"]`))
		assert.deepStrictEqual(defaultClicks, [true], 'Nextcloud\'s own list is asked to switch to its default theme')
		assert.strictEqual(doc.getElementById('core-default').disabled, true, 'locked again right after')
		assert.strictEqual(themesOf(doc), picked + ',opendyslexic', 'the picked Nexeno option, at once; the font stays')
		assert.strictEqual(nexenoShade(doc), picked)
		assert.ok(!hcMarker(doc))
		assert.strictEqual(hint(doc).hidden, true)
		assert.strictEqual(doc.querySelector(`input[value="${picked}"]`).checked, true)
		await settle()
		assert.deepStrictEqual(requests.map((r) => r.body.variant), [picked])

		// Nextcloud's list then writes the user's new themes; the Nexeno option stays.
		writeBody(doc, ['default', 'opendyslexic'])
		await settle(100)
		assert.strictEqual(themesOf(doc), picked + ',opendyslexic')
		w.close()
	})
}

test('before Nextcloud\'s list is on the page, high contrast is turned off through the same Nextcloud API', async () => {
	const state = (key, value) => `<input type="hidden" id="initial-state-nexeno_theme-${key}" value="${Buffer.from(JSON.stringify(value)).toString('base64')}">`
	const calls = []
	const { w, doc } = openPage({
		html: '<div id="app-content"><div id="nexeno_theme-settings"><input type="checkbox" id="nexeno_theme-enabled" checked>'
			+ '<p id="nexeno_theme-high-contrast-hint">High contrast is on</p>'
			+ ['system', 'light', 'dark'].map((v) => `<input type="radio" name="nexeno_theme-variant" value="${v}">`).join('') + '</div></div>'
			+ state('variant', 'light') + state('user-themes', ['light-highcontrast']),
		scripts: ['nexeno-state.js'],
		themeOn: false,
		setup(win) {
			win.OC.linkToOCS = (path, version) => `/ocs/v${version}.php/${path}/`
			win.fetch = (url, options) => {
				calls.push(options.method + ' ' + url)
				return Promise.resolve({ ok: true, status: 200, json: async () => ({ enabledThemes: ['dark'] }) })
			}
		},
	})
	await settle()
	click(w, doc.querySelector('input[value="dark"]'))
	await settle(60)
	assert.deepStrictEqual(calls.filter((c) => c.includes('/ocs/')), [
		'PUT /ocs/v2.php/apps/theming/api/v1/theme/default/enable',
		'DELETE /ocs/v2.php/apps/theming/api/v1/theme/light-highcontrast',
	], 'the same calls, in the same order, as Nextcloud\'s list')
	assert.strictEqual(themesOf(doc), 'dark')
	w.close()
})

test('turning high contrast off through the Nextcloud API: an HTTP error stops there and tells the user', async () => {
	const state = (key, value) => `<input type="hidden" id="initial-state-nexeno_theme-${key}" value="${Buffer.from(JSON.stringify(value)).toString('base64')}">`
	const calls = []
	const { w, doc, toasts } = openPage({
		html: '<div id="app-content"><div id="nexeno_theme-settings"><input type="checkbox" id="nexeno_theme-enabled" checked>'
			+ '<p id="nexeno_theme-high-contrast-hint">High contrast is on</p>'
			+ ['system', 'light', 'dark'].map((v) => `<input type="radio" name="nexeno_theme-variant" value="${v}">`).join('') + '</div></div>'
			+ state('variant', 'light') + state('user-themes', ['light-highcontrast']),
		scripts: ['nexeno-state.js'],
		themeOn: false,
		setup(win) {
			win.OC.linkToOCS = (path, version) => `/ocs/v${version}.php/${path}/`
			win.fetch = (url, options) => {
				calls.push(options.method + ' ' + url)
				// Expired session: Nextcloud's theming API refuses, the Nexeno save still works.
				return url.includes('/ocs/')
					? Promise.resolve({ ok: false, status: 401, json: async () => ({}) })
					: Promise.resolve({ ok: true, status: 200, json: async () => ({ enabledThemes: ['dark'] }) })
			}
		},
	})
	await settle()
	click(w, doc.querySelector('input[value="dark"]'))
	await settle(60)
	assert.deepStrictEqual(calls.filter((c) => c.includes('/ocs/')), [
		'PUT /ocs/v2.php/apps/theming/api/v1/theme/default/enable',
	], 'no DELETE after the refused PUT')
	assert.deepStrictEqual(toasts.filter((toast) => toast[0] === 'error'), [['error', 'Could not save the Nexeno theme setting.']])
	w.close()
})

test('during high contrast, turning the theme off and on again keeps the saved variant, not "system"', async () => {
	const { w, doc, requests } = appearancePage({ variant: 'dark', userThemes: ['light-highcontrast'] })
	writeBody(doc, ['light-highcontrast'])
	await settle()
	assert.ok(radios(doc).every((r) => !r.checked), 'no option is selected during high contrast')

	click(w, doc.getElementById('nexeno_theme-enabled'))
	await settle()
	requests[0].resolve(ok(['light-highcontrast']))
	await settle()
	click(w, doc.getElementById('nexeno_theme-enabled'))
	await settle()
	assert.deepStrictEqual(requests.map((r) => r.body.variant), ['off', 'dark'])
	w.close()
})

test('high contrast only from the device: the Nexeno options work as usual, as they decide light or dark', async () => {
	const { w, doc } = appearancePage({ variant: 'dark', userThemes: ['default'], dev: device({ moreContrast: true }) })
	await settle(60)
	assert.ok(radios(doc).every((r) => !r.disabled))
	assert.strictEqual(doc.querySelector('input[value="dark"]').checked, true)
	assert.strictEqual(hint(doc).hidden, true)
	w.close()
})

test('theme off with high contrast chosen: no hint, and turning the theme on keeps high contrast', async () => {
	const { w, doc } = appearancePage({ variant: 'off', lastVariant: 'dark', userThemes: ['light-highcontrast'] })
	await settle(60)
	assert.strictEqual(hint(doc).hidden, true)
	const defaultClicks = watchNextcloudDefault(doc)
	click(w, doc.getElementById('nexeno_theme-enabled'))
	assert.deepStrictEqual(defaultClicks, [], 'the on switch is not a Nexeno option')
	assert.strictEqual(themesOf(doc), 'light-highcontrast')
	assert.strictEqual(hint(doc).hidden, false)
	w.close()
})

test('another tab that left high contrast: this tab follows at once, without a reload', async () => {
	const channels = []
	const dev = device()
	const state = (key, value) => `<input type="hidden" id="initial-state-nexeno_theme-${key}" value="${Buffer.from(JSON.stringify(value)).toString('base64')}">`
	const { doc } = openPage({
		html: state('variant', 'light') + state('user-themes', ['dark-highcontrast']),
		scripts: ['nexeno-state.js'],
		themeOn: false,
		setup(win) {
			dev.install(win)
			win.BroadcastChannel = class {
				constructor() {
					channels.push(this)
				}

				postMessage() {}
			}
		},
	})
	writeBody(doc, ['dark-highcontrast'])
	await settle()
	// The settings tab picked Nexeno Light, which turned Nextcloud's high contrast off there.
	channels[0].onmessage({ data: { variant: 'light', themes: ['light'], userThemes: ['default'] } })
	assert.strictEqual(themesOf(doc), 'light')
	assert.strictEqual(nexenoShade(doc), 'light')
	assert.ok(!hcMarker(doc))
	// And back on in Nextcloud's list there: dark high contrast here too.
	channels[0].onmessage({ data: { variant: 'light', themes: ['dark-highcontrast'], userThemes: ['dark-highcontrast'] } })
	assert.strictEqual(themesOf(doc), 'dark-highcontrast')
	assert.strictEqual(nexenoShade(doc), 'dark')
})
