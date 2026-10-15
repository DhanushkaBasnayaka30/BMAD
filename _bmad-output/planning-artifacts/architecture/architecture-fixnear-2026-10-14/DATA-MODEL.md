# FixNear Data Model & Schema Specification (Phase 1 — Negombo Pilot)

**Companion Document to:** [ARCHITECTURE-SPINE.md](file:///Users/dhanushka/Downloads/MYPROJECTS/BMAD/_bmad-output/planning-artifacts/architecture/architecture-fixnear-2026-10-14/ARCHITECTURE-SPINE.md)  
**Database Engine:** PostgreSQL 15+ (Hosted on Supabase, Region: `ap-south-1` Mumbai)  
**Status:** Approved Architecture Substrate  
**Date:** 2026-10-14  

---

## 1. Overview & Data Invariants

1. **Identity & Credential Isolation:** Authentication credentials (passwords, phone auth mappings, session tokens) live exclusively within the Supabase Auth schema (`auth.users`). The `providers` table holds domain profile data and its primary key `id` is a foreign key referencing `auth.users.id`. There is **no `password_hash` column** in `providers`.
2. **Anonymous Contact Analytics:** The `contact_events` table captures when a customer initiates contact via WhatsApp. In compliance with privacy invariants (`NFR-302`), **no customer personal information (names, phone numbers, IP addresses in plaintext)** is ever recorded. We use pure event-stream logging instead of denormalized counter columns on `providers` to ensure auditability and prevent write-contention.
3. **Session Hashing with Secret Salt:** To prevent duplicate click spam while protecting customer privacy, each contact event stores a salted one-way hash: `SHA256(ip + user_agent + date + provider_id + CONTACT_HASH_SALT)` where `CONTACT_HASH_SALT` is a cryptographically secure server-only environment variable.
4. **Public Column Projection & Re-verification Lockdown (Option A):** Unauthenticated public visitors NEVER query the raw `providers` table directly. Public directory browsing targets the `public_providers` view, which projects only approved, verified columns. When a provider updates their phone number or business name, the listing enters `pending_reverification` and is **immediately hidden from the public directory** until verified by Admin (target review time: under 12 hours).
5. **Login-Time Temporary Password Expiration:** When a provider attempts login with a temporary password (`must_change_password = true`), the Server Action evaluates `NOW() <= temp_password_expires_at`. If expired (>24 hours), the session is instantly invalidated via `signOut()` and rejected at login before any session cookie or dashboard redirect is issued.
6. **Provider URL Slug Immutability:** The `slug` column is generated once at registration. The database trigger `fn_enforce_provider_column_protection` strictly rejects any provider attempt to alter `slug`, ensuring permanent URL stability for SEO and external WhatsApp links across business renames.

---

## 2. Table Specifications

### 2.1 Table: `providers`
Stores core technician and repair workshop profile information.

```sql
CREATE TYPE provider_status_enum AS ENUM (
  'pending_approval',
  'approved',
  'rejected',
  'suspended',
  'pending_reverification',
  'paused'
);

CREATE TYPE service_mode_enum AS ENUM (
  'comes_to_customer',
  'customer_comes_to_shop',
  'both'
);

CREATE TYPE price_type_enum AS ENUM (
  'fixed',
  'starting_from',
  'varies_by_job'
);

CREATE TYPE provider_type_enum AS ENUM (
  'individual',
  'business'
);

CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(15) NOT NULL UNIQUE, -- E.164 format (+94XXXXXXXXX)
  provider_type provider_type_enum NOT NULL DEFAULT 'individual',
  personal_name VARCHAR(100) NOT NULL,
  business_name VARCHAR(150),
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  physical_address TEXT,
  service_mode service_mode_enum NOT NULL DEFAULT 'both',
  price_type price_type_enum NOT NULL DEFAULT 'varies_by_job',
  visiting_fee DECIMAL(10,2), -- In LKR, nullable
  status provider_status_enum NOT NULL DEFAULT 'pending_approval',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
  is_permanently_rejected BOOLEAN NOT NULL DEFAULT false, -- Blocks resubmission when true
  must_change_password BOOLEAN NOT NULL DEFAULT false, -- Enforces password change on temporary reset
  temp_password_expires_at TIMESTAMPTZ,                -- Expiry for temporary password (24 hours)
  submitted_at TIMESTAMPTZ,                            -- Timestamp of final wizard submission (NULL for abandoned drafts)
  pending_phone_number VARCHAR(15),                    -- Staged unverified phone number under review (NULL unless pending_reverification)
  pending_business_name VARCHAR(150),                  -- Staged unverified business name under review (NULL unless pending_reverification)
  requires_manual_repair BOOLEAN NOT NULL DEFAULT false, -- True if Auth/DB reconciliation requires manual admin repair
  last_edited_at TIMESTAMPTZ,                          -- Timestamp of last non-critical profile edit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_business_name CHECK (
    provider_type = 'individual' OR (provider_type = 'business' AND business_name IS NOT NULL AND length(trim(business_name)) > 0)
  )
);

-- Indexes
CREATE INDEX idx_providers_status_verified ON providers(status, is_verified);
CREATE INDEX idx_providers_submitted ON providers(submitted_at);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_phone ON providers(phone_number);
CREATE UNIQUE INDEX uq_providers_pending_phone ON providers(pending_phone_number) WHERE pending_phone_number IS NOT NULL;
CREATE INDEX idx_providers_type ON providers(provider_type);
CREATE INDEX idx_providers_manual_repair ON providers(requires_manual_repair) WHERE requires_manual_repair = true;
```

### 2.2 Table: `areas`
Managed geographic launch towns in the pilot cluster.

```sql
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'Negombo', 'Kochchikade'
  slug VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'negombo', 'kochchikade'
  district VARCHAR(100) NOT NULL DEFAULT 'Gampaha',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed values for Phase 1: Negombo, Kochchikade, Katunayake, Seeduwa
CREATE INDEX idx_areas_active_sort ON areas(is_active, sort_order);
```

### 2.3 Table: `provider_areas`
Junction table tracking a provider's primary workshop town (`is_base_area = true`) and travel service coverage (`is_base_area = false`).

```sql
CREATE TABLE provider_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
  is_base_area BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_provider_area UNIQUE (provider_id, area_id)
);

-- Invariant: Exactly one base area per provider
CREATE UNIQUE INDEX idx_provider_single_base_area 
  ON provider_areas (provider_id) 
  WHERE (is_base_area = true);

-- Lookup index for area matching queries
CREATE INDEX idx_provider_areas_lookup ON provider_areas(area_id, is_base_area, provider_id);
```

### 2.4 Table: `categories`
Top-level equipment categories managed by the Admin.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'Home Appliances', 'Vehicles'
  slug VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'home-appliances', 'vehicles'
  icon VARCHAR(50),                  -- Lucide icon name e.g. 'Refrigerator', 'Wrench'
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_active_sort ON categories(is_active, sort_order);
```

### 2.5 Table: `sub_services`
Specific repair specializations nested under categories.

```sql
CREATE TABLE sub_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g. 'Refrigerator / Freezer Repair'
  slug VARCHAR(100) NOT NULL, -- e.g. 'refrigerator-repair'
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_category_sub_service_slug UNIQUE (category_id, slug)
);

