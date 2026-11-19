/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Translations mark one highlighted part with <span>…</span>. Split the text into plain parts so the
 * template renders each as text and a translation can never inject HTML. Without a valid <span>
 * pair, all tags are stripped and the whole text is returned as `before`.
 *
 * @param {string} text Translated text with one <span>…</span>
 * @return {{before: string, highlight: string, after: string}}
 */
export function splitHighlight(text) {
	const match = text.match(/^([\s\S]*?)<span>([\s\S]*?)<\/span>([\s\S]*)$/)
	return match
		? { before: match[1], highlight: match[2], after: match[3] }
		: { before: text.replace(/<[^>]*>/g, ''), highlight: '', after: '' }
}

/**
 * Like splitHighlight, for text with several <span>…</span> parts. Returns the parts in order,
 * each marked as highlighted or not, for the template to render as text.
 *
 * @param {string} text Translated text with any number of <span>…</span>
 * @return {Array<{text: string, highlight: boolean}>}
 */
export function splitHighlights(text) {
	return text
		.split(/(<span>[\s\S]*?<\/span>)/)
		.filter((part) => part !== '')
		.map((part) => {
			const match = part.match(/^<span>([\s\S]*?)<\/span>$/)
			return match
				? { text: match[1], highlight: true }
				: { text: part.replace(/<[^>]*>/g, ''), highlight: false }
		})
}
