<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCP\Util;

class VersionedStyles {
	private const CSS_DIR = __DIR__ . '/../../css';
	private const BASE_MAJOR = 34;

	/**
	 * File names (without extension) of the version-specific files for $base that apply to this
	 * Nextcloud version, in load order.
	 *
	 * @param int|null $major Nextcloud major version; defaults to the running server (tests pass one).
	 * @param string|null $dir Folder to look in; defaults to the app's css/ folder (tests pass one).
	 * @return list<string>
	 */
	public static function forBase(string $base, ?int $major = null, ?string $dir = null): array {
		$major ??= (int)Util::getVersion()[0];
		$dir ??= self::CSS_DIR;
		$found = [];

		foreach (glob($dir . '/' . $base . '-nc*.css') ?: [] as $file) {
			if (preg_match('/-nc(\d+)\.css$/', $file, $m) !== 1) {
				continue;
			}
			$version = (int)$m[1];
			if ($version < self::BASE_MAJOR ? $major <= $version : $version <= $major) {
				$found[$version] = basename($file, '.css');
			}
		}

		$major < self::BASE_MAJOR ? krsort($found) : ksort($found);
		return array_values($found);
	}
}