CREATE INDEX idx_sub_services_category ON sub_services(category_id, is_active, sort_order);
CREATE INDEX idx_sub_services_slug ON sub_services(slug);
```

### 2.6 Table: `provider_services`
Junction table linking approved providers to their declared repair specialties.

```sql
CREATE TABLE provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  sub_service_id UUID NOT NULL REFERENCES sub_services(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_provider_sub_service UNIQUE (provider_id, sub_service_id)
);

CREATE INDEX idx_provider_services_sub_service ON provider_services(sub_service_id, provider_id);
```

### 2.7 Table: `work_photos`
Metadata for repair work photos uploaded by providers. Files reside in Supabase Storage (`provider-photos`).

```sql
CREATE TABLE work_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  storage_path VARCHAR(255) NOT NULL, -- e.g. 'provider-uuid/photo-uuid.webp'
  sort_order SMALLINT NOT NULL DEFAULT 0,
  caption VARCHAR(255),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_photos_provider_sort ON work_photos(provider_id, sort_order);
```

### 2.8 Table: `listing_status_history`
Immutable audit log tracking all status transitions for provider listings.

```sql
CREATE TABLE listing_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  from_status provider_status_enum,
  to_status provider_status_enum NOT NULL,
  changed_by UUID REFERENCES auth.users(id), -- NULL if changed automatically by system trigger
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Captures snapshot diffs: e.g. {"old_phone_number": "+94...", "new_phone_number": "+94...", "old_business_name": "...", "new_business_name": "..."}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_provider ON listing_status_history(provider_id, created_at DESC);
```

### 2.9 Table: `rejection_reasons`
Pre-defined rejection codes and default messages for Admin moderation.

```sql
CREATE TABLE rejection_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'unreachable_whatsapp', 'suspicious_photos'
  label VARCHAR(255) NOT NULL,
  default_message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.10 Table: `contact_events`
