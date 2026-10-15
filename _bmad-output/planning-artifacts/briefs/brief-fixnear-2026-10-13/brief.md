---
title: FixNear Product Brief
status: draft
created: 2026-10-13
updated: 2026-10-13
---

# Product Brief: FixNear

## Executive Summary

FixNear is a hyper-local, mobile-first web directory and marketplace connecting individuals and businesses in Sri Lanka with trusted, nearby machine and appliance repair technicians. When critical machines fail—from home refrigerators and air conditioners to commercial vehicles and industrial equipment—customers struggle to find capable, reputable repair providers in their immediate vicinity. Simultaneously, skilled independent technicians and small repair workshops remain digitally invisible, lacking affordable avenues to reach local customers.

FixNear bridges this divide with an ultra-low friction model: **100% public, open search and browsing** paired with **direct, 1-tap contact via WhatsApp**. There are no mandatory customer sign-ups, no intermediary fees, and no in-app messaging friction.

Phase 1 launches as a free pilot centered on the **Negombo cluster** (Negombo, Kochchikade, Katunayake, and Seeduwa). Success is proven by establishing initial supply liquidity (15–25 verified providers) and generating verified lead intent measured through customer WhatsApp contact clicks.

---

## The Problem

1. **High Friction & Blind Discovery for Customers:** Finding reliable local repair technicians currently relies on fragmented Facebook groups, word-of-mouth, or physical signboards. Customers cannot easily compare expertise, verify legitimacy, inspect past work photos, or gauge visiting fees before making a call.
2. **Digital Invisibility for Local Providers:** Skilled technicians and small repair businesses cannot afford custom websites or high-cost advertising. Most conduct their entire business via WhatsApp and phone calls, leaving them unable to tap into local digital demand.
3. **Trust Deficit:** Customers are wary of unknown technicians entering homes or servicing expensive machinery. Unverified contact details and lack of visible work evidence foster skepticism.

---

## The Solution

A lightweight, responsive web marketplace optimized for mobile devices that facilitates frictionless local discovery:
- **Instant Localized Discovery:** Customers immediately view nearby, verified technicians filtered by specific equipment and area without needing an account or login.
- **Rich Provider Profiles:** Verified badges, clear service categories and sub-services, service modes (at-home vs. shop visit), transparent visiting/inspection fees, and photo galleries of past work.
- **Direct WhatsApp Connection:** A single tap opens an end-to-end encrypted WhatsApp conversation with the provider's verified number, meeting both parties in their existing daily communication tool.

---

## What Makes FixNear Different

* **Zero-Friction Customer Experience:** Unlike typical marketplaces that force account creation, FixNear allows instant public browsing and searching. Location preferences are remembered directly in the user's browser.
* **Leverages Established Habits (WhatsApp Native):** Rather than building redundant, expensive in-app chat systems, FixNear routes leads straight into WhatsApp—the ubiquitous communication standard in Sri Lanka.
* **Vetted Supply via Active Admin Verification:** Every listing undergoes admin verification (including WhatsApp direct verification) before publication, ensuring high listing quality from day one.
* **Hyper-Focused Beachhead Strategy:** Instead of spreading thin nationally, FixNear builds density first within a defined geographic corridor (Negombo).

---

## Target Users & Needs

| Role | Profile | Core Need | Definition of Success |
|---|---|---|---|
| **Customer** | Resident or business owner with broken machinery/appliances | Quickly discover qualified, trusted nearby technicians with upfront pricing cues | Identifies a trusted local technician within 2 minutes and initiates a WhatsApp conversation |
| **Provider** | Solo technician or small repair workshop owner | Free, credible local marketing to acquire nearby repair jobs | Receives qualified, nearby customer leads directly on WhatsApp with zero upfront cost |
| **Admin** | FixNear Operations (Product Owner / Founder) | Maintain directory trustworthiness, rapid listing turnaround, and curated taxonomies | < 12h review turnaround, high listing accuracy, zero spam listings |

---

## Scope

### In-Scope (Phase 1 — Pilot)
* **Open Customer Experience:** Public search and multi-facet filtering (Category, Sub-service, Area, Service Mode) without login. Mobile-first responsive UI.
* **Area Prioritization:** Homepage area selector remembered via browser local storage; results sorted by selected area.
* **Rich Provider Profiles:** Verified badge, business/technician details, sub-service tags, service mode (comes to you / shop visit / both), pricing type, visiting/inspection fee, work photo gallery, and 1-tap WhatsApp trigger.
* **Self-Service Provider Onboarding:** Free registration, service taxonomy selection, photo upload, and listing self-management (editing profile).
* **Admin Verification & Moderation:** Admin dashboard/tools to review, approve, reject, or suspend listings; instant submission notifications; category & sub-service taxonomy management.
* **Security & Quality Safeguards:** Admin direct verification ping of WhatsApp numbers; edits to phone numbers or business names automatically trigger re-verification.

