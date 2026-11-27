/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Replaces the "which app is open" checks in the built stylesheets with a plain attribute, so the browser
 * no longer re-checks the whole page on every change. The SCSS keeps its :has(); only css/ changes.
 *
 *   :root[data-nexeno]:has(.app-deck) X       →  :root[data-nexeno][data-nexeno-app=deck] X
 *   :root[data-nexeno] body:has(.app-deck) X  →  :root[data-nexeno][data-nexeno-app=deck] body X
 *
 * Same elements, same specificity (one class becomes one attribute). It holds because Nextcloud puts
 * "app-<id>" on #content for the open app (core/templates/layout.user.php), and the theme sets
 * data-nexeno-app on <html> from the same app id (BeforeTemplateRenderedListener::appScript() before the
 * first paint, nexeno-state.js when the theme is turned on in an open tab).
 *
 * Only ids in APP_IDS are rewritten: Nextcloud app ids, not shared classes such as .app-navigation-caption.
 * Any other :has() is left as it is.
 *
 * Usage: node scripts/lower-app-has.mjs [file.css ...]   (default: css/nexeno-theme*.css)
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const APP_IDS = [
	'calendar',
	'collectives',
	'contacts',
	'cookbook',
	'cospend',
	'deck',
	'forms',
	'mail',
	'maps',
	'news',
	'notes',
	'spreed',
	'tables',
	'tasks',
]

const ids = APP_IDS.join('|')
// The app id must end the class name: ".app-deck)" only, never ".app-deck-card)".
const ROOT_FORM = new RegExp(`:root\\[data-nexeno\\]((?:\\[[^\\]]+\\]|:[a-z-]+(?:\\([^()]*\\))?)*?):has\\(\\.app-(${ids})\\)`, 'g')
const BODY_FORM = new RegExp(`:root\\[data-nexeno\\] body:has\\(\\.app-(${ids})\\)`, 'g')

/**
 * @param {string} css Built stylesheet.
 * @return {string} The stylesheet with the app checks rewritten.
 */
export function lowerAppHas(css) {
	return css
		.replace(BODY_FORM, (match, id) => `:root[data-nexeno][data-nexeno-app=${id}] body`)
		// Other attributes or pseudo-classes on the same :root compound stay where they are.
		.replace(ROOT_FORM, (match, rest, id) => `:root[data-nexeno]${rest}[data-nexeno-app=${id}]`)
}

const count = (css, re) => (css.match(re) || []).length

// Compared as file URLs: a plain "file://" + path differs from import.meta.url when the path has a space,
// and the build then skipped this step without an error.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const cssDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'css')
	const files = process.argv.length > 2
		? process.argv.slice(2)
		: fs.readdirSync(cssDir).filter((f) => /^nexeno-theme.*\.css$/.test(f)).map((f) => path.join(cssDir, f))
	const appHas = new RegExp(`:has\\(\\.app-(${ids})\\)`, 'g')
	for (const file of files) {
		const before = fs.readFileSync(file, 'utf8')
		const after = lowerAppHas(before)
		fs.writeFileSync(file, after)
		// eslint-disable-next-line no-console
		console.log(`${path.basename(file)}: ${count(before, appHas) - count(after, appHas)} app checks rewritten, ${count(after, appHas)} left`)
	}
}
