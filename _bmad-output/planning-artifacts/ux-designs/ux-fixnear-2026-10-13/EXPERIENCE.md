---
name: FixNear
status: final
description: Free, mobile-first web marketplace in Sri Lanka connecting customers with repair technicians and workshops via WhatsApp.
sources:
  - _bmad-output/planning-artifacts/prds/prd-fixnear-2026-10-13/prd.md
  - _bmad-output/planning-artifacts/briefs/brief-fixnear-2026-10-13/brief.md
updated: 2026-10-13
---

# FixNear — Experience Spine (EXPERIENCE.md)

## Foundation

FixNear is a mobile-first, server-side rendered (SSR) web application built for Sri Lanka's local repair economy (pilot corridor: Negombo, Kochchikade, Katunayake, Seeduwa). It operates on three distinct user roles:

1. **Customer:** Completely unauthenticated. Zero sign-up, zero login, zero passwords, zero profile creation.
2. **Provider:** Authenticated via mobile number (E.164 `+94...`) and password. No email required.
3. **Admin:** Authenticated via email and password with rate limiting.

`DESIGN.md` is the visual identity reference for color tokens, typography scales, spacing units, and component anatomy. This spine owns **how FixNear behaves, transitions, and handles edge cases**.

## Information Architecture

| Surface | Reached from | Purpose | Key Content & CTAs |
|---|---|---|---|
| **Home & Category Directory** (`/` or `/{area}`) | Direct / Cold Open / Logo tap | Primary entry point; area selection; category discovery | Wordmark, Area Selector Pill (`📍 Area: Negombo ▾`), 4 primary category cards with sub-service tags, Search bar, Provider signup link |
| **Search & Results Directory** (`/{area}/{category-or-subservice-slug}`) | Category card tap / Search query / Direct URL | Browse & filter matching technicians and workshops | Area pill, Sub-service filter chips, Service mode toggle, In-Area provider cards, Cross-Area visiting cards, WhatsApp CTAs |
| **Provider Profile** (`/providers/{area}/{business-name-slug}-{id}`) | Provider card tap | Detailed evaluation of technician skills, pricing, and proof | Full name, Business name, Verified badge, Base area, Address (if workshop), Bio, Sub-services list, Pricing block & Visiting Fee, Photo gallery (up to 10 photos), Sticky "Contact on WhatsApp" CTA |
| **WhatsApp Contact Bottom Sheet** | Tap "Contact on WhatsApp" button on card or profile | Privacy-preserving name collection and deep-link generation | Modal sheet with provider name, optional text input ("Your name (optional)"), "Continue to WhatsApp" button, "Skip and open WhatsApp" link |
| **Zero-Results State** | Search/filter query with zero matching providers | Graceful fallback, demand data capture, concierge support | "No technicians found in [Area]" notice, adjacent launch town quick-links, "Message FixNear on WhatsApp" concierge button |
| **Provider Onboarding Wizard** (`/register`) | "Join as a Repair Provider (Free)" CTA in header/footer | 4-step mobile registration for technicians & shops | Step 1: Phone & Password; Step 2: Name & Shop; Step 3: Services, Mode & Fees; Step 4: Photo uploads; Review & Submit |
| **Submission Confirmation** (`/register/pending`) | Wizard completion | Sets operational expectations for pending verification | "Listing Submitted!" banner, explanation of Admin WhatsApp verification call/chat within 12 hours (daytime < 2 hours) |
| **Provider Login** (`/login`) | Header "Provider Login" link | Authenticate existing technicians | Phone number input (`+94...`), password input, "Forgot password" admin-assisted link |
| **Provider Dashboard & Editor** (`/dashboard`) | Successful provider login | Self-manage bio, sub-services, fees, areas served, and photos | Verification status banner, listing preview link, edit forms, critical field re-verification alert warning |
| **Admin Login** (`/admin/login`) | Direct URL | Secure platform owner authentication | Email and password inputs, rate limiting protection |
| **Admin Review Queue** (`/admin/queue`) | Admin login | Mobile-optimized triage of new and edited listings | Chronological submission cards, provider details, photo review grid, 1-tap "Verify on WhatsApp" ping, 1-tap Approve, 1-tap Reject |
| **Admin Rejection Modal** | Admin taps "Reject" on queue card | Structured rejection feedback | Preset radio choices: "Phone unreachable", "Photos not clear/not genuine", "Outside launch area", "Incomplete details", optional custom note field |
| **Admin Taxonomy & Areas** (`/admin/taxonomy`) | Admin navigation | Manage service categories, sub-services, and active pilot towns | CRUD forms for categories, sub-service display order, active area toggles |

