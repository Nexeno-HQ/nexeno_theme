<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<!-- Nexeno project page, opened from "Apps" in the sidebar. It reuses the overview's hero styles
	     (.suite-app-wrapper .hero-section). The copy is a first draft and will change. -->
	<div class="suite-app-wrapper marketing-wrapper">
		<section class="hero-section">
			<div class="hero-section-text">
				<div class="pre-heading">
					<span>{{ t('nexeno_theme', 'Coming soon') }}</span>
				</div>
				<div class="title title--inline-highlight">
					<!-- Second line starts on its own line on desktop and runs inline on mobile. -->
					<h1>
						{{ t('nexeno_theme', 'Enterprise project management,') }}
						<span class="title__line">{{ secondLine.before }}<span class="title__highlight">{{ secondLine.highlight }}</span>{{ secondLine.after }}</span>
					</h1>
				</div>
				<div class="content-small">
					<p>{{ t('nexeno_theme', 'Nexeno Project brings planning, tracking and delivery into the Nextcloud you already run. The work, the files and the people stay on infrastructure you control. No second server. No second sign-in. No new processor in your data protection register.') }}</p>
				</div>
				<div>
					<a
						class="hero-cta"
						:href="contactUrl"
						target="_blank"
						rel="noopener noreferrer">
						{{ t('nexeno_theme', 'Talk to us about your requirements') }}
					</a>
				</div>
				<ul class="hero-chips">
					<li v-for="chip in heroChips" :key="chip.id">
						<img
							:src="chip.icon"
							width="14"
							height="14"
							alt="">
						{{ chip.label }}
					</li>
				</ul>
			</div>
			<div class="hero-image-wrapper">
				<div class="img-wrapper">
					<!-- Light and dark versions; CSS shows the one that matches the current theme. -->
					<img class="showcase-img--light" :src="heroPreviewLight" alt="">
					<img class="showcase-img--dark" :src="heroPreviewDark" alt="">
				</div>
			</div>
		</section>

		<!-- "Who it is for" (Figma: Nexeno Suite, node 3122:14979). -->
		<section class="audience-section" aria-labelledby="nexeno-audience-heading">
			<p class="section-eyebrow">
				{{ t('nexeno_theme', 'Who it is for') }}
			</p>
			<h2 id="nexeno-audience-heading">
				{{ t('nexeno_theme', 'For organisations that already keep their data at home.') }}
			</h2>
			<ul class="audience-grid">
				<li v-for="audience in audiences" :key="audience.id" class="audience-card">
					<img
						:src="audience.icon"
						width="36"
						height="36"
						alt="">
					<div class="audience-card__text">
						<h3>{{ audience.title }}</h3>
						<p>{{ audience.description }}</p>
					</div>
				</li>
			</ul>
		</section>

		<!-- "Privacy by Nexeno project" (Figma: Nexeno Suite, node 3122:9655). -->
		<section class="privacy-section" aria-labelledby="nexeno-privacy-heading">
			<div class="privacy-section__header">
				<p class="section-eyebrow">
					{{ t('nexeno_theme', 'Privacy by Nexeno project') }}
				</p>
				<h2 id="nexeno-privacy-heading">
					<template v-for="(part, index) in privacyHeading" :key="index">
						<span v-if="part.highlight">{{ part.text }}</span>
						<template v-else>
							{{ part.text }}
						</template>
					</template>
				</h2>
			</div>
			<ul class="privacy-grid">
				<li v-for="item in privacyItems" :key="item.id" class="privacy-card">
					<h3>{{ item.title }}</h3>
					<p>{{ item.description }}</p>
				</li>
			</ul>
		</section>

		<!-- "The same work, six ways." (Figma: Nexeno Suite, node 3120:4698). -->
		<section class="views-section" aria-labelledby="nexeno-views-heading">
			<!-- Heading and intro sit 16px apart; the tabs and the stage follow 24px apart. -->
			<div class="views-section__header">
				<h2 id="nexeno-views-heading">
					{{ viewsHeading.before }}<span>{{ viewsHeading.highlight }}</span>{{ viewsHeading.after }}
				</h2>
				<p class="views-section__intro">
					{{ t('nexeno_theme', 'Beautifully designed, thoughtfully structured, and built to make Nextcloud feel more intuitive every day.') }}
				</p>
			</div>
			<div
				class="views-tabs"
				role="tablist"
				:aria-label="t('nexeno_theme', 'Project views')"
				@keydown="moveTabFocus">
				<button
					v-for="view in views"
					:id="`nexeno-view-tab-${view.id}`"
					:key="view.id"
					ref="tabs"
					type="button"
					role="tab"
					class="views-tabs__tab"
					:class="{ 'views-tabs__tab--active': view.id === activeView.id }"
					:aria-selected="view.id === activeView.id ? 'true' : 'false'"
					aria-controls="nexeno-view-panel"
					:tabindex="view.id === activeView.id ? 0 : -1"
					@click="activeViewId = view.id">
					{{ view.label }}
				</button>
			</div>
			<div
				id="nexeno-view-panel"
				class="views-stage"
				role="tabpanel"
				:aria-labelledby="`nexeno-view-tab-${activeView.id}`">
				<div class="views-stage__frame">
					<!-- Light and dark screenshots; CSS shows the one that matches the current theme. -->
					<img
						class="showcase-img--light"
						:src="activeView.image"
						width="1440"
						height="1024"
						:alt="t('nexeno_theme', 'Nexeno project, {view} view', { view: activeView.label })">
					<img
						class="showcase-img--dark"
						:src="activeView.imageDark"
						width="1440"
						height="1024"
						:alt="t('nexeno_theme', 'Nexeno project, {view} view', { view: activeView.label })">
				</div>
			</div>
		</section>

		<!-- "Common questions" (Figma: Nexeno Suite, node 3184:38035). -->
		<section class="faq-section" aria-labelledby="nexeno-faq-heading">
			<div class="faq-section__header">
				<p class="section-eyebrow">
					{{ t('nexeno_theme', 'FAQs') }}
				</p>
				<h2 id="nexeno-faq-heading">
					{{ t('nexeno_theme', 'Common questions') }}
				</h2>
			</div>
			<!-- Accordion: each question is a button that shows or hides its answer. -->
			<ul class="faq-list">
				<li
					v-for="faq in faqs"
					:key="faq.id"
					class="faq-item"
					:class="{ 'faq-item--open': openFaqId === faq.id }">
					<h3>
						<button
							:id="`nexeno-faq-question-${faq.id}`"
							type="button"
							class="faq-item__question"
							:aria-expanded="openFaqId === faq.id ? 'true' : 'false'"
							:aria-controls="`nexeno-faq-answer-${faq.id}`"
							@click="toggleFaq(faq.id)">
							<span>{{ faq.question }}</span>
							<img
								:src="chevronIcon"
								width="20"
								height="20"
								alt="">
						</button>
					</h3>
					<!-- Always rendered so the height can animate; hidden from readers while closed via CSS visibility. -->
					<div
						:id="`nexeno-faq-answer-${faq.id}`"
						class="faq-item__answer"
						role="region"
						:aria-labelledby="`nexeno-faq-question-${faq.id}`">
						<div class="faq-item__answer-inner">
							<p>{{ faq.answer }}</p>
							<p v-if="faq.link">
								<a :href="faq.link.href" target="_blank" rel="noopener noreferrer">{{ faq.link.label }}</a>
							</p>
						</div>
					</div>
				</li>
			</ul>
		</section>

		<!-- "Still deciding?" call to action (Figma: Nexeno Suite, node 3126:15179). -->
		<section class="decide-section" aria-labelledby="nexeno-decide-heading">
			<div class="decide-panel">
				<!-- Decorative: dot pattern and two outlined layer icons. -->
				<img
					class="decide-panel__dots"
					:src="dotPatternImage"
					alt="">
				<img
					class="decide-panel__layers decide-panel__layers--start"
					:src="layersIcon"
					width="214"
					height="214"
					alt="">
				<img
					class="decide-panel__layers decide-panel__layers--end"
					:src="layersIcon"
					width="214"
					height="214"
					alt="">
				<div class="decide-panel__content">
					<div class="decide-panel__text">
						<h2 id="nexeno-decide-heading">
							{{ t('nexeno_theme', 'Still deciding?') }}
						</h2>
						<p>{{ t('nexeno_theme', 'Talk to us about your requirements, or get notified the moment Nexeno Project launches.') }}</p>
					</div>
					<div class="decide-panel__actions">
						<a
							class="decide-panel__button decide-panel__button--solid"
							:href="contactUrl"
							target="_blank"
							rel="noopener noreferrer">
							{{ t('nexeno_theme', 'Talk to us about your requirements') }}
						</a>
						<a
							class="decide-panel__button decide-panel__button--outline"
							:href="subscribeUrl"
							target="_blank"
							rel="noopener noreferrer">
							{{ t('nexeno_theme', 'Notify me at launch') }}
						</a>
					</div>
					<p class="decide-panel__note">
						{{ t('nexeno_theme', 'No migration risk — it runs on the Nextcloud you already have.') }}
					</p>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import bankIcon from '../assets/images/marketing/bank-outline.svg'
