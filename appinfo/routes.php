<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

return [
	'routes' => [
		['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
		// Serves the same page so a reload or direct link to /nexeno-project reaches the Vue router.
		['name' => 'page#index', 'url' => '/nexeno-project', 'verb' => 'GET', 'postfix' => 'nexeno_project'],
		['name' => 'api#status', 'url' => '/api/status', 'verb' => 'GET'],
		['name' => 'theme_settings#setVariant', 'url' => '/variant', 'verb' => 'PUT'],
		// Every user: their answer to the "Rate this app" popup.
		['name' => 'theme_settings#answerRatePrompt', 'url' => '/rate-prompt', 'verb' => 'PUT'],
		// Admin only: the Nexeno look on the login page, for the whole instance.
		['name' => 'theme_settings#setLoginStyle', 'url' => '/login-style', 'verb' => 'PUT'],
	],
];
