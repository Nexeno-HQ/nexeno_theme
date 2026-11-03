<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcContent app-name="nexeno_theme">
		<AppSidebar />
		<NcAppContent>
			<div class="nexeno-content">
				<router-view />
			</div>
		</NcAppContent>
	</NcContent>
</template>

<script>
import NcContent from '@nextcloud/vue/components/NcContent'
import NcAppContent from '@nextcloud/vue/components/NcAppContent'
import AppSidebar from './components/AppSidebar.vue'
import { refresh } from './store'

export default {
	name: 'App',
	components: {
		NcContent,
		NcAppContent,
		AppSidebar,
	},
	mounted() {
		refresh()
	},
}
</script>
