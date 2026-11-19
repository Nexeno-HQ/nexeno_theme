<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\Service\LoginStyle;
use OCA\NexenoTheme\Service\RatePrompt;
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
	public function __construct(
		string $appName,
		IRequest $request,
		private IUserConfig $userConfig,
		private CoreTheming $coreTheming,
		private IUserSession $userSession,
		private IL10N $l,
		private LoginStyle $loginStyle,
		private RatePrompt $ratePrompt,
	) {
		parent::__construct($appName, $request);
	}

	#[NoAdminRequired]
	public function setVariant(string $variant): JSONResponse {
		$user = $this->userSession->getUser();
		if ($user === null) {
			return new JSONResponse(['message' => $this->l->t('Not logged in')], Http::STATUS_UNAUTHORIZED);
		}
		if (!in_array($variant, ThemeConfig::VARIANTS, true)) {
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

	/**
	 * Stores the user's answer to the "Rate this app" popup: "later", "never" or "rated".
	 */
	#[NoAdminRequired]
	public function answerRatePrompt(string $action): JSONResponse {
		$user = $this->userSession->getUser();
		if ($user === null) {
			return new JSONResponse(['message' => $this->l->t('Not logged in')], Http::STATUS_UNAUTHORIZED);
		}
		if (!in_array($action, ThemeConfig::RATE_PROMPT_ACTIONS, true)) {
			return new JSONResponse(['message' => $this->l->t('Invalid action')], Http::STATUS_BAD_REQUEST);
		}
		$this->ratePrompt->answer($user->getUID(), $action);
		return new JSONResponse(['visible' => false]);
	}

	/**
	 * Turns the Nexeno look on the login page on or off for the whole instance.
	 * Admin only: without #[NoAdminRequired], Nextcloud refuses the request for everyone else.
	 */
	public function setLoginStyle(bool $enabled): JSONResponse {
		$this->loginStyle->setEnabled($enabled);
		return new JSONResponse(['enabled' => $enabled]);
	}
}
