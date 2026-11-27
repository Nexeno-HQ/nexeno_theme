<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Listener;

use OC\Security\CSP\ContentSecurityPolicyNonceManager;
use OCA\NexenoTheme\Service\CoreTheming;
use OCA\NexenoTheme\Service\PrimaryColour;
use OCA\NexenoTheme\Service\VersionedFiles;
use OCA\NexenoTheme\ThemeConfig;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Services\IInitialState;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;
use OCP\Server;
use OCP\Util;

/**
 * @template-implements IEventListener<Event>
 */
class BeforeTemplateRenderedListener implements IEventListener {
	private const STYLESHEET = 'nexeno-theme';

	/** Page scripts loaded only while the theme is on, each with its version-specific files (VersionedFiles). */
	private const THEME_SCRIPTS = [
		// First: nexeno-files, nexeno-modal and nexeno-favorites use its file-type rule.
		'nexeno-filetypes',
		'nexeno-favorites',
		'nexeno-files',
		'nexeno-files-layout',
		'nexeno-modal',
		'nexeno-navigation',
		'nexeno-serverinfo',
		'nexeno-workflow',
		'nexeno-albums',
		'nexeno-app-bundles',
		'nexeno-usernotification',
	];

	public function __construct(
		private IUserSession $userSession,
		private IInitialState $initialState,
		private IURLGenerator $urlGenerator,
		private IRequest $request,
		private CoreTheming $coreTheming,
		private PrimaryColour $primaryColour,
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
		if (in_array($event->getResponse()->getApp(), ThemeConfig::EXCLUDED_APPS, true)) {
			return;
		}
		$variant = $this->coreTheming->variant($user->getUID());

		$this->initialState->provideInitialState(ThemeConfig::CONFIG_KEY_VARIANT, $variant);
		$this->initialState->provideInitialState(
			ThemeConfig::INITIAL_STATE_USER_THEMES,
			$this->coreTheming->enabledThemes($user->getUID()),
		);

		if (in_array($variant, ThemeConfig::ENABLED_VARIANTS, true)) {
			// Private Nextcloud class (no public API gives the nonce): only read while the theme is on, so a change
			// to it in a future Nextcloud cannot break pages for users who never turned the theme on.
			$nonce = Server::get(ContentSecurityPolicyNonceManager::class)->getNonce();
			// Only while the theme is on: with it off the page stays exactly as Nextcloud made it.
			// Turning the theme on in the settings shows the colour from the next page load.
			$primaryColours = $this->primaryColour->forUser($user->getUID());
			if ($primaryColours !== null) {
				Util::addHeader('script', ['nonce' => $nonce], self::ownPrimaryScript($primaryColours['light'], $primaryColours['dark']));
			}
			Util::addHeader('script', ['nonce' => $nonce],
				self::firstPaintScript($variant, $this->coreTheming->bodyThemes($user->getUID(), $variant)));
			$appScript = self::appScript($event->getResponse()->getApp());
			if ($appScript !== '') {
				Util::addHeader('script', ['nonce' => $nonce], $appScript);
			}
			if ((int)Util::getVersion()[0] < 34 && str_starts_with($this->request->getPathInfo() ?: '', '/settings/')) {
				Util::addHeader('script', ['nonce' => $nonce],
					// Wrapped for the same reason: "o" must not become a page-level variable.
					'(function(){var o=new MutationObserver(function(){var m=document.querySelector(`main[data-active-section-id]`);'
					. 'if(m){m.classList.add(m.dataset.activeSectionId);o.disconnect()}});'
					. 'o.observe(document.documentElement,{childList:true,subtree:true});'
					. 'document.addEventListener(`DOMContentLoaded`,function(){o.disconnect()});'
					. '})();');
			}
		}

		// nexeno-state.js always loads: it is small, and it switches the theme on in this tab when the user
		// turns it on in another one.
		foreach (VersionedFiles::withBase('nexeno-state', 'js') as $name) {
			Util::addScript(ThemeConfig::APP_ID, $name);
		}

		$styles = VersionedFiles::withBase(self::STYLESHEET, 'css');
		$scripts = [];
		foreach (self::THEME_SCRIPTS as $name) {
			$scripts = [...$scripts, ...VersionedFiles::withBase($name, 'js')];
		}

		if (!in_array($variant, ThemeConfig::ENABLED_VARIANTS, true)) {
			// Theme off: none of the styles (about 3 MB) or page scripts load, so Nextcloud runs at full speed.
			// nexeno-state.js gets their addresses and adds them itself if the user turns the theme on.
			$this->initialState->provideInitialState(ThemeConfig::INITIAL_STATE_ASSETS, [
				'styles' => array_map(fn (string $name): string => $this->assetUrl('css', $name), $styles),
				'scripts' => array_map(fn (string $name): string => $this->assetUrl('js', $name), $scripts),
			]);
			return;
		}

		foreach ($styles as $name) {
			$this->addStylesheet($name);
		}
		foreach ($scripts as $name) {
			Util::addScript(ThemeConfig::APP_ID, $name);
		}
	}

