---
name: FixNear
status: final
description: Free, mobile-first web marketplace in Sri Lanka connecting customers with repair technicians and workshops via WhatsApp.
sources:
  - _bmad-output/planning-artifacts/prds/prd-fixnear-2026-10-13/prd.md
  - _bmad-output/planning-artifacts/briefs/brief-fixnear-2026-10-13/brief.md
updated: 2026-10-13
colors:
  surface-base: '#F8F9FA'
  surface-raised: '#FFFFFF'
  surface-sunken: '#EDF0F2'
  ink-primary: '#0F172A'
  ink-secondary: '#475569'
  ink-muted: '#94A3B8'
  ink-inverse: '#FFFFFF'
  primary: '#0F2942'
  primary-hover: '#1B3A5B'
  primary-subtle: '#EBF2F7'
  accent-amber: '#D97706'
  accent-amber-subtle: '#FEF3C7'
  whatsapp: '#25D366'
  whatsapp-hover: '#1EBE5D'
  whatsapp-text: '#075E54'
  border-subtle: '#E2E8F0'
  border-strong: '#CBD5E1'
  status-success: '#15803D'
  status-success-subtle: '#DCFCE7'
  status-warning: '#B45309'
  status-warning-subtle: '#FEF3C7'
  status-error: '#B91C1C'
  status-error-subtle: '#FEE2E2'
typography:
  font-family:
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    sinhala-fallback: '"Iskoola Pota", "Noto Sans Sinhala", sans-serif'
    tamil-fallback: '"Latha", "Noto Sans Tamil", sans-serif'
  display:
    fontSize: '28px'
    lineHeight: '1.25'
    fontWeight: '700'
  heading-1:
    fontSize: '22px'
    lineHeight: '1.3'
    fontWeight: '700'
  heading-2:
    fontSize: '18px'
    lineHeight: '1.35'
    fontWeight: '600'
  heading-3:
    fontSize: '16px'
    lineHeight: '1.4'
    fontWeight: '600'
  body:
    fontSize: '16px'
    lineHeight: '1.5'
    fontWeight: '400'
  body-medium:
    fontSize: '16px'
    lineHeight: '1.5'
    fontWeight: '500'
  meta:
    fontSize: '14px'
    lineHeight: '1.4'
    fontWeight: '400'
  meta-medium:
    fontSize: '14px'
    lineHeight: '1.4'
    fontWeight: '600'
  badge:
    fontSize: '12px'
    lineHeight: '1.3'
    fontWeight: '700'
rounded:
  none: '0px'
  sm: '4px'
  md: '8px'
  lg: '12px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '8': '32px'
  '10': '40px'
  '12': '48px'
  touch-target: '44px'
components:
  wordmark:
    color: '{colors.primary}'
    fontSize: '{typography.heading-1.fontSize}'
    fontWeight: '{typography.heading-1.fontWeight}'
  area-pill:
    background: '{colors.surface-sunken}'
    color: '{colors.ink-primary}'
    borderRadius: '{rounded.full}'
    border: '1px solid {colors.border-subtle}'
    minHeight: '{spacing.touch-target}'
  whatsapp-button:
    background: '{colors.whatsapp}'
    color: '{colors.ink-inverse}'
    borderRadius: '{rounded.full}'
    fontWeight: '{typography.heading-3.fontWeight}'
    minHeight: '{spacing.touch-target}'
    fontSize: '{typography.body.fontSize}'
  verified-badge:
    background: '{colors.accent-amber-subtle}'
    color: '{colors.accent-amber}'
    borderRadius: '{rounded.full}'
    fontSize: '{typography.badge.fontSize}'
    fontWeight: '{typography.badge.fontWeight}'
  provider-card:
    background: '{colors.surface-raised}'
    border: '1px solid {colors.border-subtle}'
    borderRadius: '{rounded.md}'
  bottom-sheet:
    background: '{colors.surface-raised}'
    borderTopLeftRadius: '{rounded.lg}'
    borderTopRightRadius: '{rounded.lg}'
---

# FixNear — Design Spine (DESIGN.md)

## Brand & Style

