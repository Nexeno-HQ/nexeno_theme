/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { recommended } from '@nextcloud/eslint-config'

export default [
	{
		// js/page/ is the webpack bundle; the other files in js/ are hand-written and are checked.
		ignores: ['js/page/**', 'css/**', 'l10n/**', 'vendor/**', 'build/**', 'node_modules/**'],
	},
	...recommended,
	{
		// The Nextcloud preset ignores all of js/ (usually build output); here only js/page/ is built.
		ignores: ['!js/', 'js/page/'],
	},
	{
		rules: {
			'jsdoc/require-jsdoc': 'off',
			'jsdoc/require-param-description': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/check-param-names': 'off',
			'jsdoc/no-undefined-types': 'off',
			'jsdoc/require-property-description': 'off',
			'vue/multi-word-component-names': 'off',
		},
	},
	{
		// Defined at build time by webpack's DefinePlugin.
		files: ['src/**'],
		languageOptions: {
			globals: {
				appName: 'readonly',
				appVersion: 'readonly',
			},
		},
	},
	{
		// Plain browser scripts loaded by Nextcloud with Util::addScript, not modules.
		files: ['js/*.js'],
		languageOptions: {
			sourceType: 'script',
			globals: {
				OC: 'readonly',
				t: 'readonly',
			},
		},
	},
	{
		files: ['scripts/**/*.js', 'webpack.config.js'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				__dirname: 'readonly',
				module: 'writable',
				process: 'readonly',
				require: 'readonly',
			},
		},
		rules: {
			'no-console': 'off',
		},
	},
]