	/** Address of css/<name>.css or js/<name>.js, with its change time so browsers fetch a new build. */
	private function assetUrl(string $type, string $name): string {
		$path = $type . '/' . $name . '.' . $type;
		$file = dirname(__DIR__, 2) . '/' . $path;
		$mtime = is_file($file) ? filemtime($file) : false;
		return $this->urlGenerator->linkTo(ThemeConfig::APP_ID, $path) . ($mtime === false ? '' : '?v=' . $mtime);
	}

	/**
	 * Inline script that puts the Nexeno and Nextcloud theme markers on the page before the first paint,
	 * so the page does not flash. "system" is resolved here from the device setting.
	 *
	 * @param string $variant One of ThemeConfig::ENABLED_VARIANTS.
	 * @param list<string> $bodyThemes Theme ids from CoreTheming::bodyThemes().
	 */
	public static function firstPaintScript(string $variant, array $bodyThemes): string {
		$resolve = $variant === ThemeConfig::VARIANT_SYSTEM
			// No "&&" here: Nextcloud HTML-escapes header scripts, and "&amp;&amp;" stops the whole script.
			// Every browser Nextcloud supports has matchMedia.
			? 'var v=window.matchMedia(`(prefers-color-scheme: dark)`).matches?`Dark`:`Light`;'
			: 'var v=`' . ($variant === 'light' ? 'Light' : 'Dark') . '`;';
		$themes = '[`' . implode('`,`', $bodyThemes) . '`]';
		// Wrapped in a function so its variables (t, v, c, h, s, n) stay private. As page-level
		// variables they clashed with other apps' scripts: a global "t" makes an app's own
		// "const t" fail with "Identifier 't' has already been declared" (Countdown).
		return '(function(){'
			. $resolve
			. 'var t=' . $themes . ';'
			// The same rule as resolveVariant() and normalizeThemes() in nexeno-state.js. A high-contrast theme the
			// user chose in Nextcloud (c) decides light or dark, as its name says; high contrast (h) is on with it or
			// when the device asks for more contrast. <body> gets that one Nextcloud theme, and OpenDyslexic.
			. 'var c=t.filter(function(i){return i.indexOf(`-highcontrast`)!==-1})[0];'
			. 'if(c)v=c.indexOf(`dark`)===0?`Dark`:`Light`;'
			. 'var h=c?true:window.matchMedia(`(prefers-contrast: more)`).matches;'
			. 'document.documentElement.dataset.nexeno=``;'
			. 'document.documentElement.dataset[`nexeno`+v]=``;'
			. 't=[v.toLowerCase()+(h?`-highcontrast`:``)].concat(t.filter(function(i){return i===`opendyslexic`}));'
			. 'if(h)document.documentElement.dataset.nexenoHc=``;'
			. 'function s(b){Array.from(b.attributes).forEach(function(a){if(a.name.indexOf(`data-theme-`)===0)b.removeAttribute(a.name)});'
			. 't.forEach(function(i){b.setAttribute(`data-theme-`+i,``)});b.dataset.themes=t.join(`,`)}'
			. 'if(document.body){s(document.body)}else{var n=new MutationObserver(function(){if(document.body){n.disconnect();s(document.body)}});'
			. 'n.observe(document.documentElement,{childList:true})}'
			. '})();';
	}

