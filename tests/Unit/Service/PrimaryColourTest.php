<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Service;

use OCA\NexenoTheme\Service\PrimaryColour;
use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\Defaults;
use OCP\IAppConfig;
use PHPUnit\Framework\TestCase;

final class PrimaryColourTest extends TestCase {
	/**
	 * @param string $own What the user saved in Personal settings → Appearance.
	 * @param string $shown What Nextcloud shows the user (Defaults::getColorPrimary()).
	 * @param string $server The server's colour (Defaults::getDefaultColorPrimary()): the admin's, or the stock blue.
	 * @param string $organisation What the admin saved in Administration settings → Theming.
	 * @param string $organisationSwitch The stored organisation_colour value; empty when never set.
	 */
	private function forUser(string $own, string $shown, string $server = '#00679e', string $organisation = '', string $organisationSwitch = ''): ?array {
		return $this->primaryColour($own, $shown, $server, $organisation, $organisationSwitch)->forUser('alice');
	}

	private function primaryColour(string $own = '', string $shown = '#00679e', string $server = '#00679e', string $organisation = '', string $organisationSwitch = ''): PrimaryColour {
		$userConfig = $this->createStub(IUserConfig::class);
		$userConfig->method('getValueString')->willReturnCallback(
			static fn (string $userId, string $app, string $key): string => [$userId, $app, $key] === ['alice', 'theming', 'primary_color'] ? $own : '',
		);
		$appConfig = $this->createStub(IAppConfig::class);
		$appConfig->method('getValueString')->willReturnCallback(
			static fn (string $app, string $key, string $default = ''): string => match ([$app, $key]) {
				['theming', 'primary_color'] => $organisation,
				[ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_ORGANISATION_COLOUR] => $organisationSwitch === '' ? $default : $organisationSwitch,
				default => $default,
			},
		);
		$defaults = $this->createStub(Defaults::class);
		$defaults->method('getColorPrimary')->willReturn($shown);
		$defaults->method('getDefaultColorPrimary')->willReturn($server);

		return new PrimaryColour($userConfig, $appConfig, $defaults);
	}

	public function testNoColourKeepsTheNexenoBlue(): void {
		self::assertNull($this->forUser('', '#00679e'));
	}

	public function testServerColourSavedAgainIsNotTheUsersOwn(): void {
		self::assertNull($this->forUser('#00679E', '#00679e'));
	}

	public function testColourNextcloudDoesNotShowIsIgnored(): void {
		// User theming disabled by the admin: Nextcloud shows the server colour, not the stored one.
		self::assertNull($this->forUser('#c0392b', '#00679e'));
	}

	public function testOwnColourIsMadeReadableForEachVariant(): void {
		self::assertSame(['light' => '#c0392b', 'dark' => '#cd6155'], $this->forUser('#C0392B', '#c0392b'));
	}

	public function testOrganisationColourIsOffByDefault(): void {
		// The admin set a brand colour but never turned the switch on: existing installs stay blue.
		self::assertNull($this->forUser('', '#c0392b', '#c0392b', '#c0392b'));
		self::assertFalse($this->primaryColour()->isOrganisationColourEnabled());
	}

	public function testOrganisationColourWhenTheUserPickedNone(): void {
		self::assertSame(['light' => '#c0392b', 'dark' => '#cd6155'], $this->forUser('', '#c0392b', '#c0392b', '#C0392B', 'yes'));
	}

	public function testOrganisationColourWhenUserThemingIsOff(): void {
		// The user's old pick is hidden by Nextcloud, so everyone gets the organisation's colour.
		self::assertSame(['light' => '#c0392b', 'dark' => '#cd6155'], $this->forUser('#16a085', '#c0392b', '#c0392b', '#c0392b', 'yes'));
	}

	public function testUsersOwnColourComesBeforeTheOrganisations(): void {
		// The user's green, darkened until it reads on white; not the organisation's red.
		self::assertSame('#12806a', $this->forUser('#16a085', '#16a085', '#c0392b', '#c0392b', 'yes')['light']);
	}

	public function testNoOrganisationColourKeepsTheNexenoBlue(): void {
		// Switch on, but the admin never set a colour: Defaults would answer with the stock blue, which must not count.
		self::assertNull($this->forUser('', '#00679e', '#00679e', '', 'yes'));
	}

	public function testMistypedSwitchValueCountsAsOff(): void {
		self::assertNull($this->forUser('', '#c0392b', '#c0392b', '#c0392b', 'on'));
	}

	public function testSetOrganisationColourEnabled(): void {
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::exactly(2))->method('setValueString')
			->willReturnCallback(static function (string $app, string $key, string $value): bool {
				self::assertSame([ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_ORGANISATION_COLOUR], [$app, $key]);
				self::assertContains($value, ['yes', 'no']);
				return true;
			});
		$primaryColour = new PrimaryColour($this->createStub(IUserConfig::class), $appConfig, $this->createStub(Defaults::class));

		$primaryColour->setOrganisationColourEnabled(true);
		$primaryColour->setOrganisationColourEnabled(false);
	}

	public function testShortHexIsSpelledOut(): void {
		self::assertSame('#112233', PrimaryColour::fullHex(' #123 '));
		self::assertSame('', PrimaryColour::fullHex('red'));
	}

	public function testReadableKeepsAColourThatAlreadyReads(): void {
		// The Nexeno blue reads on white, and its dark counterpart on the dark surface.
		self::assertSame('#2563eb', PrimaryColour::readable('#2563eb', '#ffffff', '#000000'));
		self::assertSame('#60a5fa', PrimaryColour::readable('#60a5fa', '#1a1a1a', '#ffffff'));
	}

	public function testReadableDarkensALightColourOnWhite(): void {
		// Yellow is unreadable as text on white, so it is darkened.
		self::assertSame('#737300', PrimaryColour::readable('#ffff00', '#ffffff', '#000000'));
	}

	public function testReadableLightensADarkColourOnTheDarkSurface(): void {
		// Navy disappears on #1a1a1a, so it is lightened.
		self::assertSame('#7a88a6', PrimaryColour::readable('#0e275e', '#1a1a1a', '#ffffff'));
	}
}
