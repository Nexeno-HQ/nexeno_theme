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

	public static function forBase(string $base): array {
		$major = (int)Util::getVersion()[0];
		$found = [];

		foreach (glob(self::CSS_DIR . '/' . $base . '-nc*.css') ?: [] as $file) {
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