import chevronIcon from '../assets/images/marketing/chevron-down.svg'
import dotPatternImage from '../assets/images/marketing/dot-pattern-white.png'
// Hero collage (Figma: Nexeno Suite, slides layer of light 3224:21864 and dark 3230:27164).
import heroPreviewDark from '../assets/images/marketing/hero-preview-dark.webp'
import heroPreviewLight from '../assets/images/marketing/hero-preview-light.webp'
import layersIcon from '../assets/images/marketing/layers.svg'
import lockKeyholeIcon from '../assets/images/marketing/lock-keyhole.svg'
import officeBuildingIcon from '../assets/images/marketing/office-building.svg'
import schoolIcon from '../assets/images/marketing/school-outline.svg'
import shieldCheckIcon from '../assets/images/marketing/shield-check.svg'
import userRoundCheckIcon from '../assets/images/marketing/user-round-check.svg'
import boardViewDark from '../assets/images/marketing/view-board-dark.webp'
import boardViewLight from '../assets/images/marketing/view-board-light.webp'
import calendarViewDark from '../assets/images/marketing/view-calendar-dark.webp'
import calendarViewLight from '../assets/images/marketing/view-calendar-light.webp'
import dashboardViewDark from '../assets/images/marketing/view-dashboard-dark.webp'
import dashboardViewLight from '../assets/images/marketing/view-dashboard-light.webp'
import ganttViewDark from '../assets/images/marketing/view-gantt-dark.webp'
import ganttViewLight from '../assets/images/marketing/view-gantt-light.webp'
import listViewDark from '../assets/images/marketing/view-list-dark.webp'
import listViewLight from '../assets/images/marketing/view-list-light.webp'
import timelineViewDark from '../assets/images/marketing/view-timeline-dark.webp'
import timelineViewLight from '../assets/images/marketing/view-timeline-light.webp'
import { CONTACT_URL, SUBSCRIBE_URL } from '../constants.js'
import { splitHighlight, splitHighlights } from '../highlight.js'

