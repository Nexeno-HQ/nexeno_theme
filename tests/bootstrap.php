<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Unit tests run without a Nextcloud server: the app's classes come from composer, and the
// public Nextcloud API (OCP, NCU) from the nextcloud/ocp dev package, which has no autoloader.
require_once __DIR__ . '/../vendor/autoload.php';

spl_autoload_register(static function (string $class): void {
	foreach (['OCP\\', 'NCU\\'] as $prefix) {
		if (str_starts_with($class, $prefix)) {
			$file = __DIR__ . '/../vendor/nextcloud/ocp/' . str_replace('\\', '/', $class) . '.php';
			if (is_file($file)) {
				require_once $file;
			}
			return;
		}
	}
});
