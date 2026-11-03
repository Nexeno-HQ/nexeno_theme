<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Config\IUserConfig;
use OCP\IRequest;
use OCP\IUserSession;

class ApiController extends Controller {
	public function __construct(
		string $appName,
		IRequest $request,
		private IUserSession $userSession,
		private IUserConfig $userConfig,
	) {
		parent::__construct($appName, $request);
	}

	#[NoAdminRequired]
	#[NoCSRFRequired]
	public function status(): JSONResponse {
		$user = $this->userSession->getUser();
		$payload = [
			'themeVariant' => $user === null ? 'off' : $this->userConfig->getValueString(
				$user->getUID(),
				ThemeConfig::APP_ID,
				ThemeConfig::CONFIG_KEY_VARIANT,
				'off',
			),
			'themeLastVariant' => $user === null ? 'light' : $this->userConfig->getValueString(
				$user->getUID(),
				ThemeConfig::APP_ID,
				ThemeConfig::CONFIG_KEY_LAST_VARIANT,
				'light',
			),
		];
		return new JSONResponse($payload);
	}
}
