<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Service;

use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\Defaults;
use OCP\IAppConfig;

/**
 * The colour the Nexeno theme shows in place of its own blue:
 * 1. the colour a user picked for themselves in Personal settings → Appearance, or else
 * 2. the organisation's colour from Administration settings → Theming, when an admin turned that on.
 * Without either the theme keeps the Nexeno blue. The organisation's colour is off by default, so existing
 * installs stay blue, as nexeno_project's AppearancePreference::hasOwnNextcloudColour() does.
 */
class PrimaryColour {
	/** Contrast normal text needs on its background (WCAG AA). */
	private const TEXT_CONTRAST = 4.5;
	/** The light variant's page background (white) and the dark variant's surface (colour-background in _themes.scss). */
	private const LIGHT_BACKGROUND = '#ffffff';
	private const DARK_BACKGROUND = '#1a1a1a';
	/** Where Nextcloud's theming app stores a primary colour, for a user and for the whole server. */
	private const THEMING_KEY_PRIMARY_COLOUR = 'primary_color';

	public function __construct(
		private IUserConfig $userConfig,
		private IAppConfig $appConfig,
		private Defaults $defaults,
	) {
	}

	/**
	 * The colour to show made readable for each variant, or null to keep the Nexeno blue.
	 *
	 * @return array{light: string, dark: string}|null #rrggbb colours
	 */
	public function forUser(string $userId): ?array {
		$colour = $this->userColour($userId);
		if ($colour === '' && $this->isOrganisationColourEnabled()) {
			$colour = $this->organisationColour();
		}
		if ($colour === '') {
			return null;
		}

		return [
			'light' => self::readable($colour, self::LIGHT_BACKGROUND, '#000000'),
			'dark' => self::readable($colour, self::DARK_BACKGROUND, '#ffffff'),
		];
	}

	/**
	 * Anything other than an explicit "yes" counts as off, so a mistyped occ value keeps the Nexeno blue.
	 */
	public function isOrganisationColourEnabled(): bool {
		return $this->appConfig->getValueString(
			ThemeConfig::APP_ID,
			ThemeConfig::APP_CONFIG_KEY_ORGANISATION_COLOUR,
			ThemeConfig::ORGANISATION_COLOUR_OFF,
		) === ThemeConfig::ORGANISATION_COLOUR_ON;
	}

	public function setOrganisationColourEnabled(bool $enabled): void {
		$this->appConfig->setValueString(
			ThemeConfig::APP_ID,
			ThemeConfig::APP_CONFIG_KEY_ORGANISATION_COLOUR,
			$enabled ? ThemeConfig::ORGANISATION_COLOUR_ON : ThemeConfig::ORGANISATION_COLOUR_OFF,
		);
	}

	/**
	 * The colour the user picked for themselves, or empty when there is none.
	 */
	private function userColour(string $userId): string {
		$pickedColour = self::fullHex($this->userConfig->getValueString(
			$userId,
			ThemeConfig::THEMING_APP_ID,
			self::THEMING_KEY_PRIMARY_COLOUR,
		));
		// Nextcloud ignores it while the admin has turned user theming off.
		$isShownByNextcloud = $pickedColour === self::fullHex($this->defaults->getColorPrimary());
		// getDefaultColorPrimary() is the server's colour: the same value saved again is not the user's choice.
		$isServerColour = $pickedColour === self::fullHex($this->defaults->getDefaultColorPrimary());

		return $isShownByNextcloud && !$isServerColour ? $pickedColour : '';
	}

	/**
	 * The colour an admin set in Administration settings → Theming, or empty when none is set.
	 * Read from the theming app itself, because Defaults falls back to Nextcloud's stock blue when there is none.
	 */
	private function organisationColour(): string {
		return self::fullHex($this->appConfig->getValueString(
			ThemeConfig::THEMING_APP_ID,
			self::THEMING_KEY_PRIMARY_COLOUR,
		));
	}

	/**
	 * The colour mixed step by step towards black (light) or white (dark) until it reads as text on the
	 * background. Its text colour then reads on it too: white in light, black in dark. A colour that already
	 * reads is unchanged, as with the Nexeno blue (#2563eb light) and its dark counterpart.
	 */
	public static function readable(string $hex, string $background, string $towards): string {
		$from = self::channels($hex);
		$to = self::channels($towards);
		$backgroundLuminance = self::luminance(self::channels($background));
		for ($step = 0; $step <= 20; $step++) {
			$share = (float)$step / 20.0;
			$mixed = array_map(
				static fn (int $fromChannel, int $toChannel): int => (int)round((float)$fromChannel + (float)($toChannel - $fromChannel) * $share),
				$from,
				$to,
			);
			$luminance = self::luminance($mixed);
			$contrast = (max($luminance, $backgroundLuminance) + 0.05) / (min($luminance, $backgroundLuminance) + 0.05);
			if ($contrast >= self::TEXT_CONTRAST) {
				return vsprintf('#%02x%02x%02x', $mixed);
			}
		}

		return strtolower($towards);
	}

	/**
	 * A colour as lower-case #rrggbb (#rgb is spelled out), or empty when it is not one.
	 */
	public static function fullHex(string $colour): string {
		$colour = strtolower(trim($colour));
		if (preg_match('/^#[0-9a-f]{3}$/', $colour) === 1) {
			$colour = '#' . $colour[1] . $colour[1] . $colour[2] . $colour[2] . $colour[3] . $colour[3];
		}

		return preg_match('/^#[0-9a-f]{6}$/', $colour) === 1 ? $colour : '';
	}

	/**
	 * @return list<int> red, green, blue from 0 to 255
	 */
	private static function channels(string $hex): array {
		return array_map(static fn (string $pair): int => (int)hexdec($pair), str_split(substr($hex, 1), 2));
	}

	/**
	 * WCAG relative luminance, from 0 (black) to 1 (white).
	 *
	 * @param list<int> $channels
	 */
	private static function luminance(array $channels): float {
		[$red, $green, $blue] = array_map(static function (int $channel): float {
			$value = (float)$channel / 255.0;
			return $value <= 0.03928 ? $value / 12.92 : (($value + 0.055) / 1.055) ** 2.4;
		}, $channels);

		return 0.2126 * $red + 0.7152 * $green + 0.0722 * $blue;
	}
}
