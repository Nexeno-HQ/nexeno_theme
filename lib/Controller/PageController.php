<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\Util;

class PageController extends Controller {
	public function __construct(
		string $appName,
		IRequest $request,
	) {
		parent::__construct($appName, $request);
	}

	#[NoAdminRequired]
	#[NoCSRFRequired]
	public function index(): TemplateResponse {
		return $this->render();
	}

	private function render(): TemplateResponse {
		Util::addTranslations(Application::APP_ID);
		Util::addScript(Application::APP_ID, 'page/main');
		Util::addStyle(Application::APP_ID, 'nexeno-page');
		return new TemplateResponse(Application::APP_ID, 'main');
	}
}
