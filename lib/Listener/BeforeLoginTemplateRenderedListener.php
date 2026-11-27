<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Listener;

use OCA\NexenoTheme\Service\LoginStyle;
use OCA\NexenoTheme\Service\VersionedFiles;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Http\Events\BeforeLoginTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

/**
 * @template-implements IEventListener<Event>
 */
class BeforeLoginTemplateRenderedListener implements IEventListener {
	public function __construct(
		private LoginStyle $loginStyle,
	) {
	}

	public function handle(Event $event): void {
		if (!($event instanceof BeforeLoginTemplateRenderedEvent)) {
			return;
		}
		// An admin can switch the Nexeno login page off for the whole instance.
		if (!$this->loginStyle->isEnabled()) {
			return;
		}

		foreach (VersionedFiles::withBase('nexeno-login', 'css') as $name) {
			Util::addStyle(ThemeConfig::APP_ID, $name);
		}
	}
}
