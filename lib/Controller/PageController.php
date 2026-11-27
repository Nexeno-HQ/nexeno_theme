<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Controller;

use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Util;

class PageController extends Controller {
	public function __construct(
		string $appName,
		IRequest $request,
		private IURLGenerator $urlGenerator,
	) {
		parent::__construct($appName, $request);
	}

	#[NoAdminRequired]
	#[NoCSRFRequired]
	public function index(): TemplateResponse {
		Util::addScript(ThemeConfig::APP_ID, 'page/main');
		Util::addStyle(ThemeConfig::APP_ID, 'nexeno-page');
		// Printed after Nextcloud's own favicon, so the browser tab shows the app's logo (as in nexeno_project).
		Util::addHeader('link', ['rel' => 'icon', 'type' => 'image/svg+xml', 'href' => $this->urlGenerator->imagePath(ThemeConfig::APP_ID, 'favicon.svg')]);
		return new TemplateResponse(ThemeConfig::APP_ID, 'main');
	}
}