FixNear is a local civic utility, not a flashy lifestyle app. It is built for a resident in Negombo standing in front of a leaking refrigerator or a non-starting vehicle, stressed, impatient, and holding a budget phone on a patchy 3G/4G connection. 

The aesthetic posture is **utilitarian, honest, and ultra-clear**. 

- **Integrity over ornament:** No decorative gradients, no parallax banners, no illustration fluff. Every square pixel serves information discovery and verified trust.
- **The Wordmark:** Clean, geometric sans-serif typography. Set as `Fix` in `{colors.primary}` (`#0F2942`) paired immediately with `Near` in `{colors.ink-primary}` (`#0F172A`), followed by a subtle geometric pin or dot in `{colors.accent-amber}` (`#D97706`). It signals stability, physical location, and immediate neighborhood reliability.
- **Singular Call to Action:** In a sea of utilitarian slate, navy, and off-white, **WhatsApp green (`#25D366`) is preserved exclusively for the WhatsApp contact action**. It is never used for category icons, checkmarks, banners, or badges. When a user sees green on FixNear, it means one thing: *tap here to connect directly on WhatsApp*.

## Colors

The color palette is deliberately disciplined to maximize contrast in bright Sri Lankan sunlight and reduce cognitive load:

- **Canvas Base (`#F8F9FA`):** An engineered off-white canvas. Soft on the eyes, eliminating harsh mobile glare while providing high perceived contrast against pure white cards.
- **Surface Raised (`#FFFFFF`):** Pure white used for content containers, provider cards, search filters, and bottom sheets.
- **Surface Sunken (`#EDF0F2`):** Cool light grey used for non-interactive metadata tags, empty photo placeholders, and text input fields.
- **Deep Navy / Slate Primary (`#0F2942`):** The institutional anchor. Used for the wordmark, header bar accents, primary structural dividers, and active navigation indicators. It communicates civic authority, permanence, and professional security.
- **Ink Primary (`#0F172A`):** Deep slate-black used for all headings, technician names, and critical text. Exceeds WCAG AAA contrast against `{colors.surface-raised}` (contrast ratio > 12:1).
- **Ink Secondary (`#475569`):** Medium slate used for supporting metadata: base town, pricing model descriptions, captions, and secondary labels.
- **Ink Muted (`#94A3B8`):** Light slate used strictly for form field placeholders and non-critical helper text.
- **Amber Accent (`#D97706` / `#FEF3C7` background):** A warm, craftsman amber. Used exclusively for trust signals: the **Verified** badge, the location dot in the wordmark, and prominent pricing highlights (e.g., upfront visiting fees). It feels grounded and certified, avoiding the cold clinical blue of corporate badges.
- **WhatsApp Green (`#25D366` / `#1EBE5D` active):** The conversational trigger. **Strictly reserved for the "Contact on WhatsApp" button and WhatsApp deep link triggers.** Banned from all other interface elements.
- **Borders (`#E2E8F0` hairline / `#CBD5E1` active):** 1px structural hairpins that define cards and input fields without heavy drop shadows.
- **Status Tones:** Functional alerts only (`#15803D` approved, `#B45309` pending verification, `#B91C1C` rejected/suspended).

## Typography

Typography prioritizes legibility, zero-zoom mobile form inputs, and seamless future script compatibility:

