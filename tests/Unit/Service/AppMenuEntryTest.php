<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Service;

use OCA\NexenoTheme\Service\AppMenuEntry;
use OCA\NexenoTheme\ThemeConfig;
use OCP\IAppConfig;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class AppMenuEntryTest extends TestCase {
	private function appConfigReturning(string $stored): IAppConfig {
		$appConfig = $this->createStub(IAppConfig::class);
		$appConfig->method('getValueString')->willReturnCallback(
			static fn (string $app, string $key, string $default): string => $stored === '' ? $default : $stored,
		);
		return $appConfig;
	}

	public static function storedValues(): array {
		return [
			'not set yet' => ['', true],
			'yes' => ['yes', true],
			'no' => ['no', false],
			'mistyped value stays shown' => ['off', true],
		];
	}

	#[DataProvider('storedValues')]
	public function testIsShown(string $stored, bool $expected): void {
		self::assertSame($expected, (new AppMenuEntry($this->appConfigReturning($stored)))->isShown());
	}

	public function testDefaultsToShown(): void {
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::once())->method('getValueString')
			->with(ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_APP_MENU, ThemeConfig::APP_MENU_SHOWN)
			->willReturnArgument(2);

		self::assertTrue((new AppMenuEntry($appConfig))->isShown());
	}

	public static function savedValues(): array {
		return [[true, 'yes'], [false, 'no']];
	}

	#[DataProvider('savedValues')]
	public function testSetShown(bool $enabled, string $expected): void {
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::once())->method('setValueString')
			->with(ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_APP_MENU, $expected)
			->willReturn(true);

		(new AppMenuEntry($appConfig))->setShown($enabled);
	}
}
