<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- "Nexeno project coming soon" bar (Figma: Nexeno Suite, node 3122:14202). -->
<template>
	<section v-if="state.projectBannerVisible" class="nexeno-project-banner" :aria-label="t('nexeno_theme', 'Nexeno project')">
		<div class="nexeno-project-banner__message">
			<span class="nexeno-project-banner__badge">{{ t('nexeno_theme', 'Coming soon') }}</span>
			<p>
				{{ message.before }}<strong>{{ message.highlight }}</strong>{{ message.after }}
			</p>
		</div>
		<div class="nexeno-project-banner__actions">
			<a
				class="nexeno-project-banner__link"
				:href="subscribeUrl"
				target="_blank"
				rel="noopener noreferrer">
				<img
					:src="bellIcon"
					width="16"
					height="16"
					alt="">
				{{ t('nexeno_theme', 'Notify me') }}
			</a>
			<router-link class="nexeno-project-banner__link" :to="{ name: 'marketing' }">
				{{ t('nexeno_theme', 'See what it does') }}
			</router-link>
			<button
				type="button"
				class="nexeno-project-banner__close"
				:aria-label="t('nexeno_theme', 'Close')"
				@click="dismissProjectBanner">
				<img
					:src="closeIcon"
					width="28"
					height="28"
					alt="">
			</button>
		</div>
	</section>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import bellIcon from '../assets/images/project-banner/bell.svg'
import closeIcon from '../assets/images/project-banner/close.svg'
import { SUBSCRIBE_URL } from '../constants.js'
import { splitHighlight } from '../highlight.js'
import { dismissProjectBanner, state } from '../store.js'

export default {
	name: 'ProjectBanner',

	data() {
		return {
			state,
			bellIcon,
			closeIcon,
			subscribeUrl: SUBSCRIBE_URL,
		}
	},

	computed: {
		message() {
			return splitHighlight(t('nexeno_theme', '<span>Nexeno project</span> is almost here. Plan, track, and deliver work, all in one place.'))
		},
	},

	methods: {
		t,
		dismissProjectBanner,
	},
}
</script>