- **System Font Stack:** Inherits `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. Zero external webfont download overhead on initial page load ensures rapid First Contentful Paint (< 1.5s) on Sri Lankan 3G/4G networks.
- **Script Expansion Headroom:** Pre-configured font fallbacks for Sinhala (`Iskoola Pota`, `Noto Sans Sinhala`) and Tamil (`Latha`, `Noto Sans Tamil`). Line heights are relaxed (`1.4`–`1.5`) to accommodate the vertical loops and ascenders/descenders of Indic and Brahmic scripts without clipping.
- **16px Input Font Floor:** All text inputs, textareas, and select elements are styled at **`16px` minimum**. This strictly eliminates automatic zoom-in behavior on iOS Safari when focusing form fields.
- **Type Ramp:**
  - `Display` (`28px / 1.25` bold): Hero title on homepage.
  - `Heading 1` (`22px / 1.3` bold): Provider profile name, screen headers.
  - `Heading 2` (`18px / 1.35` semibold): Provider card business name, bottom sheet title, section titles.
  - `Heading 3` (`16px / 1.4` semibold): Subheadings, category card labels, button text.
  - `Body` (`16px / 1.5` regular): Primary descriptions, technician bios, filter labels, form input text.
  - `Meta` (`14px / 1.4` regular): Timestamps, addresses, sub-service secondary tags.
  - `Badge` (`12px / 1.3` bold): "Verified", "Visits Seeduwa", "LKR 1,500 visiting fee".

## Layout & Spacing

- **Mobile-First Container:** Max width `480px` on mobile, centered at max `768px` on tablet, and max `1024px` on desktop with wide utilitarian margins. The user interface never stretches horizontally into unreadable desktop banners.
- **Tap Target Floor:** Every interactive element (buttons, area pills, category chips, checkboxes, inputs) has a minimum touch target bounding box of **`44px × 44px`** (`{spacing.touch-target}`).
- **Spacing Scale:** Modular 4px baseline (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`).
  - Container padding: `16px` (`{spacing.4}`) mobile screen margin.
  - Component gap: `12px` (`{spacing.3}`) between cards; `8px` (`{spacing.2}`) between chips.
  - Form field spacing: `20px` (`{spacing.5}`) vertical rhythm between question blocks.

## Elevation & Depth

FixNear avoids decorative shadows and blur filters which degrade rendering performance on low-end budget smartphones.

- **Tonal Layering:** Hierarchy is achieved via color contrast (`{colors.surface-base}` vs `{colors.surface-raised}`) and 1px borders (`{colors.border-subtle}`).
- **Card Depth:** Flat cards with `1px solid {colors.border-subtle}`. No drop shadow.
- **Bottom Sheet Modal:** Floats on a semi-transparent scrim (`rgba(15, 23, 42, 0.6)`) with a subtle top shadow (`0 -4px 16px rgba(0, 0, 0, 0.12)`) to establish separation from the backdrop.

## Shapes

- **Subtle Rounding (`rounded.md` — 8px):** Applied to provider cards, category tiles, input fields, and modal containers. Crisp, modern, and practical.
- **Pills (`rounded.full` — 9999px):** Applied to the area selector, sub-service filter chips, verified badges, and the primary WhatsApp button. Affords clear tapability.
- **Images:** Clipped to container corners with `8px` radius (`{rounded.md}`).

## Components

→ Composition references: [`mockups/key-search-results.html`](mockups/key-search-results.html), [`mockups/key-whatsapp-sheet.html`](mockups/key-whatsapp-sheet.html), [`mockups/key-zero-results.html`](mockups/key-zero-results.html), [`mockups/key-provider-wizard.html`](mockups/key-provider-wizard.html). Spines win on conflict with any mock or wireframe.

### 1. Header Wordmark & Area Pill
- **Wordmark:** `Fix` in navy `{colors.primary}`, `Near` in slate `{colors.ink-primary}`, trailing dot in amber `{colors.accent-amber}`.
- **Area Selector Pill:** Compact capsule (`{colors.surface-sunken}`, `1px solid {colors.border-subtle}`, padding `8px 14px`, min height `44px`). Displays `📍 Area: [Town] ▾` in `{colors.ink-primary}` bold. Tapping opens a native or lightweight dropdown menu of launch towns.

### 2. Provider Summary Card
- **Container:** `{colors.surface-raised}`, 1px border `{colors.border-subtle}`, 8px radius. Entire card surface is tappable to open the Provider Profile.
- **Header Line:** Business / Personal Name (`{typography.heading-2}`), immediately followed by the **Verified Badge** (`{colors.accent-amber-subtle}` background, `{colors.accent-amber}` text, shield icon + "Verified").
- **Location Tag:**
  - *In-Area Match:* `📍 Based in Negombo` in `{colors.ink-secondary}`.
  - *Cross-Area Match:* Distinct amber-tinted badge: `🚗 Based in Kochchikade • Visits Negombo` in `{typography.meta-medium}`.