Anonymous conversion event log when a customer taps "Continue to WhatsApp".

```sql
CREATE TABLE contact_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id),
  sub_service_id UUID REFERENCES sub_services(id),
  source_page VARCHAR(50) NOT NULL, -- 'directory_card' | 'profile_page'
  session_hash VARCHAR(64),          -- SHA256(ip + user_agent + date + provider_id + CONTACT_HASH_SALT)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_contact_events_provider_hash UNIQUE (provider_id, session_hash)
);

-- Strict privacy invariant: No customer personal data stored!
CREATE INDEX idx_contact_events_provider_time ON contact_events(provider_id, created_at);
CREATE INDEX idx_contact_events_session_rate ON contact_events(session_hash, created_at);
```

### 2.11 Table: `zero_result_searches`
Captures unserved local customer search queries for marketplace demand analysis.

```sql
CREATE TABLE zero_result_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_area_id UUID REFERENCES areas(id),
  selected_category_id UUID REFERENCES categories(id),
  selected_sub_service_id UUID REFERENCES sub_services(id),
  query_text VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_zero_results_area_service ON zero_result_searches(selected_area_id, selected_sub_service_id);
```

### 2.12 Table: `admin_users`
Internal platform administrators with operational privileges.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.13 Table: `rate_limit_buckets`
Centralized database store for sliding-window rate limiting on provider registrations (3/hour/IP) and contact clicks (10/min/IP).

```sql
CREATE TABLE rate_limit_buckets (
  key VARCHAR(255) PRIMARY KEY,      -- e.g. 'reg:192.168.1.1', 'contact:192.168.1.1'
  tokens INTEGER NOT NULL,           -- request count in current window
  last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_reset ON rate_limit_buckets(last_reset);
```

### 2.14 Table: `phone_blocklist`
Persistent blocklist of provider phone numbers that survives account deletion, preventing permanently rejected (`is_permanently_rejected = true`) or suspended (`status = 'suspended'`) providers from deleting their account and re-registering. Uses HMAC-SHA256 with a server-only secret (`PHONE_BLOCKLIST_SECRET`, environment variable, never stored in the database).

```sql
CREATE TABLE phone_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash VARCHAR(64) NOT NULL UNIQUE, -- HMAC_SHA256(e164_phone_number, PHONE_BLOCKLIST_SECRET)
  reason TEXT NOT NULL,
  provider_id UUID,                      -- Plain UUID with no foreign key constraint, since the provider row is deleted upon account removal
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phone_blocklist_hash ON phone_blocklist(phone_hash);

-- Row-Level Security
ALTER TABLE phone_blocklist ENABLE ROW LEVEL SECURITY;
-- No policies defined for anon or authenticated: access is strictly restricted to service_role
```

