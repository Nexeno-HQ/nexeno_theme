<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCP\Util;

class VersionedFiles {
	private const BASE_MAJOR = 34;

	/**
	 * $base followed by its version-specific files (forBase()), in load order.
	 *
	 * @return list<string>
	 */
	public static function withBase(string $base, string $ext, ?int $major = null, ?string $dir = null): array {
		return [$base, ...self::forBase($base, $ext, $major, $dir)];
	}

	/**
	 * File names (without extension) of the version-specific files for $base that apply to this
	 * Nextcloud version, in load order. Files for versions below 34 fix older servers (that version
	 * and older); files for 34 and up fix newer servers (that version and newer).
	 *
	 * @param string $ext 'css' or 'js'; also the app folder the files are in.
	 * @param int|null $major Nextcloud major version; defaults to the running server (tests pass one).
	 * @param string|null $dir Folder to look in; defaults to the app's css/ or js/ folder (tests pass one).
	 * @return list<string>
	 */
	public static function forBase(string $base, string $ext, ?int $major = null, ?string $dir = null): array {
		$major ??= (int)Util::getVersion()[0];
		$dir ??= dirname(__DIR__, 2) . '/' . $ext;
		$found = [];

		// One folder scan per request instead of one per file: every page asks for about a dozen names.
		static $listings = [];
		$listings[$dir . '|' . $ext] ??= glob($dir . '/*-nc*.' . $ext) ?: [];

		foreach ($listings[$dir . '|' . $ext] as $file) {
			if (!str_starts_with(basename($file), $base . '-nc')
				|| preg_match('/-nc(\d+)\.' . preg_quote($ext, '/') . '$/', $file, $m) !== 1) {
				continue;
			}
			$version = (int)$m[1];
			if ($version < self::BASE_MAJOR ? $major <= $version : $version <= $major) {
				$found[$version] = basename($file, '.' . $ext);
			}
		}

		$major < self::BASE_MAJOR ? krsort($found) : ksort($found);
		return array_values($found);
	}
}
