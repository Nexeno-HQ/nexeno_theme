<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

return [
	'routes' => [
		['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
		['name' => 'api#status', 'url' => '/api/status', 'verb' => 'GET'],
		['name' => 'theme_settings#setVariant', 'url' => '/variant', 'verb' => 'PUT'],
	],
];
