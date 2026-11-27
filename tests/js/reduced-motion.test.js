/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * The built theme stylesheet honours the device's "reduce motion" setting while the theme is on: transitions end at
 * once and scrolling jumps, from a cascade layer so no transition in the theme can win over it. Animations (loading
 * spinners) are left alone. Checked in a real browser when the change was made; this keeps the rule from going lost.
 */
const { test } = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

const css = fs.readFileSync(path.join(__dirname, '..', '..', 'css', 'nexeno-theme.css'), 'utf8')

test('the theme stylesheet has the reduced-motion layer, scoped to the theme being on', () => {
	const match = /@layer nexeno-reduced-motion\s*\{\s*@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([^{}]*)\{([^{}]*)\}/.exec(css)
	assert.ok(match, 'layer with the media query is in the built CSS')
	const selectors = match[1].split(',').map((s) => s.trim())
	assert.ok(selectors.every((s) => s.startsWith(':root[data-nexeno]')), 'only while the theme is on')
	assert.match(match[2], /transition-duration:\s*\.01ms\s*!important/)
	assert.match(match[2], /scroll-behavior:\s*auto\s*!important/)
	assert.doesNotMatch(match[2], /animation/, 'spinners keep turning')
})
