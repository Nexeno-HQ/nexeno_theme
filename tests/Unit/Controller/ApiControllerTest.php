<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Controller;

use OCA\NexenoTheme\Controller\ApiController;
use OCA\NexenoTheme\Service\RatePrompt;
use OCA\NexenoTheme\ThemeConfig;
use OCP\App\IAppManager;
use OCP\Config\IUserConfig;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserSession;
use PHPUnit\Framework\TestCase;

final class ApiControllerTest extends TestCase {
	private function appManager(): IAppManager {
		$appManager = $this->createStub(IAppManager::class);
		$appManager->method('getAppVersion')->willReturn('1.1.0');
		return $appManager;
	}

	public function testStatusReturnsTheUsersSettings(): void {
		$user = $this->createStub(IUser::class);
		$user->method('getUID')->willReturn('alice');
		$session = $this->createStub(IUserSession::class);
		$session->method('getUser')->willReturn($user);
		$config = $this->createStub(IUserConfig::class);
		$config->method('getValueString')->willReturnMap([
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_VARIANT, 'off', false, 'dark'],
			['alice', ThemeConfig::APP_ID, ThemeConfig::CONFIG_KEY_LAST_VARIANT, 'system', false, 'dark'],
		]);

		$ratePrompt = $this->createStub(RatePrompt::class);
		$ratePrompt->method('isVisible')->willReturn(true);

		$controller = new ApiController(ThemeConfig::APP_ID, $this->createStub(IRequest::class), $session, $config, $this->appManager(), $ratePrompt);

		self::assertSame(['themeVariant' => 'dark', 'themeLastVariant' => 'dark', 'appVersion' => '1.1.0', 'ratePromptVisible' => true], $controller->status()->getData());
	}

	public function testStatusDefaultsWithoutUser(): void {
		$session = $this->createStub(IUserSession::class);
		$session->method('getUser')->willReturn(null);

		$controller = new ApiController(ThemeConfig::APP_ID, $this->createStub(IRequest::class), $session, $this->createStub(IUserConfig::class), $this->appManager(), $this->createStub(RatePrompt::class));

		self::assertSame(['themeVariant' => 'off', 'themeLastVariant' => 'system', 'appVersion' => '1.1.0', 'ratePromptVisible' => false], $controller->status()->getData());
	}
}
