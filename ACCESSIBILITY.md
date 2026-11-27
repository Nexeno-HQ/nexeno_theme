<!--
  - SPDX-FileCopyrightText: 2026 Nexeno contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Accessibility Statement

Nexeno Theme aims to meet the [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
at level AA, the level required by EN 301 549 and the European Accessibility Act.

## Conformance status

**Partially conformant.** Parts of the theme do not yet fully meet WCAG 2.1 AA. The known gaps are listed below.

The theme has not yet had a full accessibility audit. This statement is based on a review of the code and on the
automated tests that come with the app.

Each user decides whether to use the theme. With the theme off, Nextcloud's own accessibility applies, unchanged.

## What works

- **Nextcloud's high-contrast themes** work on top of Nexeno Light and Nexeno Dark. They also turn on when the
  device asks for more contrast. Text then has a contrast ratio of at least 7:1. Automated tests check this.
- **Reduced motion.** When the device is set to reduce motion, hover animations and smooth scrolling are turned off.
- **OpenDyslexic font.** Users who chose this font in Nextcloud keep it with the theme on.
- **Light, dark and automatic.** "System default" follows the device's light or dark setting.
- **Translated.** The theme's own text is available in 12 languages, and it follows the language set in Nextcloud.
- **Keyboard focus.** Buttons, links and fields show a focus outline when you reach them with the keyboard
  (`:focus-visible`).

## Known limitations

| Area | Problem | WCAG criterion |
| --- | --- | --- |
| Windows high-contrast mode | The theme does not yet adapt to Windows contrast themes (forced colours). Some borders and icons may not show. | 1.4.11 Non-text Contrast |
| Keyboard focus | The theme removes the default focus outline in some places. Not every place has been checked yet, so in some places you may not see where the keyboard focus is. | 2.4.7 Focus Visible |
| Untested areas | Screen readers, 200% zoom and text spacing have not yet been tested across all supported Nextcloud apps. | Several |

As a workaround for these issues, any user can turn the theme off under
*Personal settings → Appearance and accessibility* and use Nextcloud's standard look.

## Planned work

1. Support Windows high-contrast mode (`forced-colors`).
2. Check every place where the focus outline is removed, and put back a visible focus style where one is missing.
3. Run a full WCAG 2.1 AA audit with the keyboard, a screen reader (NVDA and VoiceOver), 200% zoom and Windows
   high-contrast mode, then update this statement with the results.

## Feedback

If something in the theme is hard to use, please tell us:

- [Open an issue](https://github.com/Nexeno-HQ/nexeno_theme/issues) with your Nextcloud version, the app, your
  browser and any assistive technology you use.
- Or email support@nexeno.io.

We aim to reply within 5 working days.

## About this statement

This statement applies to Nexeno Theme 1.2.x on Nextcloud 32 to 35. It was written on 27 November 2026 and will be
updated after the audit described above.
