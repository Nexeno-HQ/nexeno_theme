<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\Service\AppMenuEntry;
use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\Service\LoginStyle;
use OCA\NexenoTheme\Service\PrimaryColour;
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
		private PrimaryColour $primaryColour,
		private AppMenuEntry $appMenuEntry,
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
			// The user's own Nextcloud themes, so the overview page can tell nexeno-state.js after it turned
			// Nextcloud's high contrast off.
			'userThemes' => $this->coreTheming->enabledThemes($userId),
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

	/**
	 * Shows or hides the "Nexeno Theme" entry in the app menu for everyone. Admin only, like setLoginStyle().
	 */
	public function setAppMenu(bool $enabled): JSONResponse {
		$this->appMenuEntry->setShown($enabled);
		return new JSONResponse(['enabled' => $enabled]);
	}

	/**
	 * Turns the organisation's colour (Administration settings → Theming) on or off for everyone using the theme.
	 * Admin only, like setLoginStyle().
	 */
	public function setOrganisationColour(bool $enabled): JSONResponse {
		$this->primaryColour->setOrganisationColourEnabled($enabled);
		return new JSONResponse(['enabled' => $enabled]);
	}
}
