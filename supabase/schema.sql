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
  property_type TEXT DEFAULT 'unknown',
  
  -- Qualification Checks
  has_hoa BOOLEAN,
  hoa_fee DECIMAL,
  flood_zone TEXT,
  has_road_access BOOLEAN,
  road_type TEXT,
  has_power_at_road BOOLEAN,
  is_landlocked BOOLEAN,
  has_wetlands BOOLEAN,
  allows_mobile_homes BOOLEAN,
  
  -- Tax Status (Stage 5)
  tax_status TEXT,
  annual_taxes DECIMAL,
  taxes_owed DECIMAL,
  years_delinquent INTEGER,
  has_tax_certificate BOOLEAN,
  tax_sale_date DATE,
  
  -- Liens & Title (Stage 6)
  has_liens BOOLEAN,
  lien_details JSONB,
  has_mortgage BOOLEAN,
  mortgage_details TEXT,
  title_status TEXT,
  
  -- Motivation Indicators
  is_out_of_state BOOLEAN,
  is_inherited BOOLEAN,
  is_long_term_holder BOOLEAN,
  is_tax_delinquent_motivated BOOLEAN,
  seller_type TEXT,
  
  -- Valuation & Deal Math (Stage 8)
  asking_price DECIMAL,
  price_per_acre DECIMAL,
  estimated_retail_value DECIMAL,
  target_offer_price DECIMAL,
  estimated_margin_percent DECIMAL,
  deal_verdict TEXT,
  
  -- Pipeline & Status
  status TEXT NOT NULL DEFAULT 'new',
  disqualification_reason TEXT,
  disqualification_notes TEXT,
  pipeline_stage INTEGER NOT NULL DEFAULT 1,
  
  -- Offer & Deal Tracking
  offer_amount DECIMAL,
  offer_date DATE,
  counter_amount DECIMAL,
  offer_status TEXT,
  accepted_price DECIMAL,
  closing_date DATE,
  actual_purchase_price DECIMAL,
  sale_price DECIMAL,
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
CREATE INDEX idx_properties_pipeline_stage ON properties(pipeline_stage);
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
