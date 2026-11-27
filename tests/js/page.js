/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Loads one of the app's browser scripts (js/*.js) into a jsdom page with just enough of Nextcloud
 * (OC, OCP.Toast, t) for it to run, and a fake server the test answers.
 */
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

const JS_DIR = path.join(__dirname, '..', '..', 'js')

/**
 * @param {object} options
 * @param {string} options.html The page body.
 * @param {string[]} options.scripts File names in js/ to run, in order.
 * @param {boolean} [options.themeOn] Puts data-nexeno on <html>, as the first-paint script does.
 * @param {object} [options.translations] { app: { text: translation } } for t().
 * @param {string} [options.url] Page address.
 * @param {Function} [options.fetch] Fake fetch; by default each request waits in `requests`.
 * @param {Function} [options.setup] Called with the window before the scripts run, to replace a browser API.
 */
function openPage({ html, scripts, themeOn = true, translations = {}, url = 'https://cloud.test/index.php/settings/user/theming', fetch, setup }) {
	const dom = new JSDOM(`<!doctype html><html${themeOn ? ' data-nexeno data-nexeno-light' : ''}><head data-user="alice"></head><body>${html}</body></html>`,
		{ runScripts: 'outside-only', pretendToBeVisual: true, url })
	const w = dom.window
	const toasts = []
	const requests = []
	w.OC = { generateUrl: (p) => '/index.php' + p, requestToken: 'token' }
	w.OCP = { Toast: { success: (m) => toasts.push(['success', m]), error: (m) => toasts.push(['error', m]) } }
	w.t = (app, text) => (translations[app] && translations[app][text]) || text
	w.matchMedia = () => ({ matches: false, addEventListener() {} })
	w.BroadcastChannel = undefined
	w.alert = () => {
		throw new Error('a script ran')
	}
	w.fetch = fetch || ((u, options) => new Promise((resolve) => {
		requests.push({ url: u, body: options && options.body ? JSON.parse(options.body) : null, resolve })
	}))
	if (setup) {
		setup(w)
	}
	// Loaded first on every page, as the server does (BeforeTemplateRenderedListener::THEME_SCRIPTS).
	for (const name of ['nexeno-filetypes.js', ...scripts.filter((s) => s !== 'nexeno-filetypes.js')]) {
		w.eval(fs.readFileSync(path.join(JS_DIR, name), 'utf8'))
	}
	return { w, doc: w.document, toasts, requests }
}

/** Waits for timers, animation frames and promise callbacks to settle. */
const settle = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = { openPage, settle }