→ Composition references: [`mockups/key-search-results.html`](mockups/key-search-results.html), [`mockups/key-whatsapp-sheet.html`](mockups/key-whatsapp-sheet.html), [`mockups/key-zero-results.html`](mockups/key-zero-results.html), [`mockups/key-provider-wizard.html`](mockups/key-provider-wizard.html). Spines win on conflict with any mock or wireframe.

## Voice and Tone

FixNear communicates with absolute clarity and warmth. Our users are either dealing with stressful equipment breakdowns or managing busy trade businesses from their phones.

| Context | Do | Don't |
|---|---|---|
| **Area Context** | "Showing technicians in Negombo." | "Geolocating your IP coordinates." |
| **Cross-Area Match** | "Based in Kochchikade • Visits Negombo" | "Out-of-zone provider with traveling surcharge." |
| **WhatsApp Handoff** | "Your name (optional) — helps the technician greet you." | "Enter your PII to generate contact lead." |
| **Visiting Charges** | "Visiting Fee: LKR 1,500 • Final price depends on parts and labor." | "Call for quote / Hidden diagnosis fee." |
| **Empty State** | "No refrigerator technicians found in Seeduwa yet. Message FixNear on WhatsApp and we will find one for you." | "Error 404: Zero records returned." |
| **Rejection Feedback** | "Your listing is paused: Phone number unreachable on WhatsApp. Please check your number and resubmit." | "Submission rejected by administrator." |
| **Terminology** | Strictly use **"Provider"** or **"Technician"**. | Never use "Vendor", "Supplier", "Merchant", or "Gig Worker". |

## Component Patterns

### 1. Area Selector Pill & Persistence
- **Behavior:** The area pill is positioned in the sticky header (`📍 Area: [Town] ▾`).
- **Initial Load:** Checks `localStorage` for `fixnear_area`. If found, restores it. If not found, defaults to `'negombo'` and saves `'negombo'` to `localStorage`.
- **Town Switch:** When a user taps the pill and selects a new town (e.g. `Kochchikade`):
  1. Updates `localStorage`.
  2. If currently on a results page (`/negombo/refrigerator-repair`), smoothly navigates to `/kochchikade/refrigerator-repair`, re-executing the query for the new town without losing active filter chips.
  3. If currently on a provider profile, updates the global stored area but remains on the profile.

### 2. Provider Summary Card
- **Click Affordance:** The entire surface of the card is an anchor link to `/providers/{area}/{business-name-slug}-{id}`.
- **WhatsApp Button Isolation:** The primary "Contact on WhatsApp" button has `event.stopPropagation()` bound to prevent card navigation when tapping the contact CTA directly.
- **Thumbnail Rows:** Displays up to 3 thumbnails. Tapping any thumbnail navigates into the full profile (lightbox opens only on the profile).
- **Ranking Rules:**
  1. Primary tier: Exact in-area matches (`provider.base_area == selected_area`).
  2. Secondary tier: Cross-area visiting matches (`provider.base_area != selected_area` AND `provider.service_mode` in `['comes_to_customer', 'both']` AND `selected_area` in `provider.areas_served`). Labeled with `{colors.accent-amber}` badge: *"Based in [Base Area] • Visits [Selected Area]"*.
  3. Tie-breaker: Listings with work photos rank strictly above listings with placeholder images.
  4. Exclusion: Providers configured strictly as `customer_comes_to_shop` **never** appear in cross-area results.

