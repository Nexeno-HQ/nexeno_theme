<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Listener;

use OCA\NexenoTheme\Service\VersionedStyles;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Http\Events\BeforeLoginTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class BeforeLoginTemplateRenderedListener implements IEventListener {
	public function handle(Event $event): void {
		if (!($event instanceof BeforeLoginTemplateRenderedEvent)) {
			return;
		}

		Util::addStyle(ThemeConfig::APP_ID, 'nexeno-login');
		foreach (VersionedStyles::forBase('nexeno-login') as $name) {
			Util::addStyle(ThemeConfig::APP_ID, $name);
		}
	}
}