---

## 3. Public Projection View (Option A Enforced)

The public directory queries `public_providers`. This view pre-aggregates related data and strictly limits output to approved and verified providers. Under **Option A**, any listing in `pending_reverification` is omitted.

```sql
CREATE OR REPLACE VIEW public_providers AS
SELECT 
  p.id,
  p.phone_number,
  p.provider_type,
  p.personal_name,
  p.business_name,
  p.slug,
  p.description,
  p.physical_address,
  p.service_mode,
  p.price_type,
  p.visiting_fee,
  p.status,
  p.is_verified,
  p.created_at,
  -- Base Area Details
  base_a.id AS base_area_id,
  base_a.name AS base_area_name,
  base_a.slug AS base_area_slug,
  -- Areas Served Array (jsonb)
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'slug', a.slug))
     FROM provider_areas pa
     JOIN areas a ON a.id = pa.area_id
     WHERE pa.provider_id = p.id AND pa.is_base_area = false), '[]'::jsonb
  ) AS areas_served,
  -- Sub-Services Array (enriched with Category metadata for zero-join rendering)
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
       'id', ss.id, 
       'name', ss.name, 
       'slug', ss.slug, 
       'category_id', ss.category_id,
       'category_name', c.name,
       'category_slug', c.slug,
       'category_icon', c.icon
     ))
     FROM provider_services ps
     JOIN sub_services ss ON ss.id = ps.sub_service_id
     JOIN categories c ON c.id = ss.category_id
     WHERE ps.provider_id = p.id), '[]'::jsonb
  ) AS sub_services,
  -- Work Photos Array (jsonb)
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
       'id', wp.id, 
       'storage_path', wp.storage_path, 
       'sort_order', wp.sort_order, 
       'caption', wp.caption
     ) ORDER BY wp.sort_order ASC)
     FROM work_photos wp
     WHERE wp.provider_id = p.id), '[]'::jsonb
  ) AS photos,
  -- Photo Count for Ranking
  (SELECT COUNT(*)::int FROM work_photos wp WHERE wp.provider_id = p.id) AS photo_count
FROM providers p
JOIN provider_areas p_base ON p_base.provider_id = p.id AND p_base.is_base_area = true
JOIN areas base_a ON base_a.id = p_base.area_id
WHERE p.status = 'approved' AND p.is_verified = true AND p.requires_manual_repair = false;
```

---

## 4. Functions & Security Triggers

### 4.1 Invariant Protection Trigger: `fn_enforce_provider_column_protection`
Allows unrestricted updates when called via `service_role` (admin Server Actions), while strictly blocking unprivileged providers from modifying status, verification, or rejection fields. Automatically forces re-verification when key identity fields change.

