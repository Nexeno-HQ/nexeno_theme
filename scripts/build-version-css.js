/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Builds the per-Nextcloud-version stylesheets:
 *
 *   scss/nexeno-theme-v35.scss → css/nexeno-theme-nc35.css
 *   scss/nexeno-login-v36.scss → css/nexeno-login-nc36.css
 *
 * Output goes straight into css/ so relative url()s resolve the same as in the
 * base stylesheets, and so lib/Service/VersionedStyles.php finds them. Every
 * <base>-v<major>.scss entry in scss/ is picked up, so a new release
 * needs no change here.
 *
 * Usage: node scripts/build-version-css.js [--watch]
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const root = path.join(__dirname, '..')
const scssDir = path.join(root, 'scss')
const watch = process.argv.includes('--watch')

const pairs = []
for (const file of fs.readdirSync(scssDir)) {
	const match = /^([a-z-]+)-v(\d+)\.scss$/.exec(file)
	if (!match) {
		continue
	}
	const src = path.join('scss', file)
	const dest = path.join('css', `${match[1]}-nc${match[2]}.css`)
	pairs.push(`${src}:${dest}`)
}

if (pairs.length === 0) {
	console.log('No version stylesheets to build.')
	process.exit(0)
}

const args = watch
	? ['--no-source-map', '--style=expanded', '--watch', ...pairs]
	: ['--no-source-map', '--style=compressed', ...pairs]

const result = spawnSync(path.join(root, 'node_modules', '.bin', 'sass'), args, { cwd: root, stdio: 'inherit' })
process.exit(result.status ?? 1)
