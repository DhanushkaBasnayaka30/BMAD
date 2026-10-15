---
title: FixNear Product Requirements Document (PRD)
status: draft
created: 2026-10-13
updated: 2026-10-13
---

# PRD: FixNear (Phase 1 — Negombo Pilot)

## 0. Document Purpose
This Product Requirements Document (PRD) establishes the functional, architectural, and behavioral specifications for **FixNear Phase 1**. It bridges the strategic vision articulated in the [FixNear Product Brief](file:///Users/dhanushka/Downloads/MYPROJECTS/BMAD/_bmad-output/planning-artifacts/briefs/brief-fixnear-2026-10-13/brief.md) into unambiguous engineering and design inputs for:
- **UX / UI Design (Sally):** Wireframes, responsive layouts, 44px touch targets, mobile navigation, and the WhatsApp hand-off sheet.
- **System Architecture (Winston):** Data schemas, server-rendered SEO routing, authentication pipelines, image optimization, and administrative workflow tooling.

All specifications adhere strictly to the Glossary vocabulary. Requirements are categorized with stable, globally unique IDs (`FR-xxx`, `NFR-xxx`, `UJ-x`, `SM-x`) to ensure end-to-end traceability into Epics and User Stories.

---

## 1. Vision
FixNear is a hyper-local, mobile-first web directory and marketplace designed to solve the two-sided friction in Sri Lanka's machinery repair sector. When essential appliances, vehicles, or industrial machines break down, customers cannot easily discover nearby, trustworthy technicians. Concurrently, skilled independent repairers and small workshop owners operate in digital invisibility without the resources or technical knowledge to manage websites or paid marketing.

FixNear removes all intermediary barriers through a **zero-friction discovery model**: 100% public, search-engine-crawlable directory browsing paired with **direct, 1-tap hand-off to WhatsApp**. There are no customer registration gates, no in-app messaging silos, and no platform commissions in Phase 1.

The Phase 1 release validates supply liquidity and customer demand in the **Negombo beachhead cluster** (Negombo, Kochchikade, Katunayake, Seeduwa) by establishing verified provider density (15–25 active providers) and measuring customer contact initiation.

---

## 2. Target Users & Journeys

### 2.1 Jobs To Be Done (JTBD)
- **Customer:** *"When my refrigerator/vehicle breaks down unexpectedly, I want to quickly find a verified technician in my immediate neighborhood with clear visiting charges and work photos, so that I can contact them on WhatsApp immediately without jumping through sign-up hoops."*
- **Provider:** *"When I run a repair business or freelance as a technician, I want a free, trustworthy online profile that showcases my specific skills and photos of past work to local customers, so that I get a steady stream of repair jobs in my service area."*
- **Admin (Dhanushka):** *"When new providers sign up, I want to quickly verify their WhatsApp responsiveness and approve legitimate listings, so that the marketplace maintains high trust and zero spam."*

### 2.2 Non-Users (Phase 1)
- **Users seeking full in-app e-commerce:** Customers expecting automated booking slots, digital payments, in-app escrow, or platform dispute arbitration.
- **National / International customers:** Users outside Sri Lanka or searching for providers outside the supported pilot launch areas.

### 2.3 Key User Journeys

#### UJ-1: Kasun finds a refrigerator technician in Negombo (Public Discovery & Contact)
* **Persona & Context:** Kasun, a homeowner in Negombo whose inverter refrigerator has stopped cooling; ice is melting and urgent repair is needed.
* **Entry State:** Unauthenticated visitor landing on the FixNear homepage from mobile Safari via an organic Google search or direct link.
* **Path:**
  1. Kasun selects "Negombo" from the prominent Area dropdown (the app saves this choice to browser `localStorage`).
  2. He taps "Home Appliances" and selects the "Refrigerator / Freezer Repair" sub-service tag.
  3. The directory renders verified provider cards matching Negombo.
  4. Kasun evaluates a card displaying "Kamal Refrigeration (Verified)", noting a visiting fee of LKR 1,500 and recent photos of PCB board repairs.
  5. Kasun taps the card to open Kamal's profile, confirms the description and shop address, and taps the primary CTA: **"Contact on WhatsApp"**.
  6. A bottom sheet appears: *"Your name (optional) — helps the technician know who is messaging"*. Kasun types "Kasun" and taps **"Continue to WhatsApp"**.
* **Climax:** WhatsApp launches directly with pre-populated message: `"Hi Kamal Refrigeration, I found your listing on FixNear for Refrigerator / Freezer Repair. I need help in Negombo. My name is Kasun."`
* **Resolution:** Kasun hits send inside WhatsApp. FixNear records an anonymous `whatsapp_contact_click` analytic event.
* **Edge Case (Cross-Area Coverage):** If Kasun searches in Seeduwa where no local fridge repairer exists, the system displays Kamal's profile ranked under a distinct header: *"From nearby Negombo (Visits Seeduwa)"* because Kamal selected Seeduwa in his "Areas I serve" profile.

#### UJ-2: Suneth registers his motorcycle electrical workshop (Provider Onboarding)
* **Persona & Context:** Suneth, owner of an auto-electrical and motorcycle wiring workshop in Kochchikade.
* **Entry State:** Unauthenticated visitor tapping "Join as a Repair Provider (Free)" on the FixNear footer or navigation.
* **Path:**
  1. Suneth chooses "Register as Business".
  2. He inputs his Mobile/WhatsApp Number (`0771234567`) and creates a secure password.
  3. He completes profile details: Business Name ("Suneth Moto Electrical"), Base Area ("Kochchikade"), Physical Address, and Bio.
  4. He selects his primary category ("Vehicles") and checks specific sub-services: "Motorcycle & Scooter Repair" and "Auto Electrical & Battery Systems".
  5. He sets Service Mode to "Both (Customer comes to me & I visit customer)" and checks "Areas I serve": Kochchikade, Negombo, and Katunayake.
  6. He specifies Pricing: "Varies by job" with an explicit "Visiting / Inspection Fee: LKR 1,000".
  7. He uploads 3 photos of past motorcycle rewiring jobs.
  8. He submits the listing. The screen confirms: *"Listing Submitted! Pending Verification by FixNear Admin"*.
* **Climax:** Suneth receives a WhatsApp message from the FixNear Admin within 4 hours verifying his business and number.
* **Resolution:** Admin approves the profile; Suneth's listing goes live with a verified badge.

#### UJ-3: Admin reviews and publishes Suneth's listing (Admin Workflow)
* **Persona & Context:** Dhanushka (Admin) receives an instant notification (Telegram/Webhook) that Suneth registered a new listing.
* **Entry State:** Authenticated Admin logging in with email and password on mobile browser.
* **Path:**
  1. Admin opens the Pending Approval Queue in the Admin Panel.
  2. Admin reviews Suneth’s details, verifies uploaded photos are genuine repair work (not spam), and taps the "Verify WhatsApp" quick link.
  3. WhatsApp opens with a pre-filled admin verification ping to Suneth's number: `"Hello Suneth, this is Dhanushka from FixNear reviewing your listing application..."`
  4. Suneth replies confirming his workshop.
  5. Admin taps "Approve Listing" in the admin dashboard.
* **Climax:** Suneth's listing status transitions to `Approved`, `is_verified` is set to `true`, and the listing is immediately visible in the public directory and sitemap.

---

## 3. Glossary

* **Customer:** An unauthenticated end-user visiting FixNear to find and contact a repair provider.
* **Provider:** An authenticated technician or repair business registered on FixNear offering machinery repair services.
* **Admin:** The platform owner (Dhanushka) with authorization to review listings and manage categories.
* **Base Area:** The primary physical location or shop town of a provider (e.g., Negombo).
* **Areas Served:** Multi-select list of launch towns a provider is willing to travel to under "visits customer" mode.
* **Managed Category:** Top-level equipment classification (e.g., *Home Appliances*, *Vehicles*, *Industrial Machinery*, *Electronics*).
* **Sub-Service:** Specific machine or repair specialization nested under a Managed Category (e.g., *Refrigerator Repair*, *Washing Machine Repair*).
* **Service Mode:** How work is delivered: `comes_to_customer` (Visits you), `customer_comes_to_shop` (Shop visit), or `both`.
* **Visiting Fee:** A standardized upfront inspection charge declared by the provider for diagnosing issues at the customer's site.
* **WhatsApp Hand-off:** The action of transitioning a customer from FixNear into WhatsApp using an engineered `wa.me` deep link with pre-filled context.
* **Verified Badge:** A trust indicator shown on provider cards and profiles confirming manual admin phone and profile validation.

---

## 4. Features & Functional Requirements

### 4.1 Discovery, Browsing & Search (Public / Customer)
**Description:** Fully public, server-rendered directory and search interface. Customers filter and sort listings by location and machinery type with zero login barriers. Realizes UJ-1.

* **FR-101 (Must): Public Directory Access.** The entire directory, category pages, and provider profiles must be accessible to unauthenticated visitors without presenting any login or registration prompt.
* **FR-102 (Must): Area Selector & Persistence.** The system must provide a prominent Area selector on the homepage containing the launch areas (`Negombo`, `Kochchikade`, `Katunayake`, `Seeduwa`). The selected area must be stored in browser `localStorage` and automatically pre-selected on subsequent visits.
* **FR-103 (Must): Category & Sub-Service Navigation.** The homepage must render visual entry points for the 4 primary categories, expanding to show admin-managed sub-service tags upon tap.
* **FR-104 (Must): Multi-Facet Filter Bar.** Search results must support filtering by:
  1. Sub-service tag (single or multi-select).
  2. Area (defaults to user’s active area).
  3. Service Mode (`Visits your location`, `Has physical workshop / Visit shop`).
* **FR-105 (Must): Provider Summary Cards.** Each search result card must display:
  - Provider or Business Name.
  - Verified Trust Badge (if verified).
  - Base Area (and "Visits [User Area]" tag if matched cross-area).
  - Primary Category & Sub-service specialties.
  - Visiting / Inspection Fee and Pricing Model.
  - Service Mode icon/label.
  - Thumbnail preview of up to 3 work photos.
  - Direct "Contact on WhatsApp" CTA button.
* **FR-106 (Must): Cross-Area Matching Logic.** If a provider's Base Area does not match the customer's selected area, but the provider's `service_mode` includes `comes_to_customer` and the customer's area is selected in `areas_served`:
  - Show the provider below all exact in-area matches.
  - Affix the clear label: *"Based in [Base Area], visits [Selected Area]"*.
  - Providers configured strictly as `customer_comes_to_shop` must NEVER appear in cross-area results.
* **FR-107 (Must): Zero-Results State.** When no in-area or visiting providers match a query, the system must display an informative zero-state with actionable suggestions:
  - Suggesting adjacent launch areas.
  - Suggesting broader category exploration.
  - Displaying a feedback link (*"Looking for something else? Let us know"*).

---

### 4.2 Provider Profiles & Contact Handoff
**Description:** High-trust profile view providing proof of competence and frictionless WhatsApp engagement. Realizes UJ-1.

* **FR-201 (Must): Comprehensive Provider Profile.** Each profile page must display:
  - Header: Name, Business Name, Verified Badge, Base Area, Shop Address (if provided).
  - Full narrative description of services and background.
  - Full list of supported Sub-services grouped by Category.
  - Service Mode indicator and list of all "Areas Served".
  - Pricing section: Pricing type (Fixed / Starting from / Varies by job) and Visiting/Inspection Fee (if specified).
  - Responsive lightbox gallery of uploaded work photos.
  - Sticky or prominent primary CTA: **"Contact on WhatsApp"**.
* **FR-202 (Must): WhatsApp Hand-off Bottom Sheet.** Tapping the "Contact on WhatsApp" CTA must trigger a lightweight mobile bottom sheet/dialog:
  - Text input: *"Your name (optional) — helps the provider greet you"*.
  - Primary button: *"Continue to WhatsApp"*.
  - Secondary button: *"Skip and open WhatsApp"*.
* **FR-203 (Must): Dynamic WhatsApp Pre-filled Deep Link.** The system must construct a `wa.me` URL targeting the provider's verified E.164 phone number:
  - If name provided: `https://wa.me/<E164_PHONE>?text=Hi%20[Provider],%20I%20found%20your%20listing%20on%20FixNear%20for%20[Sub-service].%20I%20need%20help%20in%20[Area].%20My%20name%20is%20[Name].`
  - If name skipped: `https://wa.me/<E164_PHONE>?text=Hi%20[Provider],%20I%20found%20your%20listing%20on%20FixNear%20for%20[Sub-service].%20I%20need%20help%20in%20[Area].`
* **FR-204 (Must): Customer Privacy & Anonymous Metric Logging.** The system must NOT store customer names or mobile numbers in the database during the WhatsApp hand-off. The hand-off event must atomically increment an anonymous conversion counter associated with `provider_id`.

---

### 4.3 Provider Authentication & Onboarding
**Description:** Low-friction registration for independent technicians and repair shops. Realizes UJ-2.

* **FR-301 (Must): Free Provider Registration.** Technicians can register free of charge as either an "Individual Technician" or a "Repair Business".
* **FR-302 (Must): Credential Authentication.** Authentication must be based on **Mobile Number (E.164) + Password**. No email address shall be required for provider accounts.
* **FR-303 (Must): Onboarding Profile Form.** The onboarding form must capture:
  - Personal Name (Required).
  - Business Name (Optional).
  - WhatsApp Mobile Number (Required).
  - Base Area (Required, single-select from curated launch areas).
  - Physical Workshop Address (Optional).
  - Short Bio / Description (Required).
  - Service Categories & Specific Sub-services (Required, multi-select).
  - Service Mode (Required: `comes_to_customer`, `customer_comes_to_shop`, `both`).
  - Areas Served (Required if service mode includes visiting customers; multi-select).
  - Pricing Model (Required: `fixed`, `starting_from`, `varies_by_job`).
  - Visiting / Inspection Fee (Optional, currency in LKR).
* **FR-304 (Must): Work Photo Upload Gallery.** Providers can upload up to 10 photos of past repair work or workshop facilities during onboarding or editing.
* **FR-305 (Must): Initial Pending State.** Newly submitted listings must be assigned `status = 'pending_approval'` and `is_verified = false`. Unapproved listings must remain inaccessible on public search and direct URLs.
* **FR-306 (Should): Password Reset Flow.** If a provider forgets their password, provide an automated SMS OTP reset option or an admin-assisted reset trigger.

---

### 4.4 Provider Listing Self-Management & Security
**Description:** Post-approval listing maintenance with fraud prevention. Realizes UJ-2.

* **FR-401 (Must): Provider Dashboard / Edit Mode.** Authenticated providers can log in to edit bio, photos, sub-services, visiting fees, and service areas.
* **FR-402 (Must): Edit Security & Re-verification Guardrail.** If an approved provider modifies their **WhatsApp Mobile Number** or **Business Name**:
  - The system must immediately set `is_verified = false` or flag listing as `pending_reverification`.
  - A notification must alert Admin to re-verify the new phone number before the badge is restored.
  - Minor edits (description, photo additions, fee updates) remain live without stripping verification.

---

### 4.5 Admin Moderation, Verification & Taxonomy Management
**Description:** Operational management for the Product Owner (Dhanushka). Realizes UJ-3.

* **FR-501 (Must): Admin Authentication.** Admin access must require secure Email + Password authentication with brute-force rate-limiting.
* **FR-502 (Must): Listing Review Queue.** The Admin panel must list all `pending_approval` and `pending_reverification` listings sorted by submission timestamp.
* **FR-503 (Must): 1-Tap Verification Tooling.** The admin review card must include a 1-tap "Ping on WhatsApp" action opening a pre-formatted verification inquiry to the applicant's WhatsApp number.
* **FR-504 (Must): Approval & Rejection Actions.** Admin can:
  - **Approve:** Sets `status = 'approved'`, `is_verified = true`, publishing the listing.
  - **Reject:** Sets `status = 'rejected'` with a mandatory reason sent to the provider.
  - **Suspend:** Instantly hides an active listing from public view.
* **FR-505 (Must): Instant Submission Alerts.** The system must dispatch an instant notification (Telegram Bot API, mobile webhook, or urgent email) to Dhanushka whenever a new provider submits an application.
* **FR-506 (Must): Managed Taxonomy Editor.** Admin can add, edit, reorder, or deprecate:
  - Primary Categories.
  - Nested Sub-services.
  - Active Service Towns / Areas.

---

### 4.6 SEO, Indexing & Metadata
**Description:** Server-rendered discovery to capture local search engine demand. Realizes UJ-1.

* **FR-601 (Must): Clean Crawlable URL Hierarchy.**
  - Category / Sub-service landing pages: `/{area}/{category-or-subservice-slug}` (e.g. `/negombo/refrigerator-repair`).
  - Provider profiles: `/providers/{area}/{business-name-slug}-{id}`.
* **FR-602 (Must): Server-Side Rendering (SSR) / Metadata.** All public directory and profile pages must be rendered server-side with dynamic, unique:
  - `<title>` (e.g., *"Kamal Refrigeration — Verified Fridge Repair in Negombo | FixNear"*).
  - `<meta name="description">` containing local keywords, services, and visiting fee summary.
  - OpenGraph tags for rich WhatsApp/Facebook link previews.
* **FR-603 (Must): Dynamic XML Sitemap.** The platform must automatically generate and update `sitemap.xml` containing all active area, category, and approved provider URLs.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Usability & Accessibility
* **NFR-101 (Must): Touch Target Compliance.** All clickable and tappable elements (buttons, filter chips, category cards, WhatsApp CTA) must maintain a minimum bounding box of **44px × 44px**.
* **NFR-102 (Must): Zero Hover Reliance.** All UI interactions must function without hover states, ensuring complete usability on touchscreen smartphones.
* **NFR-103 (Must): Typography & Readability.** Primary body text must be ≥ 16px to prevent automatic zooming on iOS Safari inputs. Contrast ratio must satisfy WCAG 2.1 AA (≥ 4.5:1 for normal text).
* **NFR-104 (Must): Standard Terminology.** The platform must use plain language and strictly adhere to the single noun **"Provider"** across all interfaces.

### 5.2 Performance
* **NFR-201 (Must): Mobile Network Optimization.** Directory listing and profile pages must achieve Largest Contentful Paint (LCP) < 2.5 seconds over standard Sri Lankan 3G/4G connections.
* **NFR-202 (Must): Image Optimization Pipeline.** All uploaded provider work photos and logos must be validated (JPEG, PNG, WebP only, max 10MB input), automatically converted to modern WebP format, resized to responsive thumbnail and display resolutions, and served via CDN/caching headers.

### 5.3 Security & Data Protection
* **NFR-301 (Must): Phone Number Standards.** All stored phone numbers must be validated and stored in international E.164 format (`+94XXXXXXXXX`).
* **NFR-302 (Must): Customer Privacy by Design.** No customer personal data (phone numbers, physical addresses, names) shall be stored in the FixNear database in Phase 1.
* **NFR-303 (Must): Rate Limiting.** Public search and WhatsApp hand-off endpoints must be protected with rate limiting to prevent automated scraping or denial-of-service abuse.

### 5.4 Internationalization & Localization
* **NFR-401 (Must): Language & Currency.** UI language for Phase 1 is clear, conversational English. Currency display is strictly Sri Lankan Rupees (`LKR`). The code architecture must isolate string resources to allow seamless Phase 2 translation into Sinhala (සිංහල) and Tamil (தமிழ்).

---

## 6. Data Requirements & Schemas

### 6.1 Entity: `Provider`
| Field | Type | Required | Description / Constraints |
|---|---|:---:|---|
| `id` | UUID | Yes | Primary key |
| `phone_number` | VARCHAR(15) | Yes | Unique, E.164 format (e.g. `+94771234567`) |
| `password_hash` | VARCHAR(255) | Yes | Securely hashed password (Argon2 / Bcrypt) |
| `personal_name` | VARCHAR(100) | Yes | Full name of technician or lead contact |
| `business_name` | VARCHAR(150) | No | Registered or trading business name |
| `slug` | VARCHAR(150) | Yes | URL-safe slug derived from business/personal name |
| `description` | TEXT | Yes | Narrative overview of skills, tools, and background |
| `base_area_id` | UUID | Yes | Foreign key to `Area` (Base workshop/residence) |
| `physical_address` | TEXT | No | Physical shop or garage address |
| `service_mode` | ENUM | Yes | `'comes_to_customer'`, `'customer_comes_to_shop'`, `'both'` |
| `price_type` | ENUM | Yes | `'fixed'`, `'starting_from'`, `'varies_by_job'` |
| `visiting_fee` | DECIMAL(10,2) | No | Upfront inspection/visiting charge in LKR |
| `status` | ENUM | Yes | `'pending_approval'`, `'approved'`, `'rejected'`, `'suspended'` |
| `is_verified` | BOOLEAN | Yes | Default `false`. Set to `true` upon admin verification |
| `logo_url` | VARCHAR(255) | No | Avatar or workshop logo image URL |
| `created_at` | TIMESTAMP | Yes | Creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last modification timestamp |

### 6.2 Entity: `Area`
| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | UUID | Yes | Primary key |
| `name` | VARCHAR(100) | Yes | Name (e.g., 'Negombo', 'Kochchikade', 'Katunayake', 'Seeduwa') |
| `slug` | VARCHAR(100) | Yes | Unique URL slug (e.g., `'negombo'`) |
| `district` | VARCHAR(100) | Yes | Default `'Gampaha'` |
| `country_code` | VARCHAR(2) | Yes | Default `'LK'` |
| `is_active` | BOOLEAN | Yes | Governs visibility in selection dropdowns |

### 6.3 Entity: `ProviderServedArea` (Junction)
| Field | Type | Required | Description |
|---|---|:---:|---|
| `provider_id` | UUID | Yes | FK to `Provider` |
| `area_id` | UUID | Yes | FK to `Area` (Areas provider travels to) |

### 6.4 Entity: `Category` & `SubService`
* `Category`: `id`, `name`, `slug`, `icon_name`, `display_order`.
* `SubService`: `id`, `category_id` (FK), `name`, `slug`, `display_order`.
* `ProviderSubService` (Junction): `provider_id` (FK), `sub_service_id` (FK).

### 6.5 Entity: `WorkPhoto`
| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | UUID | Yes | Primary key |
| `provider_id` | UUID | Yes | FK to `Provider` |
| `image_url` | VARCHAR(255) | Yes | Full-resolution WebP URL |
| `thumb_url` | VARCHAR(255) | Yes | Thumbnail WebP URL |
| `caption` | VARCHAR(150) | No | Optional description of repair job |
| `display_order` | INT | Yes | Sort order in profile gallery |

### 6.6 Entity: `ContactEvent` (Analytics)
| Field | Type | Required | Description |
|---|---|:---:|---|
| `id` | UUID | Yes | Primary key |
| `provider_id` | UUID | Yes | FK to `Provider` |
| `customer_area_id` | UUID | No | Area active in customer's session |
| `sub_service_id` | UUID | No | Sub-service context if initiated from specific filter |
| `source_url` | VARCHAR(255) | Yes | Page from which hand-off was initiated |
| `created_at` | TIMESTAMP | Yes | Timestamp of WhatsApp button tap |

---

## 7. Scope Boundaries

### 7.1 In Scope (Phase 1 MVP)
* Fully public search, area filtering, and profile viewing without login.
* Curated launch in Negombo, Kochchikade, Katunayake, and Seeduwa.
* Hierarchical service taxonomy: 4 core categories with granular sub-services.
* Provider onboarding (Mobile + Password), profile editor, and photo uploads.
* "Areas I serve" cross-area matching for visiting technicians.
* WhatsApp hand-off sheet with pre-filled message templating.
* Admin portal for listing approvals (< 12h SLA), WhatsApp verification ping, and taxonomy management.
* Server-side rendering (SSR) for local SEO and automated dynamic sitemaps.

### 7.2 Explicitly Out of Scope (Phase 1)
* **Customer Accounts:** No customer logins, passwords, profiles, or saved lists.
* **In-app Chat & Calling:** All communication occurs inside WhatsApp.
* **Payments & Commissions:** No booking deposits, transaction fees, or commissions.
* **Customer Reviews & Star Ratings:** Deferred to Phase 2 to prevent early low-liquidity review distortions.
* **Reverse Auction / Job RFQ:** No customer posting of broken equipment for bidding.
* **Map / Geolocation Engine:** No GPS distance calculation or map pin navigation.
* **Multi-country Features:** Strictly localized to Sri Lanka (`LK`, `+94`).

---

## 8. Success Metrics & Counter-Metrics

### Primary Metrics
* **SM-1: WhatsApp Contact Initiation Rate.**
  * *Definition:* Total verified taps on "Contact on WhatsApp" resulting in a launched `wa.me` deep link.
  * *Phase 1 Target:* ≥ 100 contact initiations in the first 30 days post-public launch in Negombo.
  * *Validates:* FR-105, FR-202, FR-203.

### Secondary Metrics
* **SM-2: Supply Liquidity Gate.**
  * *Definition:* Number of verified, active provider listings published across the 4 launch towns.
  * *Phase 1 Target:* 15–25 verified providers onboarded prior to customer marketing campaign launch.
  * *Validates:* FR-301, FR-303, FR-504.
* **SM-3: Admin Review Turnaround.**
  * *Definition:* Median duration from provider listing submission to admin decision (Approve/Reject).
  * *Phase 1 Target:* < 12 hours total; < 2 hours during daytime hours (08:00–20:00).
  * *Validates:* FR-502, FR-505.

### Counter-Metrics (Do Not Optimize)
* **SM-C1: Listing Quantity over Quality.**
  * *Constraint:* Do not lower verification standards or approve inactive providers just to hit the 25-provider target. Every listed provider must have a confirmed, responsive WhatsApp number.
* **SM-C2: WhatsApp Click Abandonment.**
  * *Constraint:* Track the drop-off rate between tapping "Contact on WhatsApp" and completing the bottom sheet. If drop-off exceeds 15%, remove the optional name prompt entirely.

---

## 9. Assumptions, Risks & Mitigations

| Risk / Assumption | Severity | Impact | Mitigation Strategy |
|---|:---:|---|---|
| **Technician Responsiveness:** Providers receive WhatsApp messages from customers but do not reply promptly. | High | Customer loses trust in platform. | Admin verifies responsiveness via WhatsApp ping during listing onboarding; provider profile clearly indicates service hours. |
| **Listing Tampering:** An approved provider changes their phone number or workshop name to a malicious target. | High | Fraudulent contact via verified badge. | **FR-402**: Modifying phone numbers or business names automatically strips verification and triggers administrative review. |
| **Supply Imbalance:** 80% of providers sign up for home appliances, leaving industrial machines unserved. | Medium | High bounce rate on specific categories. | Focused grassroots provider acquisition in Negombo industrial belts (Katunayake FTZ, boatyards, garages) before public launch. |
| **SEO Indexation Lag:** Search engines take weeks to index dynamic routes. | Medium | Slower organic customer acquisition. | Pre-render static HTML for all area and category pages; submit immediate dynamic sitemap to Google Search Console. |

---

## 10. Open Questions Index

1. **SMS Gateway Partner:** Which local aggregator will be contracted if automated fallback SMS OTP is triggered (Notify.lk vs. Textware vs. ShoutOUT)? *(Assigned to Winston / Arch).*
2. **Provider Onboarding Friction:** Will independent mechanics successfully upload photos on mobile browsers, or will Admin need to assist initial photo capture via WhatsApp during the pilot? *(To be monitored by Dhanushka during the first 10 on-boardings).*