```sql
CREATE OR REPLACE FUNCTION fn_enforce_provider_column_protection()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_or_service_role BOOLEAN;
BEGIN
  -- Check if caller is executing via service_role or authenticated admin
  IF (current_setting('role', true) = 'service_role') OR 
     (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())) THEN
    -- Admin service role has full mutation rights
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- If an authenticated non-admin provider is making the update
  IF (auth.role() = 'authenticated') THEN
    -- Block tampering with status, verification, rejection reasons, provider type, or system columns
    IF (NEW.status IS DISTINCT FROM OLD.status) OR 
       (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR 
       (NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason) OR
       (NEW.provider_type IS DISTINCT FROM OLD.provider_type) OR
       (NEW.must_change_password IS DISTINCT FROM OLD.must_change_password) OR
       (NEW.temp_password_expires_at IS DISTINCT FROM OLD.temp_password_expires_at) OR
       (NEW.submitted_at IS DISTINCT FROM OLD.submitted_at) OR
       (NEW.requires_manual_repair IS DISTINCT FROM OLD.requires_manual_repair) THEN
      RAISE EXCEPTION 'Unauthorized: Providers cannot directly modify listing status, verification, provider type, credentials, submission timestamps, or repair flags.'
        USING ERRCODE = 'P0001';
    END IF;

    -- Invariant: Provider URL slug is strictly immutable
    IF (NEW.slug IS DISTINCT FROM OLD.slug) THEN
      RAISE EXCEPTION 'Unauthorized: Provider URL slug is immutable.'
        USING ERRCODE = 'P0001';
    END IF;

    -- Security Guardrail: Direct modifications to live phone_number or business_name are blocked.
    -- Changes must be staged via SECURITY DEFINER RPC fn_request_identity_reverification().
    IF (NEW.phone_number IS DISTINCT FROM OLD.phone_number) OR 
       (NEW.business_name IS DISTINCT FROM OLD.business_name) THEN
      RAISE EXCEPTION 'Unauthorized: Phone number and business name changes must be staged via fn_request_identity_reverification().'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_provider_column_protection
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE FUNCTION fn_enforce_provider_column_protection();
```

### 4.2 Status History Logging Trigger: `fn_log_listing_status_history`

```sql
CREATE OR REPLACE FUNCTION fn_log_listing_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO listing_status_history (
      provider_id,
      from_status,
      to_status,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.rejection_reason
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_provider_status_history
AFTER UPDATE OF status ON providers
FOR EACH ROW
EXECUTE FUNCTION fn_log_listing_status_history();
```

---

## 5. Row-Level Security (RLS) Policy Matrix

| Table | `anon` (Public Visitor) | `authenticated` (Provider) | `service_role` (Admin Server Actions) |
|---|---|---|---|
| `providers` | `SELECT` denied (must use `public_providers`) | `SELECT` own row (`auth.uid() = id`), `UPDATE` own row (governed by trigger) | Full access (`ALL`) |
| `areas` | `SELECT` where `is_active = true` | `SELECT` where `is_active = true` | Full access (`ALL`) |
| `provider_areas` | `SELECT` (via view) | `SELECT`, `INSERT`, `DELETE` own rows (`provider_id = auth.uid()`) | Full access (`ALL`) |
| `categories` | `SELECT` where `is_active = true` | `SELECT` where `is_active = true` | Full access (`ALL`) |
| `sub_services` | `SELECT` where `is_active = true` | `SELECT` where `is_active = true` | Full access (`ALL`) |
| `provider_services`| `SELECT` (via view) | `SELECT`, `INSERT`, `DELETE` own rows (`provider_id = auth.uid()`) | Full access (`ALL`) |
| `work_photos` | `SELECT` (via view) | `SELECT`, `INSERT`, `DELETE` own rows (`provider_id = auth.uid()`) | Full access (`ALL`) |
| `listing_status_history`| Denied | `SELECT` own rows (`provider_id = auth.uid()`) | Full access (`ALL`) |
| `rejection_reasons` | Denied | Denied | Full access (`ALL`) |
| `contact_events` | `INSERT` allowed (via rate-limited Server Action) | Denied | Full access (`SELECT`, `ALL`) |
| `zero_result_searches` | `INSERT` allowed (via Server Action) | Denied | Full access (`SELECT`, `ALL`) |
| `admin_users` | Denied | Denied | Full access (`ALL`) |
| `rate_limit_buckets` | Denied | Denied | Full access (`ALL`) |
| `phone_blocklist` | Denied | Denied | Full access (`ALL`) |

---

## 6. Supabase Storage Policies & Server-Side Photo Verification

### 6.1 Bucket Configuration
- **Bucket ID:** `provider-photos`
- **Public:** `true`
- **Max File Size:** `10485760` bytes (10 MB)
- **Allowed MIME Types:** `['image/jpeg', 'image/png', 'image/webp']`

