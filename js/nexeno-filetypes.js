/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * One rule for the file-type class the stylesheets use for a file's icon, shared by nexeno-files.js,
 * nexeno-modal.js and nexeno-favorites.js, so a file looks the same in Files, the file picker and the
 * Dashboard. Loaded before them (BeforeTemplateRenderedListener::THEME_SCRIPTS).
 */
(function() {
	'use strict'

	const IMAGE_EXT = ['jpg', 'jpeg', 'jpe', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tif', 'tiff', 'heic', 'heif', 'avif', 'psd', 'ai', 'eps']
	const VIDEO_EXT = ['mp4', 'm4v', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'flv', 'mpg', 'mpeg', 'ogv']
	const GROUPED = {}
	IMAGE_EXT.forEach(function(ext) {
		GROUPED[ext] = 'image'
	})
	VIDEO_EXT.forEach(function(ext) {
		GROUPED[ext] = 'video'
	})

	// Files in the trash bin end in ".d<deletion time>", e.g. "photo.jpg.d1712345678".
	const TRASHBIN_SUFFIX = /\.d\d+$/

	/**
	 * @param {string} name File name.
	 * @return {string} 'image', 'video', the lower-case extension, or 'file'.
	 */
	window.nexenoFileType = function(name) {
		name = String(name || '').replace(TRASHBIN_SUFFIX, '')
		const dot = name.lastIndexOf('.')
		if (dot <= 0 || dot === name.length - 1) {
			return 'file'
		}
		const ext = name.slice(dot + 1).toLowerCase()
		if (GROUPED[ext]) {
			return GROUPED[ext]
		}
		return /^[a-z0-9][a-z0-9-]*$/.test(ext) ? ext : 'file'
	}
})()
