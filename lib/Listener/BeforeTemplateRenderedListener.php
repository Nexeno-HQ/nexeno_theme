<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Listener;

use OC\Security\CSP\ContentSecurityPolicyNonceManager;
use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\Service\VersionedScripts;
use OCA\NexenoTheme\Service\VersionedStyles;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Services\IInitialState;
use OCP\Config\IUserConfig;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;
use OCP\Server;
use OCP\Util;

class BeforeTemplateRenderedListener implements IEventListener {
	private const STYLESHEET = 'nexeno-theme';

	public function __construct(
		private IUserSession $userSession,
		private IUserConfig $userConfig,
		private IInitialState $initialState,
		private IURLGenerator $urlGenerator,
		private IRequest $request,
		private CoreTheming $coreTheming,
	) {
	}

	public function handle(Event $event): void {
		if (!($event instanceof BeforeTemplateRenderedEvent)) {
			return;
		}
		if (!$event->isLoggedIn()) {
			return;
		}
		$user = $this->userSession->getUser();
		if ($user === null) {
			return;
		}
		$this->coreTheming->restoreBackup($user->getUID());
		if (in_array($event->getResponse()->getApp(), ThemeConfig::EXCLUDED_APPS, true)) {
			return;
		}
		$variant = $this->userConfig->getValueString(
			$user->getUID(),
			ThemeConfig::APP_ID,
			ThemeConfig::CONFIG_KEY_VARIANT,
			'off',
		);


		$this->initialState->provideInitialState(ThemeConfig::CONFIG_KEY_VARIANT, $variant);

		if ($variant === 'light' || $variant === 'dark') {
			$nonce = Server::get(ContentSecurityPolicyNonceManager::class)->getNonce();
			$property = $variant === 'light' ? 'nexenoLight' : 'nexenoDark';
			$bodyThemes = '[`' . implode('`,`', $this->coreTheming->bodyThemes($user->getUID(), $variant)) . '`]';
			Util::addHeader('script', ['nonce' => $nonce],
				'document.documentElement.dataset.nexeno=``;'
				. 'document.documentElement.dataset.' . $property . '=``;'
				. 'var t=' . $bodyThemes . ';'
				. 'function s(b){Array.from(b.attributes).forEach(function(a){if(a.name.indexOf(`data-theme-`)===0)b.removeAttribute(a.name)});'
				. 't.forEach(function(i){b.setAttribute(`data-theme-`+i,``)});b.dataset.themes=t.join(`,`)}'
				. 'if(document.body){s(document.body)}else{var n=new MutationObserver(function(){if(document.body){n.disconnect();s(document.body)}});'
				. 'n.observe(document.documentElement,{childList:true})}');
			if ((int)Util::getVersion()[0] < 34 && str_starts_with($this->request->getPathInfo() ?: '', '/settings/')) {
				Util::addHeader('script', ['nonce' => $nonce],
					'var o=new MutationObserver(function(){var m=document.querySelector(`main[data-active-section-id]`);'
					. 'if(m){m.classList.add(m.dataset.activeSectionId);o.disconnect()}});'
					. 'o.observe(document.documentElement,{childList:true,subtree:true});'
					. 'document.addEventListener(`DOMContentLoaded`,function(){o.disconnect()});');
			}
		}

		Util::addTranslations(ThemeConfig::APP_ID);
		$this->addStylesheet(self::STYLESHEET);
		foreach (VersionedStyles::forBase(self::STYLESHEET) as $name) {
			$this->addStylesheet($name);
		}
		$this->addScript('nexeno-state');
		$this->addScript('nexeno-favorites');
		$this->addScript('nexeno-files');
		$this->addScript('nexeno-files-layout');
		$this->addScript('nexeno-modal');
		$this->addScript('nexeno-navigation');
		$this->addScript('nexeno-serverinfo');
		$this->addScript('nexeno-workflow');
		$this->addScript('nexeno-albums');
		$this->addScript('nexeno-app-bundles');
		$this->addScript('nexeno-usernotification');
	}

	private function addScript(string $name): void {
		Util::addScript(ThemeConfig::APP_ID, $name);
		foreach (VersionedScripts::forBase($name) as $versioned) {
			Util::addScript(ThemeConfig::APP_ID, $versioned);
		}
	}

	private function addStylesheet(string $name): void {
		$path = 'css/' . $name . '.css';
		$file = dirname(__DIR__, 2) . '/' . $path;
		$mtime = is_file($file) ? filemtime($file) : false;

		if ($mtime === false) {
			Util::addStyle(ThemeConfig::APP_ID, $name);
			return;
		}

		$href = $this->urlGenerator->linkTo(ThemeConfig::APP_ID, $path) . '?v=' . $mtime;
		Util::addHeader('link', ['rel' => 'stylesheet', 'href' => $href]);
	}
}
