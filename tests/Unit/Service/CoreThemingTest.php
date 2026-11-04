<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Service;

use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\IConfig;
use PHPUnit\Framework\TestCase;

final class CoreThemingTest extends TestCase {
	private function withEnabledThemes(string $raw): CoreTheming {
		$config = $this->createStub(IConfig::class);
		$config->method('getUserValue')->willReturnMap([
			['alice', 'theming', 'enabled-themes', '', $raw],
		]);
		return new CoreTheming($this->createStub(IUserConfig::class), $config);
	}

	public function testEnabledThemesDefaultsWhenUnset(): void {
		self::assertSame(['default'], $this->withEnabledThemes('')->enabledThemes('alice'));
	}

	public function testEnabledThemesDefaultsWhenInvalidOrEmpty(): void {
		self::assertSame(['default'], $this->withEnabledThemes('not json')->enabledThemes('alice'));
		self::assertSame(['default'], $this->withEnabledThemes('[]')->enabledThemes('alice'));
		self::assertSame(['default'], $this->withEnabledThemes('"dark"')->enabledThemes('alice'));
	}

	public function testEnabledThemesReadsUserChoice(): void {
		self::assertSame(['dark', 'opendyslexic'], $this->withEnabledThemes('["dark","opendyslexic"]')->enabledThemes('alice'));
	}

	public function testBodyThemesReplacesUserThemesWithVariant(): void {
		self::assertSame(['light'], $this->withEnabledThemes('["dark-highcontrast"]')->bodyThemes('alice', 'light'));
	}

	public function testBodyThemesKeepsOpenDyslexicFont(): void {
		self::assertSame(['dark', 'opendyslexic'], $this->withEnabledThemes('["light","opendyslexic"]')->bodyThemes('alice', 'dark'));
	}

	public function testBodyThemesWhenOffReturnsUserThemesUnchanged(): void {
		self::assertSame(['dark', 'opendyslexic'], $this->withEnabledThemes('["dark","opendyslexic"]')->bodyThemes('alice', 'off'));
	}

	public function testRestoreBackupDoesNothingWithoutBackup(): void {
		$userConfig = $this->createMock(IUserConfig::class);
		$userConfig->expects(self::once())->method('getValueBool')
			->with('alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKED_UP, false)
			->willReturn(false);
		$userConfig->expects(self::never())->method('deleteUserConfig');
		$config = $this->createMock(IConfig::class);
		$config->expects(self::never())->method('setUserValue');
		$config->expects(self::never())->method('deleteUserValue');

		(new CoreTheming($userConfig, $config))->restoreBackup('alice');
	}

	public function testRestoreBackupPutsBackOldValuesAndClearsBackup(): void {
		$userConfig = $this->createMock(IUserConfig::class);
		$userConfig->method('getValueBool')->willReturn(true);
		$userConfig->method('getValueString')->willReturnMap([
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKUP_IMAGE, '', false, 'custom.jpg'],
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKUP_COLOR, '', false, ''],
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKUP_PRIMARY, '', false, '#00679e'],
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_BG_BACKUP_THEMES, '', false, '["dark"]'],
		]);
		$config = $this->createMock(IConfig::class);
		$config->method('getUserValue')->willReturnMap([['alice', 'theming', 'userCacheBuster', '0', '4']]);

		$set = [];
		$config->method('setUserValue')->willReturnCallback(
			static function (string $user, string $app, string $key, string $value) use (&$set): void {
				$set[$app . '/' . $key] = $value;
			},
		);
		$config->expects(self::once())->method('deleteUserValue')
			->with('alice', 'theming', 'background_color');
		$deleted = [];
		$userConfig->expects(self::exactly(5))->method('deleteUserConfig')->willReturnCallback(
			static function (string $user, string $app, string $key) use (&$deleted): void {
				$deleted[] = $key;
			},
		);

		(new CoreTheming($userConfig, $config))->restoreBackup('alice');

		self::assertSame([
			'theming/background_image' => 'custom.jpg',
			'theming/primary_color' => '#00679e',
			'theming/enabled-themes' => '["dark"]',
			'theming/userCacheBuster' => '5',
		], $set);
		self::assertSame([
			ThemeConfig::CONFIG_KEY_BG_BACKUP_IMAGE,
			ThemeConfig::CONFIG_KEY_BG_BACKUP_COLOR,
			ThemeConfig::CONFIG_KEY_BG_BACKUP_PRIMARY,
			ThemeConfig::CONFIG_KEY_BG_BACKUP_THEMES,
			ThemeConfig::CONFIG_KEY_BG_BACKED_UP,
		], $deleted);
	}
}