### 3. WhatsApp Contact Bottom Sheet
- **Trigger:** Tap "Contact on WhatsApp" on any card or profile.
- **Behavior:** Slides up over the lower 40% of the screen. Input field auto-focuses on desktop, but waits for explicit tap on mobile to prevent abrupt keyboard shifts.
- **Action "Continue to WhatsApp":**
  1. Reads customer name from input.
  2. Constructs `wa.me/<E164_PHONE>?text=...` using Template A (with name).
  3. Dispatches atomic background analytics event (`ContactEvent`) recording `provider_id`, `customer_area_id`, `sub_service_id`, and `timestamp`. **Customer name is discarded immediately client-side and never sent to server.**
  4. Triggers OS deep link to WhatsApp.
- **Action "Skip and open WhatsApp":**
  1. Constructs `wa.me/<E164_PHONE>?text=...` using Template B (without name).
  2. Dispatches `ContactEvent`.
  3. Triggers OS deep link to WhatsApp.
- **Drop-off Guardrail:** If abandonment on this sheet exceeds 15% across 50 consecutive opens, the system flags an admin alert to disable the name prompt.

### 4. 4-Step Provider Registration Wizard
- **Progress Preservation:** All entered data is saved to `sessionStorage` on every field change. If a technician accidentally refreshes or leaves the tab, progress is restored seamlessly.
- **Step Breakdown:**
  - **Step 1: Phone & Password:** E.164 phone number (`+94` fixed prefix) + minimum 8-character password.
  - **Step 2: Who You Are & Your Shop:** Personal Name, optional Business Name, Base Town dropdown (Negombo, Kochchikade, Katunayake, Seeduwa), optional Workshop Address, short description bio.
  - **Step 3: Services, Mode & Fees:** Primary category selection, sub-service multi-select check chips, Service Mode (`Visits customer`, `Customer comes to shop`, `Both`), Areas Served multi-select chips, Pricing Model (`Fixed`, `Starting from`, `Varies by job`), upfront Visiting/Inspection Fee in LKR.
  - **Step 4: Work Photos:** File upload supporting camera capture and gallery selection. Shows thumbnail previews with delete icons. Client compresses images to WebP (< 500KB) before upload. Clear microcopy: *"Technicians with at least 1 photo get 3x more customer calls on WhatsApp"*.
  - **Review & Submit:** Read-only summary sheet. "Submit Listing for Verification" button.

### 5. Admin Review Queue & Moderation
- **Mobile First Interface:** Designed for one-thumb triage on a smartphone.
- **1-Tap WhatsApp Verification Ping:** Tapping the green WhatsApp icon launches WhatsApp with pre-filled message:
  > *"Hello [Provider Name], this is Dhanushka from FixNear reviewing your listing application for [Business Name]. Are you available for repairs in [Base Area]?"*
- **1-Tap Approval:** Single tap on "Approve" sets `is_verified = true`, `status = 'approved'`, and immediately publishes listing to public search and `sitemap.xml`.
- **1-Tap Rejection with Reasons:** Tapping "Reject" opens modal with 4 instant radio choices:
  1. `Phone number unreachable on WhatsApp`
  2. `Photos not clear or not genuine local work`
  3. `Outside launch service area`
  4. `Incomplete service or pricing details`
  Plus an optional custom text note. When submitted, provider's dashboard updates immediately with this exact explanation.

## State Patterns

| State | Surface | Treatment & User Experience |
|---|---|---|
| **Cold Open / Initial Load** | Home / Directory | Server-side rendered HTML renders instantly. If dynamic client fetch occurs, render skeleton cards with light grey pulsing boxes (`{colors.surface-sunken}`) matching card height. No full-page blocking spinners. |
| **Empty Results** | Directory (`/{area}/search`) | Friendly illustration/icon, clear header: *"No technicians found for [Service] in [Area]"*. Suggestions to check adjacent towns. Prominent green button: *"Message FixNear on WhatsApp"* to trigger concierge admin matching. Search query is logged to database as a provider recruitment demand signal. |
| **No Photos on Card** | Provider Card | Neutral `{colors.surface-sunken}` placeholder box featuring a subtle service category icon and caption: *"No work photos uploaded yet"*. Card ranks below photo-complete listings. |
| **Pending Approval** | Provider Dashboard | Prominent amber alert banner: *"Listing Submitted — Pending Verification. FixNear Admin will reach out via WhatsApp within 12 hours (daytime < 2 hours)."* Form is locked for editing while under review. |
| **Re-verification Triggered** | Provider Dashboard | When an approved provider edits **Phone Number** or **Business Name**, an alert appears: *"Notice: Updating your contact phone number or business name requires quick re-verification. Your profile remains active, but your Verified badge will be temporarily paused until confirmed."* |
| **Listing Rejected** | Provider Dashboard | Crimson alert banner (`{colors.status-error-subtle}`): *"Listing Needs Update: [Reason from Admin]. Please update the fields below and tap 'Resubmit for Verification'."* |
| **Slow Network (3G/4G)** | Image Upload (Wizard) | Progress indicator shows exact status: *"Compressing 1 of 3... (45%)"* → *"Uploading... Please don't close this screen."* If connection drops, clear retry button appears beside the failed photo. |

