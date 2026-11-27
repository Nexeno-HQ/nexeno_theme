<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- "Rate this app" popup (Figma: Nexeno Suite, node 3152:48136). -->
<template>
	<!-- Rendered in <body> so the overlay also covers the Nextcloud header. -->
	<Teleport to="body">
		<Transition name="nexeno-rate-prompt-fade">
			<div v-if="state.ratePromptVisible" class="nexeno-rate-prompt-backdrop">
				<div
					ref="dialog"
					class="nexeno-rate-prompt"
					role="dialog"
					aria-modal="true"
					aria-labelledby="nexeno-rate-prompt-title"
					aria-describedby="nexeno-rate-prompt-text"
					@keydown.esc="later"
					@keydown.tab="keepFocusInside">
					<div class="nexeno-rate-prompt__image">
						<img
							:src="previewImage"
							width="368"
							height="230"
							alt="">
						<button
							type="button"
							class="nexeno-rate-prompt__close"
							:aria-label="t('nexeno_theme', 'Close')"
							@click="later">
							<img
								:src="closeIcon"
								width="20"
								height="20"
								alt="">
						</button>
					</div>
					<div class="nexeno-rate-prompt__text">
						<h2 id="nexeno-rate-prompt-title">
							<span aria-hidden="true">🤩</span>{{ t('nexeno_theme', 'Enjoying Nexeno Theme? Rate it') }}
						</h2>
						<p id="nexeno-rate-prompt-text">
							{{ t('nexeno_theme', 'If the refreshed look is working for you, a quick rating helps other admins discover this theme in the app store.') }}
						</p>
					</div>
					<div class="nexeno-rate-prompt__actions">
						<button
							ref="rateButton"
							type="button"
							class="nexeno-rate-prompt__button nexeno-rate-prompt__button--primary"
							@click="rate">
							{{ t('nexeno_theme', 'Rate it') }}
						</button>
						<button type="button" class="nexeno-rate-prompt__button" @click="never">
							{{ t('nexeno_theme', 'Do not show again') }}
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import closeIcon from '../assets/images/rate-prompt/close.svg'
import previewImage from '../assets/images/rate-prompt/rate-prompt-preview.png'
import { APP_STORE_URL } from '../constants.js'
import { answerRatePrompt, state } from '../store.js'

export default {
	name: 'RatePrompt',

	data() {
		return {
			state,
			previewImage,
			closeIcon,
		}
	},

	watch: {
		// Move focus into the popup when it opens, so keyboard and screen reader users land on it.
		'state.ratePromptVisible': function(visible) {
			if (visible) {
				this.$nextTick(() => this.$refs.rateButton?.focus())
			}
		},
	},

	methods: {
		t,

		/** Close button and Escape: show again in 7 days. */
		later() {
			answerRatePrompt('later')
		},

		never() {
			answerRatePrompt('never')
		},

		/** Opens the rating page in a new tab; someone who rated is not asked again. */
		rate() {
			window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer')
			answerRatePrompt('rated')
		},

		/**
		 * The page behind is dimmed, so Tab cycles through the popup's buttons only.
		 *
		 * @param {KeyboardEvent} event The Tab keydown
		 */
		keepFocusInside(event) {
			const buttons = Array.from(this.$refs.dialog.querySelectorAll('button'))
			const first = buttons[0]
			const last = buttons[buttons.length - 1]
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		},
	},
}
</script>
