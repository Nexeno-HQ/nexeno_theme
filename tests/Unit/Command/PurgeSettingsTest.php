<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Command;

use OCA\NexenoTheme\Command\PurgeSettings;
use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\ThemeConfig;
use OCP\Config\IUserConfig;
use OCP\IAppConfig;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

final class PurgeSettingsTest extends TestCase {
	public function testWithoutForceErasesNothing(): void {
		$userConfig = $this->createMock(IUserConfig::class);
		$userConfig->expects(self::never())->method('deleteApp');
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::never())->method('deleteKey');
		$coreTheming = $this->createMock(CoreTheming::class);
		$coreTheming->expects(self::never())->method('restoreAllBackups');

		$tester = new CommandTester(new PurgeSettings($userConfig, $appConfig, $coreTheming));

		self::assertSame(Command::FAILURE, $tester->execute([]));
		self::assertStringContainsString('--force', $tester->getDisplay());
	}

	public function testRestoresBackupsThenErasesTheThemeKeysOnly(): void {
		$calls = [];
		$userConfig = $this->createMock(IUserConfig::class);
		$userConfig->expects(self::once())->method('deleteApp')->with(ThemeConfig::APP_ID)
			->willReturnCallback(function () use (&$calls): void {
				$calls[] = 'erase user settings';
			});
		$coreTheming = $this->createMock(CoreTheming::class);
		$coreTheming->expects(self::once())->method('restoreAllBackups')->willReturnCallback(function () use (&$calls): int {
			$calls[] = 'restore backups';
			return 2;
		});
		$deletedKeys = [];
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::exactly(4))->method('deleteKey')->willReturnCallback(function (string $app, string $key) use (&$deletedKeys): void {
			$deletedKeys[] = $app . '/' . $key;
		});

		$tester = new CommandTester(new PurgeSettings($userConfig, $appConfig, $coreTheming));

		self::assertSame(Command::SUCCESS, $tester->execute(['--force' => true]));
		// Backups go back before the settings holding them are erased.
		self::assertSame(['restore backups', 'erase user settings'], $calls);
		// Nextcloud's own keys (enabled, installed_version) stay, so the app is not left half-installed.
		self::assertSame([
			'nexeno_theme/login_style',
			'nexeno_theme/app_menu',
			'nexeno_theme/organisation_colour',
			'nexeno_theme/installed_at',
		], $deletedKeys);
		self::assertStringContainsString('2 user(s)', $tester->getDisplay());
	}
}
