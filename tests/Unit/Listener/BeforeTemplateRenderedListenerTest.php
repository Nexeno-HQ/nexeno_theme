<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nexeno contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\NexenoTheme\Tests\Unit\Listener;

use OCA\NexenoTheme\Listener\BeforeTemplateRenderedListener;
use PHPUnit\Framework\TestCase;

/**
 * The inline script that sets the theme markers before the first paint. It runs on every page,
 * so one wrong quote breaks the theme everywhere.
 */
final class BeforeTemplateRenderedListenerTest extends TestCase {
	public function testFixedVariantScript(): void {
		self::assertSame(
			'(function(){var v=`Dark`;'
			. 'var t=[`dark`,`opendyslexic`];'
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
			. '})();',
			BeforeTemplateRenderedListener::firstPaintScript('dark', ['dark', 'opendyslexic']),
		);
	}

	public function testLightUsesLightMarker(): void {
		$script = BeforeTemplateRenderedListener::firstPaintScript('light', ['light']);

		self::assertStringStartsWith('(function(){var v=`Light`;', $script);
		self::assertStringContainsString('var t=[`light`];', $script);
	}

	public function testOwnPrimaryScriptSetsColoursAndFilter(): void {
		$script = BeforeTemplateRenderedListener::ownPrimaryScript('#c0392b', '#d36f66');

		self::assertStringContainsString('root.dataset.nexenoOwnPrimary=``;', $script);
		self::assertStringContainsString('setProperty(`--nexeno-own-primary-light`,`#c0392b`)', $script);
		self::assertStringContainsString('setProperty(`--nexeno-own-primary-dark`,`#d36f66`)', $script);
		self::assertStringContainsString('createSvgElement(`filter`,[`id`,`nexeno-primary-tint`', $script);
		// Nextcloud HTML-escapes inline header scripts, so these would reach the browser mangled.
		self::assertDoesNotMatchRegularExpression('/[<>&"]/', $script);
	}

	public function testOwnPrimaryScriptRefusesAnythingButHex(): void {
		self::assertSame('', BeforeTemplateRenderedListener::ownPrimaryScript('#c0392b`);alert(1);//', '#d36f66'));
		self::assertSame('', BeforeTemplateRenderedListener::ownPrimaryScript('#c0392b', 'red'));
	}

	/**
	 * Nextcloud prints header scripts through Util::sanitizeHTML (htmlspecialchars). Any character it
	 * escapes reaches the browser mangled: "&&" became "&amp;&amp;", a syntax error, so the page showed
	 * the plain Nextcloud look until the theme's own script loaded.
	 */
	public function testFirstPaintScriptSurvivesNextcloudEscaping(): void {
		foreach (['system', 'light', 'dark'] as $variant) {
			$script = BeforeTemplateRenderedListener::firstPaintScript($variant, ['default', 'opendyslexic']);
			self::assertSame($script, htmlspecialchars($script, ENT_QUOTES, 'UTF-8'), $variant);
		}
	}

	public function testAppScriptMarksTheOpenApp(): void {
		$script = BeforeTemplateRenderedListener::appScript('files_sharing');

		self::assertSame('document.documentElement.dataset.nexenoApp=`files_sharing`;', $script);
		self::assertSame($script, htmlspecialchars($script, ENT_QUOTES, 'UTF-8'));
	}

	public function testAppScriptRefusesAnythingButAnAppId(): void {
		self::assertSame('', BeforeTemplateRenderedListener::appScript('deck`;alert(1);//'));
		self::assertSame('', BeforeTemplateRenderedListener::appScript(''));
	}

	public function testSystemResolvesFromTheDevice(): void {
		$script = BeforeTemplateRenderedListener::firstPaintScript('system', ['default']);

		self::assertStringContainsString('matchMedia(`(prefers-color-scheme: dark)`).matches?`Dark`:`Light`', $script);
		self::assertStringContainsString('var t=[`default`];', $script);
	}
}