### 6.2 Storage RLS Policies
```sql
-- Public Read
CREATE POLICY "Public Read Work Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-photos');

-- Authenticated Provider Direct Upload (Own Folder Only)
CREATE POLICY "Providers Upload Own Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'provider-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated Provider Delete Own Photos
CREATE POLICY "Providers Delete Own Photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'provider-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 6.3 Server Action Metadata Verification Protocol
Before inserting a record into `work_photos`, the Server Action (`recordWorkPhotoAction`) executes three server-side checks:
1. **Ownership & Path Check:** Asserts that `storage_path` strictly matches the pattern `${providerId}/${photoId}.webp`.
2. **Object Existence & Metadata Verification:** Uses the Supabase Storage admin client to inspect the object's properties:
   ```typescript
   // Verify object exists and inspect real metadata
   const { data: fileData, error: fileError } = await supabaseAdmin.storage
     .from('provider-photos')
     .info(storagePath);

   if (fileError || !fileData) {
     throw new Error('Object not found in storage.');
   }
   if (!['image/jpeg', 'image/png', 'image/webp'].includes(fileData.contentType)) {
     throw new Error('Invalid file type.');
   }
   if (fileData.size > 10 * 1024 * 1024) {
     throw new Error('File exceeds 10MB limit.');
   }
   ```
3. **Database Insertion:** Inserts validated row into `work_photos`.

---

## 7. Ranking Query Implementation

```sql
SELECT 
  p.*,
  -- Rank Tier 1: Exact Base Area match (1) vs Visiting match (2)
  CASE 
    WHEN p.base_area_id = :selected_area_id THEN 1 
    ELSE 2 
  END AS area_match_tier,
  -- Rank Tier 2: Has photos (1) vs No photos (2)
  CASE 
    WHEN p.photo_count > 0 THEN 1 
    ELSE 2 
  END AS photo_rank_tier
FROM public_providers p
WHERE 
  p.sub_services @> jsonb_build_array(jsonb_build_object('id', :selected_sub_service_id))
  AND (
    p.base_area_id = :selected_area_id
    OR
    (p.service_mode IN ('comes_to_customer', 'both') AND
     p.areas_served @> jsonb_build_array(jsonb_build_object('id', :selected_area_id)))
  )
ORDER BY 
  area_match_tier ASC,  -- In-area always ranks ahead of visiting
  photo_rank_tier ASC,  -- Photo listings rank ahead of text-only
  p.created_at DESC;    -- Tie-breaker: newest listing first
```

---

## 8. Success Metrics & SQL Analytics

1. **Supply Liquidity Metric:**
   Count of approved, active providers in the Negombo pilot cluster:
   ```sql
   SELECT a.name AS area, COUNT(DISTINCT p.id) AS approved_providers
   FROM providers p
   JOIN provider_areas pa ON pa.provider_id = p.id AND pa.is_base_area = true
   JOIN areas a ON a.id = pa.area_id
   WHERE p.status = 'approved' AND p.is_verified = true
   GROUP BY a.name;
   ```
   *Target:* 15–25 verified providers across Negombo, Kochchikade, Katunayake, Seeduwa.

2. **Active Contact Rate Metric:**
   Percentage of approved listings receiving at least 2 contact clicks in the past 30 days:
   ```sql
   WITH active_listings AS (
     SELECT id FROM providers WHERE status = 'approved' AND is_verified = true
   ),
   contact_counts AS (
     SELECT provider_id, COUNT(*) AS contacts
     FROM contact_events
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY provider_id
   )
   SELECT 
     COUNT(al.id) AS total_approved,
     COUNT(cc.provider_id) FILTER (WHERE cc.contacts >= 2) AS engaged_listings,
     ROUND(100.0 * COUNT(cc.provider_id) FILTER (WHERE cc.contacts >= 2) / COUNT(al.id), 2) AS active_contact_rate_pct
   FROM active_listings al
   LEFT JOIN contact_counts cc ON cc.provider_id = al.id;
   ```
   *Target:* $\ge 60\%$ active contact rate.
