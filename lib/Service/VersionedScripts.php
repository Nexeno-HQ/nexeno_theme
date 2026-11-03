<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCP\Util;

class VersionedScripts {
	private const JS_DIR = __DIR__ . '/../../js';
	private const BASE_MAJOR = 34;

	public static function forBase(string $base): array {
		$major = (int)Util::getVersion()[0];
		$found = [];

		foreach (glob(self::JS_DIR . '/' . $base . '-nc*.js') ?: [] as $file) {
			if (preg_match('/-nc(\d+)\.js$/', $file, $m) !== 1) {
				continue;
			}
			$version = (int)$m[1];
			if ($version < self::BASE_MAJOR ? $major <= $version : $version <= $major) {
				$found[$version] = basename($file, '.js');
			}
		}

		$major < self::BASE_MAJOR ? krsort($found) : ksort($found);
		return array_values($found);
	}
}