	/**
	 * Inline script that puts the open app's id on <html> as data-nexeno-app before the first paint. The built
	 * stylesheets use it in place of :has(.app-<id>) (scripts/lower-app-has.mjs). It is the same id Nextcloud
	 * puts on #content as "app-<id>".
	 *
	 * @param string $appId The app that renders the page.
	 */
	public static function appScript(string $appId): string {
		// Only an app id's own characters get into the script, so nothing else can be injected.
		if (preg_match('/^[a-z0-9_]+$/', $appId) !== 1) {
			return '';
		}
		return 'document.documentElement.dataset.nexenoApp=`' . $appId . '`;';
	}

	/**
	 * Inline script that gives the page the colour from PrimaryColour::forUser() (the user's own, or the
	 * organisation's) before the first paint:
	 * the data-nexeno-own-primary marker and colour variables on <html> (nexeno-theme.scss mixes the rest
	 * from them), and the SVG filter that paints the theme's blue icons in that colour.
	 *
	 * @param string $light #rrggbb from PrimaryColour::forUser(), readable in the light variant.
	 * @param string $dark #rrggbb readable in the dark variant.
	 */
	public static function ownPrimaryScript(string $light, string $dark): string {
		// Only #rrggbb gets into the script, so nothing else can be injected.
		if (PrimaryColour::fullHex($light) !== $light || PrimaryColour::fullHex($dark) !== $dark) {
			return '';
		}
		return '(function(){var root=document.documentElement;'
			. 'root.dataset.nexenoOwnPrimary=``;'
			. 'root.style.setProperty(`--nexeno-own-primary-light`,`' . $light . '`);'
			. 'root.style.setProperty(`--nexeno-own-primary-dark`,`' . $dark . '`);'
			// Built with DOM calls: Nextcloud HTML-escapes inline header scripts, so the script must not contain < > & or ".
			. 'function createSvgElement(tagName,attributes,parent){var element=document.createElementNS(`http://www.w3.org/2000/svg`,tagName);'
			. 'for(var index=0;index!==attributes.length;index+=2){element.setAttribute(attributes[index],attributes[index+1])}'
			. 'if(parent){parent.appendChild(element)}return element}'
			. 'function addTintFilter(body){var svg=createSvgElement(`svg`,[`id`,`nexeno-primary-filter`,`width`,`0`,`height`,`0`,`aria-hidden`,`true`,`focusable`,`false`]);'
			. 'var filter=createSvgElement(`filter`,[`id`,`nexeno-primary-tint`,`color-interpolation-filters`,`sRGB`],svg);'
			. 'createSvgElement(`feFlood`,[],filter);createSvgElement(`feComposite`,[`in2`,`SourceAlpha`,`operator`,`in`],filter);'
			. 'body.insertBefore(svg,body.firstChild)}'
			. 'if(document.body){addTintFilter(document.body)}else{var bodyObserver=new MutationObserver(function(){'
			. 'if(document.body){bodyObserver.disconnect();addTintFilter(document.body)}});'
			. 'bodyObserver.observe(root,{childList:true})}'
			. '})();';
	}

	private function addStylesheet(string $name): void {
		if (!is_file(dirname(__DIR__, 2) . '/css/' . $name . '.css')) {
			Util::addStyle(ThemeConfig::APP_ID, $name);
			return;
		}
		Util::addHeader('link', ['rel' => 'stylesheet', 'href' => $this->assetUrl('css', $name)]);
	}
}
