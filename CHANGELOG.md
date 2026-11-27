<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Changelog

All notable changes to this project are documented in this file.

## 1.2.0 - 2026-11-27

### Added
- Nextcloud 36 support as a pre-release. The app can be installed on Nextcloud 36 and uses the Nextcloud 35
  adjustments there; full support follows once Nextcloud 36 is final and tested.
- Reduced motion: when the device asks for less motion, the theme's hover fades and other transitions end at once
  and settings pages no longer scroll smoothly. Loading spinners keep turning. Nothing changes for others.
- High contrast with Nexeno Light and Dark. Nextcloud's high-contrast themes no longer get switched off while the
  theme is on: choosing one, or a device that asks for more contrast, shows the Nexeno look in high-contrast colours
  (text at 7:1 or more, WCAG AAA) together with Nextcloud's own high-contrast theme, so the two never mix. A
  high-contrast theme chosen in Nextcloud decides light or dark ("Dark theme with high contrast mode" is always
  dark); with the device setting, the Nexeno variant does. The last choice wins: picking System default, Light or
  Dark in the Nexeno section (or on the overview page) turns Nextcloud's high contrast off again and applies that
  option. While high contrast is on, none of the three shows as chosen and a short note says so. Nextcloud's other
  themes stay locked while the Nexeno theme is on. Pages for users without high contrast are unchanged.
- A "Show Nexeno Theme in the app menu" switch below the theme options, shown to administrators only. Turning it off
  hides the *Nexeno Theme* entry from the app menu for everyone; the theme and its settings keep working. It is on by
  default. Also available as `occ config:app:set nexeno_theme app_menu --value=no`.
- `occ nexeno_theme:purge-settings --force` erases every Nexeno theme setting (all users' settings and the
  site-wide switches) before the app is removed, and first gives users back any backed-up Nextcloud background and
  colours. Disabling the app still keeps every setting.
- An accessibility statement (`ACCESSIBILITY.md`) listing what the theme supports and its known gaps, and the README
  in German and French.

### Changed
- Faster pages: the stylesheet's 3,478 "which app is open" checks no longer use `:has()`, which made the browser
  re-check the whole page on every change. The build (`scripts/lower-app-has.mjs`) rewrites them to a
  `data-nexeno-app` attribute on `<html>`, set before the first paint. The look does not change.
- Backups of users' own Nextcloud background and colours, kept by older versions, are given back once during the
  app update instead of being checked on every page load.
- Updated the bundled libraries (Nextcloud Vue components, Vue and fast-xml-parser) to include their security fixes.

### Fixed
- Files trash bin: the theme's script no longer runs on every frame while the trash bin is open.
- Files: shared files get their shared styling in every language, not only in English.
- Photos: the "Tagged photos" list gets its layout in every language, not only in English.
- High contrast: when Nextcloud refuses to turn it off (for example after the session ended), the settings page now
  shows an error instead of silently keeping it.
- High contrast: turning the theme off and on again on the settings page keeps the chosen variant instead of
  switching to System default.
- Pages for users who have not turned the theme on no longer depend on an internal Nextcloud class.

## 1.1.1 - 2026-11-20

### Changed
- The App Store description no longer includes a rating request.

## 1.1.0 - 2026-11-19

### Added
- A "System default theme" option, listed first, that shows Nexeno Light or Nexeno Dark to match the device's light
  or dark setting and follows it when it changes. It is preselected for users who have not chosen a variant yet.
- A "Use Nexeno look on the login page" switch below the theme options, shown to administrators only. It turns the
  Nexeno login page on or off for the whole instance (the login page is shown before anyone signs in, so it cannot
  follow a per-user choice). It is on by default, so existing installs keep the styled login page. Also available as
  `occ config:app:set nexeno_theme login_style --value=no`.
- Nexeno styling for the profile page (`/u/<user>`) on Nextcloud 32 to 35: the avatar, name, pronouns, "Edit profile",
  primary action and contact buttons share one row in a cover banner, with the details, headline and biography in a
  full-width card below. Mobile keeps a stacked layout.
- Translations in Czech, Danish, Finnish and Norwegian, and German in both forms: informal (du, `de`) and formal
  (Sie, `de_DE`), as Nextcloud offers them.
- Nexeno styling for Cospend.
- A "Nexeno project" banner on the "Nexeno Theme" overview page and a "Coming soon" page about Nexeno Project, with
  its project views, privacy and FAQs. "Notify me" and "Talk to us about your requirements" open nexeno.io. Closing
  the banner is remembered in the user's browser.
- A rating popup on the "Nexeno Theme" overview page, shown 7 days after the app was installed: "Rate it" opens the
  App Store, "Do not show again" hides it for good, and closing it asks again 7 days later.
- "Rate this app" and "Report a problem" links in the overview page's side menu.

### Removed
- The Polish translation. Polish accounts see the theme in English.

### Changed
- Updated styling for Tasks, Dashboard, Files, Office and Deck.
- The theme options are listed one per row, preview beside the text, as Nextcloud lists its own themes, and are
  titled "System default theme", "Nexeno light theme" and "Nexeno dark theme".
- The "Nexeno Theme" overview page shows the same three options as cards with a preview. Clicking a preview or its
  title selects that option.
- New screenshots on the "Nexeno Theme" overview page and the Nexeno Project page, in a light and a dark version that
  follow the theme: Nexeno Light or Dark, or with the theme off, Nextcloud's own light or dark setting. This covers the
  hero images, the "A better experience across Nextcloud" cards and the six views (Board, List, Dashboard, Gantt chart,
  Calendar, Timeline). The cards show each app close up, as in the design, and their descriptions are 14 px.

### Fixed
- In dark mode, the "Free Forever" label, the check marks in the overview list and the bell next to "Notify me" were
  dark blue on a dark background. They now use the lighter dark-mode blue.
- Light corners no longer show around the hero image in dark mode.

If the theme helps you, a [rating on the App Store](https://apps.nextcloud.com/apps/nexeno_theme) helps us.

## 1.0.0 - 2026-11-06

First public release, for Nextcloud 32, 33, 34 and 35.

### Added

#### Light and Dark
- Nexeno Light and Nexeno Dark, switched on per account under Personal settings → Appearance and accessibility.
- The theme is off until each user turns it on. Turning it off brings back the user's own Nextcloud appearance
  settings, which the theme never changes.
- Switching between Light, Dark and off applies straight away, without reloading, in every open tab.
- A "Nexeno Theme" overview page in the app menu, with a switch to turn the theme on or off.

#### Look and feel
- Restyled navigation, header menus, dialogs, popovers, sidebars, search, settings pages and the login page.
- Layouts for Files, Photos, Dashboard, Activity, Calendar, Contacts, Deck, Notes, Tasks, Talk, Collectives, Teams,
  Text, Mail, Office and the App store.
- Version-specific adjustments for Nextcloud 32, 33 and 35.
- Logical CSS properties throughout, so layouts also mirror correctly in right-to-left languages.

#### Accessibility, languages and privacy
- The OpenDyslexic font stays on for users who chose it.
- Nexeno apps such as Nexeno Project keep their own built-in design.
- Available in English, German, French, Dutch, Italian, Spanish, Swedish, Polish and Portuguese (Brazil).
- Loads nothing from outside services. The chosen variant is the only stored setting, and it is included in
  Nextcloud's account export.

If the theme helps you, a [rating on the App Store](https://apps.nextcloud.com/apps/nexeno_theme) helps us.
