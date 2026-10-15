# FixNear — Product Brief Addendum

This addendum preserves technical depth, architectural requirements, detailed taxonomies, and strategic rationale generated during the brief discovery process to directly inform downstream PRD (`bmad-prd`), architecture (`bmad-architecture`), and UX design (`bmad-ux`).

---

## 1. Traceability & Requirements Delta (Oct 13, 2026)

### Modifications from Original Requirements
* **Customer Authentication (Original C-01, C-02):**
  * *Original Requirement:* Mandatory customer login with name, mobile number, and area prior to viewing listings.
  * *Updated Requirement:* Dropped customer accounts entirely for Phase 1. Browsing and multi-facet filtering are 100% public to maximize organic acquisition, search engine discoverability, and reduce bounce rate. Location is persisted via browser `localStorage` or session cookies.
* **Service Taxonomy & Granularity (Original P-05, A-02):**
  * *Original Requirement:* Flat top-level categories only.
  * *Updated Requirement:* Two-tier hierarchical taxonomy (Category → Sub-services/Tags). Providers select specific machines they service to prevent irrelevant customer inquiries.
* **Pricing Model Transparency (Original P-07):**
  * *Original Requirement:* Fixed, starting from, or varies by job.
  * *Updated Requirement:* Added an optional, explicit **Visiting / Inspection Fee** (e.g., LKR 1,000 inspection fee, repair quotation provided on diagnosis) to avoid 100% of providers defaulting to opaque "varies by job" descriptions.
* **Provider Security & Re-verification (Original P-09, A-01):**
  * *Original Requirement:* Providers can edit listings post-signup.
  * *Updated Requirement:* Edits to verified WhatsApp number, business name, or critical identity fields trigger automated status change to "pending re-verification" or flag an unverified badge to prevent listing hijacking/fraud.

---

## 2. Service Taxonomy & Initial Seeding Matrix

Admin-managed taxonomy designed for Phase 1 launch in Negombo:

### 1. Home Appliances
* **Sub-services:**
  * Refrigerator / Freezer Repair (Inverter & Non-Inverter)
  * Washing Machine Repair (Front-load, Top-load)
  * Air Conditioner Service & Gas Charging (Split & Window)
  * Microwave & Electric Oven Repair
  * Water Pump & Pressure Pump Repair
  * Gas Stove & Cooker Hob Repair
  * Vacuum Cleaner & Small Kitchen Appliances

### 2. Electronics
* **Sub-services:**
  * Television Repair (LED, LCD, OLED, Smart TV panel & backlight)
  * Audio Systems & Amplifier Repair
  * Smartphone & Tablet Screen / Battery / Board Repair
  * Laptop & Desktop Computer Hardware Repair
  * CCTV & Home Security Camera Systems
  * Inverter & UPS Repair

### 3. Vehicles
* **Sub-services:**
  * Motorcycle & Scooter Repair & Tune-up
  * Auto Electrical & Battery Systems (Cars, Vans, Three-wheelers)
  * Three-Wheeler (Auto Rickshaw) Mechanical Repair
  * Car & Van Mechanical / Engine Diagnostics
  * Mobile Tyre Puncture & Battery Jumpstart Service

### 4. Industrial & Commercial Machinery
* **Sub-services:**
  * Commercial Refrigeration & Deep Freezers (Bakery / Hotel)
  * Industrial Sewing Machine Repair (Garment industry)
  * Electric Motor Rewinding & Lathe Work
  * Welding Plant & Power Tool Repair
  * Commercial Generator Maintenance

---

## 3. Operational & Technical Architecture Notes

### WhatsApp Verification Protocol
* **Pilot Phase (Negombo Beachhead):**
  * Admin utilizes manual WhatsApp message ping upon new submission.
  * Checks:
    1. Phone number is an active WhatsApp account.
    2. Provider profile photo matches or is professional.
    3. Provider responds acknowledging terms.
  * Result: Sets listing `is_verified = true` and `status = 'approved'`.
* **Automated Fallback Architecture (Future / Scale):**
  * Integrate local Sri Lankan SMS Gateway (e.g., Notify.lk, Textware, ShoutOUT) for 6-digit OTP verification.
  * Store all numbers in strict E.164 format: `+94XXXXXXXXX` with country code `LK`.

### Admin Notification Architecture
* Webhook / Telegram Bot alert triggered upon provider submission:
  * Sends: Provider Name, Business Name, Area, Categories, WhatsApp click link.
  * Admin can tap link directly from mobile phone, test chat the provider, and click an approval token link.

### Metrics & Analytics Instrumentation
* **Primary Conversion Event:** `whatsapp_click_initiated`
  * Payload: `{provider_id, provider_area, customer_selected_area, category_id, sub_service, timestamp}`
* **Search Analytics:**
  * Track `search_zero_results` queries to identify unserved machine repair demand in Negombo.

---

## 4. Phase 2 Roadmap Parking Lot

The following features were intentionally excluded from Phase 1 to preserve speed to market and will be revisited post-pilot:
1. **Customer Accounts & Bookings:** Saved favorite technicians, booking requests with calendar timeslots.
2. **Ratings & Reviews:** Verified customer review system with fraud prevention.
3. **Provider Dashboards:** Analytics for providers showing profile views, WhatsApp click-throughs, and an active/unavailable toggle.
4. **Monetization Mechanics:**
   * Featured / sponsored placement at the top of category searches.
   * Subscription plans for multi-location businesses.
   * Lead fee or commission models.
5. **Interactive Map / GPS Geolocation:** Map-based radius search.
6. **Multi-language Support (i18n):** Full UI localization into Sinhala (සිංහල) and Tamil (தமிழ்).