### Out-of-Scope (Phase 1)
* Mandatory customer accounts and authentication.
* In-app ratings and customer reviews (slated for Phase 2).
* Job posting / reverse auction RFQs (customers posting problems to receive bids).
* Native in-app messaging, calling, or notifications.
* Payment processing, escrows, lead commissions, or paid listing tiers.
* Live GPS geolocation or interactive map view (uses structured area selection).
* Geographic expansion beyond Sri Lanka.

---

## Key Features by Role

### 1. Customer (Public / Unauthenticated)
* **C-01:** Browse and search directory without registration or login.
* **C-02:** Select preferred area via dropdown; browser persists selection across sessions.
* **C-03:** Filter directory by Category, specific Sub-service tag, Area, and Service Mode.
* **C-04:** View summary provider cards displaying name, verified badge, area, visiting fee/pricing model, and service mode.
* **C-05:** Access full provider profile with complete description, equipment specialties, photo gallery, and pricing details.
* **C-06:** Tap WhatsApp button to open a direct chat with the provider (optional lightweight prompt for customer name to prepopulate greeting message).
* **C-07:** Helpful zero-state guidance suggesting adjacent areas or broader categories when no exact matches exist.

### 2. Provider (Authenticated)
* **P-01:** Free sign-up as an individual technician or registered repair business.
* **P-02:** Profile creation: personal name, optional business name, logo/avatar, physical shop address (optional), and bio.
* **P-03:** Select primary categories and specific sub-services from the admin-managed taxonomy.
* **P-04:** Configure service mode: *Customer comes to shop*, *Technician visits customer*, or *Both*.
* **P-05:** Transparent pricing structure: select pricing model (Fixed, Starting From, Varies by Job) plus optional upfront **Visiting / Inspection Fee**.
* **P-06:** Upload past work photos to showcase craftsmanship.
* **P-07:** Submit WhatsApp mobile number for verification.
* **P-08:** Edit existing listing post-approval (critical fields trigger re-verification).

### 3. Admin (Product Owner)
* **A-01:** Review pending provider listings with an operational SLA of < 12 hours.
* **A-02:** Direct WhatsApp verification ping (with optional SMS OTP fallback) to confirm contact validity.
* **A-03:** Approve, reject (with reason), suspend, or delete provider listings.
* **A-04:** Manage hierarchical service taxonomies (Categories and Sub-services).
* **A-05:** Receive instant notifications (Telegram / email / mobile webhook) upon each new listing submission.

---

## Success Criteria & Pilot Milestones

### Negombo Pilot Targets (Phase 1 Launch Gate)
1. **Supply Liquidity Gate:** Onboard and verify **15–25 active providers** in the Negombo cluster across the 4 primary categories before initiating consumer marketing.
2. **Primary User Engagement Metric:** **Total WhatsApp Contact Clicks** initiated from provider profiles (target: > 100 qualified clicks in month 1 post-public promotion).
3. **Operational Responsiveness:** Maintain an Admin Listing Review SLA of **< 12 hours** (median < 2 hours during daytime).
4. **Search Fulfillment Rate:** < 15% zero-result searches for Negombo queries.

---

## Non-Functional Requirements & Constraints

* **N-01 Mobile-First UI/UX:** Responsive layout optimized for budget smartphones; minimum 44px tap targets; zero reliance on hover interactions.
* **N-02 Performance:** Sub-2.5 second Largest Contentful Paint (LCP) on typical 3G/4G mobile networks; client-side image compression prior to upload.
* **N-03 Accessibility & Usability:** Body text ≥ 16px; high color contrast; consistent terminology; plain-language UI.
* **N-04 Data Integrity & Formatting:** Strict E.164 phone number formatting (`+94XXXXXXXXX`), ISO-3166-1 country code standard (`LK`), and structured district/city data.
* **N-05 Language:** Clear English at launch, architected with i18n support to cleanly introduce Sinhala and Tamil in future updates.

---

## Assumptions, Risks & Mitigation

| Category | Assumption / Risk | Impact | Mitigation Strategy |
|---|---|---|---|
| **Market** | Customers will abandon if forced to sign up | High | Eliminated customer login in Phase 1; 100% public browsing with local storage area selection. |
| **Supply** | Technicians may not check or respond to WhatsApp inquiries promptly | High | Admin sends verification message during onboarding; profile explicitly sets expectations; pilot checks responsiveness. |
| **Data Quality** | Providers edit listing to fraudulent content after approval | Medium | Profile editing logic automatically puts listings with modified phone numbers or business names into re-verification. |
| **Measurement** | Inability to track off-platform repair completion | Medium | Treat WhatsApp click as primary intent proxy; conduct weekly manual pulse checks with onboarded providers. |
| **Pricing** | "Varies by job" obscures price comparison | Medium | Added standardized "Visiting / Inspection Fee" to establish upfront transparency. |

---

## Strategic Next Steps

1. **Memlog Audit & Brief Finalization:** Verify all agreed specifications are reflected.
2. **Downstream Handoff:** Transition to PRD (`bmad-prd`) and System Architecture (`bmad-architecture`) to formalize data schemas and UX wireframes.
3. **Provider Acquisition Outreach:** Begin direct onboarding of Negombo pilot technicians using the Phase 1 value proposition.
