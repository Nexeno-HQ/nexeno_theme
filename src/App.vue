<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcContent appName="nexeno_theme">
		<AppSidebar />
		<NcAppContent>
			<div class="nexeno-content">
				<router-view />
			</div>
		</NcAppContent>
		<RatePrompt />
	</NcContent>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcAppContent from '@nextcloud/vue/components/NcAppContent'
import NcContent from '@nextcloud/vue/components/NcContent'
import AppSidebar from './components/AppSidebar.vue'
import RatePrompt from './components/RatePrompt.vue'
import { refresh } from './store.js'

export default {
	name: 'App',
	components: {
		NcContent,
		NcAppContent,
		AppSidebar,
		RatePrompt,
	},

	mounted() {
		// Without this the page would show the theme as off, as if the user had turned it off.
		refresh().catch(() => {
			window.OCP?.Toast?.error(t('nexeno_theme', 'Could not load your theme settings. Reload the page to try again.'))
		})
	},
}
</script>