- **Specialty Chips:** Up to 3 sub-service tags in `{colors.surface-sunken}` capsules (e.g., `Refrigerator Repair`, `Washing Machine`).
- **Pricing Indicator:** `Visiting Fee: LKR 1,500 • Varies by job` in `{typography.body-medium}` with bold fee.
- **Work Photo Row:**
  - *With Photos:* Horizontal row of up to 3 thumbnails (aspect ratio 4:3, height 72px, radius 6px, object-fit cover).
  - *Without Photos:* Sleek `{colors.surface-sunken}` placeholder bar with subtle tool icon and italicized text: *"No work photos uploaded yet"*.
- **Primary Action:** Full-width WhatsApp button (`{colors.whatsapp}`, white text, WhatsApp icon, "Contact on WhatsApp", min height 48px).

### 3. WhatsApp Bottom Sheet Modal
- **Container:** Slides up from bottom of mobile viewport; max width `480px`, background `{colors.surface-raised}`, rounded top corners `12px`.
- **Scrim:** Dark overlay `rgba(15, 23, 42, 0.6)`. Tapping scrim dismisses sheet.
- **Heading:** *"Contact [Provider Name] on WhatsApp"* (`{typography.heading-2}`).
- **Input Field:** Single text line, placeholder *"Your name (optional)"*, helper caption *"Helps the technician greet you"*. Font size `16px`, height `48px`.
- **Primary CTA:** Full-width green button (`{colors.whatsapp}`): *"Continue to WhatsApp"*.
- **Secondary Action:** Text button centered below: *"Skip and open WhatsApp"*.

### 4. 4-Step Provider Onboarding Wizard
- **Progress Stepper:** Top bar with 4 numbered segmented bars in `{colors.primary}` (completed/active) and `{colors.border-subtle}` (upcoming) + label *"Step X of 4: [Title]"*.
- **Inputs:** Standardized high-contrast form blocks. Mobile phone input includes locked country code prefix `+94` in bold slate, with auto-formatted 9-digit input (`7X XXX XXXX`).
- **Category & Town Checkboxes:** Large touch target selectable tiles (min height `52px`) that invert background to `{colors.primary-subtle}` with `{colors.primary}` border upon selection.
- **Review Summary Screen:** Clean breakdown of all entered details before final submission.

### 5. Admin Queue Moderation Card
- **Mobile-Optimized Layout:** Compact card showing submission timestamp, provider name, phone number, category tags, base area, and photo review grid.
- **1-Tap WhatsApp Ping:** Compact green button with WhatsApp icon: *"Verify on WhatsApp"* (launches prefilled verification message).
- **1-Tap Decision Buttons:** Full-width split action:
  - *"Approve"* (Solid `{colors.status-success}`, white text).
  - *"Reject"* (Outlined `{colors.status-error}`, opens 1-tap rejection modal with preset radio buttons).

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use `{colors.whatsapp}` (`#25D366`) **strictly and exclusively** for WhatsApp contact CTAs | Use green for category tags, checkmarks, success banners, or icons |
| Keep all body copy and input font sizes at **≥ 16px** to avoid iOS Safari viewport scaling | Use 12px or 14px for mobile input text fields |
| Ensure all tappable surfaces provide at least **44px × 44px** touch target padding | Create tight, finger-cramping links or stacked icon buttons |
| Render crisp 1px borders (`{colors.border-subtle}`) on cards for fast rendering on budget devices | Use heavy blur filters, multi-layer box shadows, or backdrop blurs |
| Show explicit "Based in [Base Area], visits [Selected Area]" tags on cross-area cards | Hide provider base town or leave customers guessing if technician travels |
| Reserve Amber (`{colors.accent-amber}`) for trust signals (Verified badge, visiting fees) | Use red, blue, or green badges that conflict with action semantics |
| Include generous line-height (`1.4`–`1.5`) and ample horizontal padding for future Sinhala/Tamil text | Hardcode fixed pixel widths that clip extended Indic script strings |
| Allow entire provider card to navigate to profile while keeping the WhatsApp button directly clickable | Trap the user in micro-tap targets on cards |
