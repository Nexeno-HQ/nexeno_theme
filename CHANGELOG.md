<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Changelog

All notable changes to this project are documented in this file.

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
