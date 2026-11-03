<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\AppInfo;

use OCA\NexenoTheme\Listener\BeforeLoginTemplateRenderedListener;
use OCA\NexenoTheme\Listener\BeforeTemplateRenderedListener;
use OCA\NexenoTheme\UserMigration\VariantMigrator;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\AppFramework\Http\Events\BeforeLoginTemplateRenderedEvent;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\INavigationManager;
use OCP\IURLGenerator;
use OCP\IUserSession;

class Application extends App implements IBootstrap {
	public const APP_ID = 'nexeno_theme';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}

	public function register(IRegistrationContext $context): void {
		$context->registerEventListener(
			BeforeTemplateRenderedEvent::class,
			BeforeTemplateRenderedListener::class,
		);
		$context->registerEventListener(
			BeforeLoginTemplateRenderedEvent::class,
			BeforeLoginTemplateRenderedListener::class,
		);
		$context->registerUserMigrator(VariantMigrator::class);
	}

	public function boot(IBootContext $context): void {
		$context->injectFn(\Closure::fromCallable([$this, 'registerNavigation']));
	}

	private function registerNavigation(
		INavigationManager $navigationManager,
		IUserSession $userSession,
		IURLGenerator $urlGenerator,
	): void {
		if ($userSession->getUser() === null) {
			return;
		}

		$navigationManager->add(static function () use ($urlGenerator): array {
			return [
				'id' => self::APP_ID,
				'order' => 10,
				'type' => 'link',
				'href' => $urlGenerator->linkToRoute(self::APP_ID . '.page.index'),
				'icon' => $urlGenerator->imagePath(self::APP_ID, 'app.svg'),
				'name' => 'Nexeno',
			];
		});
	}
}
