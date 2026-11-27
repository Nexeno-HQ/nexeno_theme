/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * js/nexeno-favorites.js puts dashboard widget icons into the page as inline SVG. The icon comes from
 * whichever app provides the widget, so anything that could run script must be removed first.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const { openPage, settle } = require('./page.js')

async function inline(svg) {
	const page = openPage({
		html: '<ul><li class="item-list__entry"><img class="item-icon" src="/apps/files/img/x.svg"></li></ul>',
		scripts: ['nexeno-favorites.js'],
		url: 'https://cloud.test/index.php/apps/dashboard/',
		fetch: async () => ({ ok: true, text: async () => svg }),
	})
	await settle(60)
	return { ...page, span: page.doc.querySelector('.nexeno-activity-icon') }
}

test('a normal icon is inlined exactly as before', async () => {
	const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M1 1h14v14H1z" fill="currentColor"/><a href="/apps/files"><circle r="2"/></a></svg>'
	const { doc, span } = await inline(svg)
	const old = doc.createElement('span')
	old.innerHTML = svg
	assert.strictEqual(span.innerHTML, old.innerHTML)
	assert.strictEqual(span.firstElementChild.namespaceURI, 'http://www.w3.org/2000/svg')
})

test('scripts, event handlers and javascript: links are removed, the drawing is kept', async () => {
	const { span } = await inline('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" onload="alert(1)">'
		+ '<script>alert(2)</script><path d="M0 0h16v16H0z" fill="currentColor" onclick="alert(3)"/>'
		+ '<a href="javascript:alert(4)"><circle r="2"/></a><foreignObject><img src=x onerror="alert(5)"></foreignObject></svg>')
	assert.ok(span.querySelector('path[fill="currentColor"]') && span.querySelector('circle'))
	assert.doesNotMatch(span.innerHTML, /onload|onclick|onerror|<script|javascript:|foreignObject/i)
})

test('a <style> in the icon is removed, so it cannot restyle the page', async () => {
	const { span } = await inline('<svg xmlns="http://www.w3.org/2000/svg"><style>.cls-1{fill:#fff}body{display:none}</style>'
		+ '<path class="cls-1" d="M1 1h14v14H1z"/></svg>')
	assert.ok(span.querySelector('path.cls-1'), 'icon kept')
	assert.strictEqual(span.querySelector('style'), null)
})

test('javascript: split by a tab, newline or leading space is removed too', async () => {
	const { span } = await inline('<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1h14v14H1z"/>'
		+ '<a href="java&#x09;script:alert(1)"><circle r="2"/></a>'
		+ '<a href=" &#x0D;JaVa&#x0A;Script:alert(2)"><rect width="2" height="2"/></a>'
		+ '<animate attributeName="href" to="java&#x0A;script:alert(3)"/></svg>')
	assert.ok(span.querySelector('path') && span.querySelector('circle') && span.querySelector('rect'), 'icon kept')
	span.querySelectorAll('a').forEach((a) => assert.strictEqual(a.getAttribute('href'), null))
	assert.strictEqual(span.querySelector('animate').getAttribute('to'), null)
})