export default {
	name: 'MarketingView',

	data() {
		return {
			heroPreviewLight,
			heroPreviewDark,
			contactUrl: CONTACT_URL,
			subscribeUrl: SUBSCRIBE_URL,
			chevronIcon,
			dotPatternImage,
			layersIcon,
			activeViewId: 'board',
			// The first question starts open, as in the design.
			// Only one answer is open at a time; null when all are closed.
			openFaqId: 'about',
		}
	},

	computed: {
		/** Questions of the FAQ section, with the answers supplied by the product team. */
		faqs() {
			return [
				{
					id: 'about',
					question: t('nexeno_theme', 'What is Nexeno Project?'),
					answer: t('nexeno_theme', 'A project and task management app that runs inside your own Nextcloud. Your team plans projects, tracks tasks, records time and holds meetings without leaving Nextcloud.'),
				},
				{
					id: 'server',
					question: t('nexeno_theme', 'Do we need a new server or account?'),
					answer: t('nexeno_theme', 'No. Nexeno Project installs as an app in the Nextcloud you already run. People sign in with their existing Nextcloud accounts, including single sign-on.'),
				},
				{
					id: 'pricing',
					question: t('nexeno_theme', 'How is Nexeno Project priced?'),
					// No seat counts or prices here: they change, and the app only updates with a release.
					answer: t('nexeno_theme', 'Per seat: you pay for the people who use it, and small teams can start for free. Clients you invite to a project don\'t take a seat.'),
					link: {
						href: CONTACT_URL,
						label: t('nexeno_theme', 'Ask us about current plans and prices'),
					},
				},
				{
					id: 'data',
					question: t('nexeno_theme', 'Where is our data stored?'),
					answer: t('nexeno_theme', 'On your own Nextcloud server. Projects, tasks, comments, files and time entries never leave it. To check your licence, the app tells our licence service only your server\'s ID, how many seats are in use and which Nexeno apps are installed. It sends no project content and no personal data about your team.'),
				},
				{
					id: 'integrations',
					question: t('nexeno_theme', 'Which Nextcloud apps does it work with?'),
					answer: t('nexeno_theme', 'Files, Talk, Calendar, Notifications, Activity and Search. Project files live in Nextcloud Files, meetings and chat run on Talk, and due dates appear in your calendar.'),
				},
				{
					id: 'clients',
					question: t('nexeno_theme', 'Can we work with clients in it?'),
					answer: t('nexeno_theme', 'Yes. Add a client to a project and they see only that project and the tasks you choose to share. Clients use a normal Nextcloud account and don\'t take a seat.'),
				},
				{
					id: 'permissions',
					question: t('nexeno_theme', 'Can we control who sees and does what?'),
					answer: t('nexeno_theme', 'Yes. Built-in roles cover administrators, project managers, team leaders and members, and you can create your own roles. For each part of the app (projects, tasks, comments, files, time, reports and more), you decide whether a role can view, create, change or delete. A person\'s role applies across all of their projects.'),
				},
				{
					id: 'time',
					question: t('nexeno_theme', 'Does it track time?'),
					answer: t('nexeno_theme', 'Yes. People record time against tasks with a timer or by hand, then submit their week. An administrator approves it. Reports count approved time only, so the figures you share are reliable.'),
				},
				{
					id: 'views',
					question: t('nexeno_theme', 'How do we see our work?'),
					answer: t('nexeno_theme', 'In lists, boards, a calendar, a timeline and a Gantt chart, with milestones to mark key dates. Each project shows only the views it needs.'),
				},
				{
					id: 'gdpr',
					question: t('nexeno_theme', 'Is it GDPR compliant?'),
					answer: t('nexeno_theme', 'It\'s built for it. Nexeno keeps a record of every field that holds personal data, why it\'s held and for how long. You can export or erase a person\'s data on request, and a tamper-evident audit log records important changes. Because everything stays on your server, you remain in control as the data controller.'),
				},
				{
					id: 'languages',
					question: t('nexeno_theme', 'Which languages does it support?'),
					answer: t('nexeno_theme', 'Nexeno Project follows each person\'s Nextcloud language, and names you enter, such as roles and statuses, can be given in more than one language.'),
				},
			]
		},

		audiences() {
			return [
				{
					id: 'enterprises',
					icon: officeBuildingIcon,
					title: t('nexeno_theme', 'Enterprises'),
					description: t('nexeno_theme', 'Carry fewer outside processors in your data protection register.'),
				},
				{
					id: 'public-sector',
					icon: bankIcon,
					title: t('nexeno_theme', 'Public sector and NGOs'),
					description: t('nexeno_theme', 'Meet your rules on where data lives, without a foreign cloud service.'),
				},
				{
					id: 'education',
					icon: schoolIcon,
					title: t('nexeno_theme', 'Education'),
					description: t('nexeno_theme', 'Keep student and research data under the control of the institution.'),
				},
			]
		},

		privacyHeading() {
			return splitHighlights(t('nexeno_theme', 'Your <span>data</span> stays <span>yours.</span> Every field has a reason.'))
		},

		privacyItems() {
			return [
				{
					id: 'server',
					title: t('nexeno_theme', 'Stays on your server'),
					description: t('nexeno_theme', 'Projects, tasks and hours are stored in your own Nextcloud. Nothing is sent to us or to any outside service.'),
				},
				{
					id: 'fields',
					title: t('nexeno_theme', 'Every field is accounted for'),
					description: t('nexeno_theme', 'Each field that holds personal data records why it is kept, on what legal basis and for how long. Your data protection officer can read the list at any time.'),
				},
				{
					id: 'own-data',
					title: t('nexeno_theme', 'People see their own data'),
					description: t('nexeno_theme', 'Each person has a "My data and privacy" page. It shows what is stored about them and why, and they can download it with their Nextcloud account export.'),
				},
				{
					id: 'erasure',
					title: t('nexeno_theme', 'Erasure that keeps the books right'),
					description: t('nexeno_theme', 'When a person is erased, their name is replaced with a pseudonym. Hours you must keep for billing stay, without the person behind them.'),
				},
				{
					id: 'audit-log',
					title: t('nexeno_theme', 'A log that can\'t be rewritten'),
					description: t('nexeno_theme', 'Every change to sensitive data is recorded in a sealed audit log. An administrator can check that no entry was altered and export it with proof.'),
				},
				{
					id: 'clients',
					title: t('nexeno_theme', 'Clients see only what you share'),
					description: t('nexeno_theme', 'A client signs in to the same Nextcloud user, but sees one project and only the tasks you chose for them.'),
				},
			]
		},

		heroChips() {
			return [
				{ id: 'self-hosted', icon: userRoundCheckIcon, label: t('nexeno_theme', 'Self-hosted') },
				{ id: 'gdpr', icon: shieldCheckIcon, label: t('nexeno_theme', 'GDPR-ready') },
				{ id: 'no-data-leaves', icon: lockKeyholeIcon, label: t('nexeno_theme', 'No data leaves your server') },
			]
		},

		viewsHeading() {
			return splitHighlight(t('nexeno_theme', 'The same work, <span>six ways.</span>'))
		},

		/**
		 * Tabs of the views section, each with a light and a dark screenshot (Figma: Nexeno Suite,
		 * the "Nexeno-trace 1" layer of each view's light and dark frame, cropped as Figma shows it).
		 */
		views() {
			return [
				{ id: 'board', label: t('nexeno_theme', 'Board'), image: boardViewLight, imageDark: boardViewDark },
				{ id: 'list', label: t('nexeno_theme', 'List'), image: listViewLight, imageDark: listViewDark },
				{ id: 'dashboard', label: t('nexeno_theme', 'Dashboard'), image: dashboardViewLight, imageDark: dashboardViewDark },
				{ id: 'gantt', label: t('nexeno_theme', 'Gantt chart'), image: ganttViewLight, imageDark: ganttViewDark },
				{ id: 'calendar', label: t('nexeno_theme', 'Calendar'), image: calendarViewLight, imageDark: calendarViewDark },
				{ id: 'timeline', label: t('nexeno_theme', 'Timeline'), image: timelineViewLight, imageDark: timelineViewDark },
			]
		},

		activeView() {
			return this.views.find((view) => view.id === this.activeViewId) ?? this.views[0]
		},

		secondLine() {
			return splitHighlight(t('nexeno_theme', 'native to <span>Nextcloud.</span>'))
		},
	},

	methods: {
		t,

		/**
		 * Arrow keys, Home and End move between tabs and select them (WAI-ARIA tabs pattern).
		 *
		 * @param {KeyboardEvent} event The keydown on the tab list
		 */
		moveTabFocus(event) {
			const index = this.views.findIndex((view) => view.id === this.activeViewId)
			const last = this.views.length - 1
			const next = {
				ArrowRight: index === last ? 0 : index + 1,
				ArrowLeft: index === 0 ? last : index - 1,
				Home: 0,
				End: last,
			}[event.key]
			if (next === undefined) {
				return
			}
			event.preventDefault()
			this.activeViewId = this.views[next].id
			this.$refs.tabs[next]?.focus()
		},

		/**
		 * Opens one FAQ answer and closes the one that was open; clicking the open question closes it.
		 *
		 * @param {string} id The question id
		 */
		toggleFaq(id) {
			this.openFaqId = this.openFaqId === id ? null : id
		},
	},
}
</script>
