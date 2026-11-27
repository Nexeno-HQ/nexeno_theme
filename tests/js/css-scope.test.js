/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * The theme stylesheets load on every page, also for users with the theme off. Every rule must wait for
 * the data-nexeno marker, or it restyles Nextcloud for people who never turned the theme on.
 * Run after the CSS build: it reads the compiled files in css/.
 */
const fs = require('fs')
const assert = require('node:assert')
const { test } = require('node:test')
const path = require('path')

const CSS_DIR = path.join(__dirname, '..', '..', 'css')
// The theme's own settings panel and the SVG filter it injects are styled whether the theme is on or off.
const ALWAYS_ALLOWED = /^(#nexeno|\.nexeno_theme-theme-card)/

// Splits a selector list on its top-level commas only, so ":has(a, b)" stays in one piece.
function splitSelectors(list) {
	const parts = []
	let depth = 0
	let current = ''
	for (const char of list) {
		if (char === '(') {
			depth++
		} else if (char === ')') {
			depth--
		}
		if (char === ',' && depth === 0) {
			parts.push(current)
			current = ''
		} else {
			current += char
		}
	}
	parts.push(current)
	return parts.map((part) => part.trim()).filter(Boolean)
}

function unscopedSelectors(css) {
	const rules = css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/@font-face\s*\{[^}]*\}/g, '')
		.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, '')
		// Unwrap at-rules such as @media and @supports so the rules inside are checked too.
		.replace(/@(media|supports|layer|container)[^{]*\{/g, '')
	const found = new Set()
	for (const [, list] of rules.matchAll(/([^{}]+)\{/g)) {
		for (const selector of splitSelectors(list)) {
			if (!selector.includes('data-nexeno') && !ALWAYS_ALLOWED.test(selector)) {
				found.add(selector)
			}
		}
	}
	return [...found]
}

const files = fs.readdirSync(CSS_DIR).filter((file) => /^nexeno-theme.*\.css$/.test(file))

test('the theme stylesheets are built', () => {
	assert.ok(files.includes('nexeno-theme.css'), 'run npm run build first')
})

for (const file of files) {
	test(`${file}: every rule waits for the theme to be on`, () => {
		const leaks = unscopedSelectors(fs.readFileSync(path.join(CSS_DIR, file), 'utf8'))
		assert.deepStrictEqual(leaks.slice(0, 10), [], `${leaks.length} selectors apply with the theme off`)
	})
}