## Interaction Primitives

- **Touch Targets:** Minimum 44px × 44px on all buttons, chips, links, checkboxes, and select dropdowns (`{spacing.touch-target}`).
- **Zero Hover Reliance:** No information is hidden behind hover tooltips or mouseenter events. All badges, fees, and areas are permanently visible.
- **Sheet Gestures:** Bottom sheet supports touch drag-down gesture to dismiss, tap on dimmed background scrim to dismiss, and desktop `Escape` key.
- **Form Inputs:** 
  - All input fields enforce `16px` font size to prevent automatic iOS Safari viewport zoom.
  - Active fields display a sharp 2px border in `{colors.border-strong}`.
  - Form validation is inline and conversational; error messages appear directly below the affected input in `{colors.status-error}` text.

## Accessibility Floor (WCAG 2.1 AA)

- **Contrast Ratios:** All body text in `{colors.ink-primary}` on `{colors.surface-raised}` delivers a contrast ratio > 12:1 (exceeding AAA). Meta text in `{colors.ink-secondary}` delivers > 5.5:1 (exceeding AA).
- **Visible Keyboard Focus:** 2px high-contrast outline (`{colors.primary}`) on all focusable elements when navigating via keyboard Tab.
- **Screen Reader Semantics:**
  - Area pill: `aria-label="Active service area: Negombo. Tap to change area."`
  - Verified badge: `role="status"` with `aria-label="Verified FixNear Technician: Identity and phone confirmed by FixNear"`.
  - WhatsApp CTA: `aria-label="Contact [Provider Name] on WhatsApp"`.
  - Photo Thumbnails: Descriptive alt text: `alt="Past repair work photo [N] for [Business Name]"`.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is detected, bottom sheet slides and skeleton pulses are replaced with instantaneous visibility toggles.

## Inspiration & Anti-patterns

- **Lifted from Civic Utilities (e.g. GOV.UK, Craigslist):** Radically fast load times, zero login requirements for searchers, extreme functional clarity, no intrusive popups or app-install banners.
- **Lifted from Food & Delivery UX (e.g. Swiggy, Zomato):** Persistent header location pill remembered in `localStorage`; lightweight bottom sheet for handoff.
- **Rejected Anti-pattern — Customer Sign-up Wall:** Forcing customers to create an account or verify an SMS OTP just to see phone numbers will kill adoption. Fixed: Zero customer login.
- **Rejected Anti-pattern — In-App Chat & Escrow:** Building custom messaging or payments creates friction and mistrust in Sri Lanka. Fixed: Direct handoff to WhatsApp where customers and technicians already conduct daily business.
- **Rejected Anti-pattern — Customer Reviews in Pilot:** Star ratings during early launch create liquidity distortion and unfair 1-star retaliation. Fixed: Admin manual verification of real identity and photos replaces public star reviews for Phase 1.

## Responsive & Platform

