/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const path = require('path')
const { DefinePlugin } = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const { name, version } = require('./package.json')

module.exports = {
	mode: 'production',
	entry: {
		main: path.join(__dirname, 'src', 'main.js'),
	},
	output: {
		path: path.join(__dirname, 'js', 'page'),
		filename: '[name].js',
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.vue'],
	},
	module: {
		rules: [
			{ test: /\.vue$/, loader: 'vue-loader' },
			{ test: /\.css$/, use: ['style-loader', 'css-loader'] },
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		new DefinePlugin({
			appName: JSON.stringify(name),
			appVersion: JSON.stringify(version),
		}),
	],
}
