-- DirtBoard Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table (main)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id TEXT NOT NULL,
  county TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Property Details (Stage 2)
  address TEXT,
  city TEXT,
  zip TEXT,
  subdivision TEXT,
  legal_description TEXT,
  acreage DECIMAL,
  improvement_value INTEGER,
  land_value INTEGER,
  market_value INTEGER,
  dor_code TEXT,
  zoning TEXT,
  property_type TEXT CHECK (property_type IN ('raw_land', 'improved', 'mobile_home')),
  
  -- Qualification Checks
  has_hoa BOOLEAN,
  annual_assessment DECIMAL,
  flood_zone TEXT,
  has_road_access BOOLEAN,
  road_type TEXT,
  is_landlocked BOOLEAN,
  has_wetlands BOOLEAN,
  allows_mobile_homes BOOLEAN,
  
  -- Tax Status (Stage 5)
  tax_status TEXT,
  annual_taxes DECIMAL,
  taxes_owed DECIMAL,
  years_delinquent INTEGER,
  has_tax_certificate BOOLEAN,

  -- Liens & Title (Stage 6)
  has_liens BOOLEAN,
  lien_details JSONB,
  has_mortgage BOOLEAN,
  title_status TEXT,
  
  -- Motivation Indicators
  is_out_of_state BOOLEAN,
  is_inherited BOOLEAN,
  is_long_term_holder BOOLEAN,
  seller_type TEXT,
  
  -- Valuation & Deal Math (Stage 8)
  asking_price DECIMAL,
  price_per_acre DECIMAL,
  estimated_retail_value DECIMAL,
  target_offer_price DECIMAL,
  estimated_margin_percent DECIMAL,

  -- Pipeline & Status
  status TEXT NOT NULL DEFAULT 'new',
  disqualification_reason TEXT CHECK (disqualification_reason IN (
    'not_raw_land','outlot','too_expensive','flood_zone','wetlands','landlocked','conservation_zoning',
    'already_sold','already_transferred','clouded_title','has_liens','excessive_taxes','tax_deed_pending',
    'weak_buyer_pool','insufficient_margin','investor_owned',
    'parcel_not_found','no_pa_match','no_property','wrong_person','unplatted_complex',
    'recent_arms_length_sale','hoa_buyer_pool_restriction','other'
  )),
  disqualification_notes TEXT,

  
  -- Offer & Deal Tracking
  offer_amount DECIMAL,
  offer_date DATE,
  counter_amount DECIMAL,
  offer_status TEXT CHECK (offer_status IS NULL OR offer_status IN (
    'pending','accepted','rejected','countered','expired'
  )),
  buy_accepted DECIMAL,
  closing_date DATE,
  buy_final DECIMAL,
  resale_price DECIMAL,
  actual_profit DECIMAL,
  
  -- Notes
  notes TEXT,
  
  -- Constraints
  UNIQUE(parcel_id, county)
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL, -- phone, email, mailing_address
  value TEXT NOT NULL,
  label TEXT, -- primary, secondary, skip_trace, etc.
  is_valid BOOLEAN DEFAULT TRUE,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comps table
CREATE TABLE comps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  comp_address TEXT,
  comp_county TEXT,
  comp_subdivision TEXT,
  comp_acreage DECIMAL,
  comp_price DECIMAL,
  comp_price_per_acre DECIMAL,
  comp_type TEXT, -- sold, active_listing, pending
  comp_date DATE,
  comp_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- call, text, email, mail, etc.
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  outcome TEXT,
  follow_up_date DATE,
  method TEXT,
  contact_used TEXT,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'matt',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Views table
CREATE TABLE saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  sort JSONB NOT NULL DEFAULT '{"column": "created_at", "direction": "desc"}',
  visible_columns JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_county ON properties(county);

CREATE INDEX idx_properties_parcel_id ON properties(parcel_id);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_contacts_property_id ON contacts(property_id);
CREATE INDEX idx_comps_property_id ON comps(property_id);
CREATE INDEX idx_activity_log_property_id ON activity_log(property_id);
CREATE INDEX idx_activity_log_activity_date ON activity_log(activity_date);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (disabled for MVP - enable later if needed)
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
