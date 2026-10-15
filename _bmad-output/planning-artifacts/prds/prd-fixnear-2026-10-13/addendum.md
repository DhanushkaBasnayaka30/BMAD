# FixNear PRD — Technical Addendum & Reference Notes

This addendum preserves architectural context, database design drafts, payload formats, and design guidance to support downstream execution by **Winston (System Architect)** and **Sally (UX Designer)**.

---

## 1. URL Routing & SEO Canonical Rules

### Canonical Patterns
* **Homepage:** `/` (Renders area selector dropdown, category grid, and featured verified providers in active area).
* **Area Root:** `/{area}` (e.g. `/negombo` — sets active area in context, displays all providers in that area).
* **Category Landing:** `/{area}/{category-slug}` (e.g. `/negombo/home-appliances`).
* **Sub-Service Landing:** `/{area}/{subservice-slug}` (e.g. `/negombo/refrigerator-repair` or `/seeduwa/motorcycle-repair`).
* **Provider Profile:** `/providers/{area}/{slug}-{id}` (e.g. `/providers/negombo/kamal-refrigeration-7f8a9b`).
* **Provider Auth / Dashboard:**
  * Register: `/provider/register`
  * Login: `/provider/login`
  * Listing Edit: `/provider/dashboard/listing`
* **Admin Portal:**
  * Login: `/admin/login`
  * Approval Queue: `/admin/queue`
  * Taxonomy Management: `/admin/taxonomy`

### Meta Tag Template Specifications
* **Sub-Service Page:**
  * `<title>`: `Best {SubService Name} in {Area Name} | Verified Technicians on FixNear`
  * `<meta name="description">`: `Find trusted {SubService Name} technicians in {Area Name}. View visiting charges, work photos, and contact directly on WhatsApp.`
* **Provider Profile Page:**
  * `<title>`: `{Business or Personal Name} ({Base Area}) — Verified Repair Technician | FixNear`
  * `<meta name="description">`: `Contact {Business or Personal Name} for {List of Top Sub-services} in {Base Area}. Visiting Fee: {Visiting Fee or 'On Inspection'}. Verified WhatsApp contact.`

---

## 2. WhatsApp Hand-off Deep Link Engineering

### URL Construction Format
```
https://wa.me/{E164_PHONE}?text={ENCODED_MESSAGE}
```

### Pre-filled Message Logic
* **With Name:**
  ```text
  Hi {Provider Name}, I found your listing on FixNear for {Sub-service}. I need help in {Customer Selected Area}. My name is {Customer Name}.
  ```
* **Without Name (Skipped):**
  ```text
  Hi {Provider Name}, I found your listing on FixNear for {Sub-service}. I need help in {Customer Selected Area}.
  ```

### Encoding Example
For Provider "Kamal Refrigeration", phone `+94771234567`, service "Refrigerator Repair", area "Negombo", name "Kasun":
```
https://wa.me/94771234567?text=Hi%20Kamal%20Refrigeration%2C%20I%20found%20your%20listing%20on%20FixNear%20for%20Refrigerator%20Repair.%20I%20need%20help%20in%20Negombo.%20My%20name%20is%20Kasun.
```

---

## 3. Database Schema DDL Draft (PostgreSQL)

```sql
-- Areas table
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    district VARCHAR(100) NOT NULL DEFAULT 'Gampaha',
    country_code VARCHAR(2) NOT NULL DEFAULT 'LK',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories & Sub-Services
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE sub_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0
);

-- Providers
CREATE TYPE provider_service_mode AS ENUM ('comes_to_customer', 'customer_comes_to_shop', 'both');
CREATE TYPE provider_price_type AS ENUM ('fixed', 'starting_from', 'varies_by_job');
CREATE TYPE provider_status AS ENUM ('pending_approval', 'approved', 'rejected', 'suspended');

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL UNIQUE, -- E.164 (+94...)
    password_hash VARCHAR(255) NOT NULL,
    personal_name VARCHAR(100) NOT NULL,
    business_name VARCHAR(150),
    slug VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    base_area_id UUID NOT NULL REFERENCES areas(id),
    physical_address TEXT,
    service_mode provider_service_mode NOT NULL,
    price_type provider_price_type NOT NULL,
    visiting_fee DECIMAL(10,2),
    status provider_status NOT NULL DEFAULT 'pending_approval',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    logo_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: Areas Served (for cross-area visiting technicians)
CREATE TABLE provider_served_areas (
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, area_id)
);

-- Junction: Provider Sub-Services
CREATE TABLE provider_sub_services (
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    sub_service_id UUID NOT NULL REFERENCES sub_services(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, sub_service_id)
);

-- Work Photos
CREATE TABLE work_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    thumb_url VARCHAR(255) NOT NULL,
    caption VARCHAR(150),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anonymous Contact Analytics
CREATE TABLE contact_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    customer_area_id UUID REFERENCES areas(id),
    sub_service_id UUID REFERENCES sub_services(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Mobile Touch Target & Interaction Specs for UX (Sally)

1. **Header Area Selector:**
   * Dropdown trigger button: Height ≥ 48px, full width or fixed minimum width 160px.
   * Dropdown options: Item height ≥ 44px with 8px padding to prevent mis-clicks.
2. **Provider Result Card:**
   * Whole card clickable to open profile, with independent 48px high "Contact on WhatsApp" button positioned at the bottom right.
   * Visiting Fee badge clearly highlighted in green/neutral pill (e.g. `Visiting Fee: LKR 1,500`).
3. **WhatsApp Bottom Sheet:**
   * Slides up from bottom of mobile viewport.
   * Input field: Minimum 48px height, 16px font (prevents iOS auto-zoom).
   * Primary Action: Green background `#25D366` (WhatsApp brand color) with white text, 48px height.
   * Skip Action: Flat button with subtle text, 44px height.
