/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// A theme overrides Nextcloud's own styles, so !important, IDs and deep selectors
// are part of the job. These rules start mild; tighten them as the SCSS is cleaned up.
export default {
	extends: '@nextcloud/stylelint-config',
	ignoreFiles: ['css/**', 'build/**', 'node_modules/**', 'js/**'],
	rules: {
		'selector-class-pattern': null,
		'selector-id-pattern': null,
		'declaration-no-important': null,
		'no-descending-specificity': null,
		'no-duplicate-selectors': true,
	},
	overrides: [
		{
			// Colours belong only in the theme variables.
			files: ['scss/**/*.scss'],
			rules: {
				'color-no-hex': true,
			},
		},
		{
			files: ['scss/_themes.scss', 'scss/_variables.scss'],
			rules: {
				'color-no-hex': null,
			},
		},
	],
}
