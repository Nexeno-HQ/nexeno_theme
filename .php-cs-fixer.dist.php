<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

require_once './vendor/autoload.php';

use Nextcloud\CodingStandard\Config;

$config = new Config();
$config
	->getFinder()
	->notPath('build')
	->notPath('css')
	->notPath('img')
	->notPath('js')
	->notPath('l10n')
	->notPath('node_modules')
	->notPath('scss')
	->notPath('src')
	->notPath('vendor')
	->in(__DIR__);

return $config;
