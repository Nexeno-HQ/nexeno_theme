<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Service;

use OCA\NexenoTheme\Service\LoginStyle;
use OCA\NexenoTheme\ThemeConfig;
use OCP\IAppConfig;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class LoginStyleTest extends TestCase {
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
			'mistyped value stays on' => ['off', true],
		];
	}

	#[DataProvider('storedValues')]
	public function testIsEnabled(string $stored, bool $expected): void {
		self::assertSame($expected, (new LoginStyle($this->appConfigReturning($stored)))->isEnabled());
	}

	public function testDefaultsToOn(): void {
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::once())->method('getValueString')
			->with(ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_LOGIN_STYLE, ThemeConfig::LOGIN_STYLE_ON)
			->willReturnArgument(2);

		self::assertTrue((new LoginStyle($appConfig))->isEnabled());
	}

	public static function savedValues(): array {
		return [[true, 'yes'], [false, 'no']];
	}

	#[DataProvider('savedValues')]
	public function testSetEnabled(bool $enabled, string $expected): void {
		$appConfig = $this->createMock(IAppConfig::class);
		$appConfig->expects(self::once())->method('setValueString')
			->with(ThemeConfig::APP_ID, ThemeConfig::APP_CONFIG_KEY_LOGIN_STYLE, $expected)
			->willReturn(true);

		(new LoginStyle($appConfig))->setEnabled($enabled);
	}
}
