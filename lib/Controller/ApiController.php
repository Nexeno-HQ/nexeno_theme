<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\Service\RatePrompt;
use OCA\NexenoTheme\ThemeConfig;
use OCP\App\IAppManager;
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
		private IAppManager $appManager,
		private RatePrompt $ratePrompt,
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
			'themeLastVariant' => $user === null ? ThemeConfig::DEFAULT_LAST_VARIANT : $this->userConfig->getValueString(
				$user->getUID(),
				ThemeConfig::APP_ID,
				ThemeConfig::CONFIG_KEY_LAST_VARIANT,
				ThemeConfig::DEFAULT_LAST_VARIANT,
			),
			// The installed version from appinfo/info.xml, so the overview page never shows a stale build-time number.
			'appVersion' => $this->appManager->getAppVersion(ThemeConfig::APP_ID),
			'ratePromptVisible' => $user !== null && $this->ratePrompt->isVisible($user->getUID()),
		];
		return new JSONResponse($payload);
	}
}
