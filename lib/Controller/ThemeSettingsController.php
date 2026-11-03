<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Config\IUserConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUserSession;

class ThemeSettingsController extends Controller {
	private const VARIANTS = ['off', 'light', 'dark'];

	public function __construct(
		string $appName,
		IRequest $request,
		private IUserConfig $userConfig,
		private CoreTheming $coreTheming,
		private IUserSession $userSession,
		private IL10N $l,
	) {
		parent::__construct($appName, $request);
	}

	#[NoAdminRequired]
	public function setVariant(string $variant): JSONResponse {
		$user = $this->userSession->getUser();
		if ($user === null) {
			return new JSONResponse(['message' => $this->l->t('Not logged in')], Http::STATUS_UNAUTHORIZED);
		}
		if (!in_array($variant, self::VARIANTS, true)) {
			return new JSONResponse(['message' => $this->l->t('Invalid variant')], Http::STATUS_BAD_REQUEST);
		}
		$userId = $user->getUID();
		$this->coreTheming->restoreBackup($userId);

		if ($variant !== 'off') {
			$this->userConfig->setValueString($userId, ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, $variant);
		}

		$this->userConfig->setValueString(
			$userId,
			ThemeConfig::APP_ID,
			ThemeConfig::CONFIG_KEY_VARIANT,
			$variant,
		);

		return new JSONResponse([
			'variant' => $variant,
			'enabledThemes' => $this->coreTheming->bodyThemes($userId, $variant),
		]);
	}
}