- **Mobile Viewport (320px – 480px):** Single-column layout. Sticky header with logo and area pill. Provider cards stack vertically with full-width WhatsApp buttons.
- **Tablet / Desktop Viewport (768px – 1024px):** Centered container at max width 768px (directory) and 1024px (admin dashboard). Preserves mobile ergonomics while preventing unreadable wide-line stretches.
- **Bandwidth Optimization:**
  - Zero external webfonts; native system typography.
  - Responsive WebP images with `srcset` delivering small thumbnails (`thumb_url`) to results lists and full displays (`image_url`) only on profile lightbox.
  - Initial HTML bundle < 50KB gzipped. Target LCP < 2.5s on Sri Lankan cellular connections.

## Key Flows

### Flow 1 — Urgent Refrigerator Repair in Negombo
**Protagonist:** Mary (34, mother of two, residing in Periyamulla, Negombo. It is 8:45 PM; the family refrigerator has stopped cooling, ice cream is melting, and tomorrow's meat will spoil.)

1. Mary opens `fixnear.lk` on her mobile Chrome browser over a 4G connection.
2. The page loads instantly (< 1.5s). The header displays `FixNear` with `📍 Area: Negombo ▾`.
3. She taps the **Home Appliances** category tile, which reveals sub-service chips.
4. She taps **Refrigerator Repair**.
5. The results list renders 4 verified providers. The top card is *Kamal Cool Care*:
   - Verified Badge (Amber shield + "Verified")
   - `📍 Based in Negombo`
   - `Visiting Fee: LKR 1,500 • Varies by job`
   - 3 clean photos showing compressor replacement and manifold gauges.
6. She taps the card to review his full profile. She reads his 15-year background bio and confirms he works on Samsung invertor fridges.
7. She taps the prominent green **"Contact on WhatsApp"** button.
8. The bottom sheet slides up: *"Your name (optional) — helps the technician greet you"*.
9. She types `Mary` and taps **"Continue to WhatsApp"**.
10. **Climax Beat:** Mobile WhatsApp launches automatically with the message pre-filled:
    > *"Hi Kamal Cool Care, I found your listing on FixNear for Refrigerator Repair. I need help in Negombo. My name is Mary."*
    She hits send in WhatsApp. Kamal replies within 4 minutes, confirms the LKR 1,500 visiting fee, and agrees to arrive at 8:30 AM the next morning.

### Flow 2 — Industrial Machine Motor Failure with Zero Results
**Protagonist:** Sunil (48, owner of a small garment packaging workshop in Seeduwa. An industrial fabric cutter motor has seized during an afternoon production run.)

1. Sunil opens FixNear on his phone.
2. The header defaults to Negombo. He taps `📍 Area: Negombo ▾` and switches it to **Seeduwa**. The URL updates to `/seeduwa`.
3. He taps **Industrial Machinery**, then selects **Electric Motor Rewinding**.
4. No technician in Seeduwa offers this niche service, and no cross-area technicians currently list Seeduwa for this sub-service.
5. The screen immediately displays the **Zero-Results State**:
   - Header: *"No motor rewinding technicians found in Seeduwa yet."*
   - Suggestion pills: *"Search nearby: [Katunayake (3 providers)] [Negombo (5 providers)]"*
   - Concierge Box: *"Need urgent help? Message FixNear Admin on WhatsApp and we will find a technician for you."*
6. Sunil taps **"Message FixNear on WhatsApp"**.
7. **Climax Beat:** WhatsApp opens a direct chat with Dhanushka (FixNear Admin):
   > *"Hi FixNear, I was looking for Electric Motor Rewinding in Seeduwa on your website but found no listings. Can you help me find someone?"*
   Dhanushka immediately receives the message, looks up a verified motor specialist in Katunayake, and forwards the contact to Sunil. In the backend, the query is automatically logged as high-priority provider recruitment demand for Seeduwa.

### Flow 3 — Solo Technician Onboarding on Mobile
**Protagonist:** Kamal (42, independent refrigerator and washing machine technician operating out of a small shop in Kochchikade. Skilled craftsman, comfortable with WhatsApp voice notes, but wary of complex online forms.)

1. Kamal sees a flyer or Facebook post and opens `fixnear.lk` on mobile Safari.
2. He taps the header button: **"Join as a Repair Provider (Free)"**.
3. **Step 1 (Phone & Password):** 
   - Screen displays large input: `+94` prefix and field `77 345 6789`.
   - He enters an 8-character password. Taps large blue button **"Next: About You"**.
4. **Step 2 (Who You Are):**
   - Personal Name: `Kamal Fernando`
   - Business Name: `Kamal Cool Care`
   - Base Area: Selects `Kochchikade` from dropdown.
   - Workshop Address: `Main Street, Kochchikade`
   - Bio: Types *"15 years experience in refrigerator and washing machine board repairs. Genuine parts used."*
   - Taps **"Next: Services & Pricing"**.
5. **Step 3 (Services & Areas):**
   - Taps `Home Appliances`, checks `Refrigerator Repair` and `Washing Machine Repair`.
   - Service Mode: Selects `Both (Customer visits shop or I visit customer)`.
   - Areas Served: Checks `Kochchikade`, `Negombo`, and `Katunayake`.
   - Pricing: Selects `Varies by job`, enters Visiting Fee `1500`.
   - Taps **"Next: Work Photos"**.
6. **Step 4 (Photos):**
   - Helpful banner: *"Technicians with at least 1 photo get 3x more WhatsApp calls"*.
   - Taps "Add Photo", uses his phone camera to take 2 photos of compressor replacements on his workbench.
   - Client-side compression converts images in < 1 second. Thumbnails appear with green checkmarks.
   - Taps **"Review Listing"**.
7. He checks the clean summary card and taps **"Submit Listing for Verification"**.
8. **Climax Beat:** The screen displays a celebratory checkmark and clear notice:
   > *"Listing Submitted! FixNear Admin will contact you on WhatsApp (+94 77 345 6789) within 12 hours (daytime < 2 hours) to verify your details and activate your Verified badge."*
   Kamal closes the browser confident that he didn't have to enter a credit card or fill out corporate paperwork.

### Flow 4 — Provider Phone Number Edit & Re-verification
**Protagonist:** Kamal (updating his contact phone number after purchasing a new Dialog business SIM).

1. Kamal navigates to `/login`, enters his registered mobile number and password.
2. The `/dashboard` displays his active listing, showing status `Approved` with a green shield.
3. He scrolls to the **Phone Number** field and updates it from `+94 77 345 6789` to `+94 71 987 6543`.
4. A clear warning dialog appears before saving:
   > *"Changing your WhatsApp number requires quick admin re-verification to prevent fraud. Your listing will remain visible, but your Verified badge will be temporarily paused until confirmed."*
5. Kamal taps **"Confirm & Save"**.
6. **Climax Beat:** The dashboard header updates to `Status: Pending Re-verification`. An automated notification is pushed to the Admin Telegram webhook. Kamal's listing continues serving customers in Kochchikade, while the admin is alerted to verify the new number.

### Flow 5 — Admin One-Thumb Mobile Moderation
**Protagonist:** Dhanushka (FixNear Admin, riding the train, reviewing Kamal's new listing on an iPhone).

1. Dhanushka receives a Telegram bot notification: *"New provider registration: Kamal Cool Care (Kochchikade) — 2 photos"*.
2. Dhanushka taps the link in Telegram, logging into `/admin/queue`.
3. The top card shows Kamal's submission:
   - Name: `Kamal Fernando` / `Kamal Cool Care`
   - Phone: `+94 77 345 6789`
   - Base Area: `Kochchikade` | Serves: `Negombo, Katunayake`
   - Visiting Fee: `LKR 1,500`
   - 2 photos of actual workshop repairs (genuine local photos, not stock images).
4. Dhanushka taps the green **"Verify on WhatsApp"** button.
5. WhatsApp opens instantly with prefilled text to Kamal:
   > *"Hello Kamal, this is Dhanushka from FixNear reviewing your listing application for Kamal Cool Care. Are you available for repairs in Kochchikade and Negombo?"*
6. Kamal replies via WhatsApp voice note 5 minutes later confirming his workshop location and availability.
7. Dhanushka returns to the mobile browser tab on `/admin/queue` and taps the solid green **"Approve"** button.
8. **Climax Beat:** With a single tap, `status` becomes `approved`, `is_verified` becomes `true`, and Kamal's listing is instantly published live across the Negombo, Kochchikade, and Katunayake directory pages.
