// Database types based on DirtBoard PRD

export type PropertyStatus = 
  | 'new'
  | 'appraiser_review'
  | 'flood_check'
  | 'skip_trace'
  | 'tax_check'
  | 'lien_check'
  | 'access_check'
  | 'valuation'
  | 'qualified'
  | 'contacted'
  | 'offer_made'
  | 'under_contract'
  | 'closed_won'
  | 'closed_lost'
  | 'listed_for_sale'
  | 'sold'
  | 'disqualified'

export type DisqualificationReason =
  | 'not_raw_land'
  | 'outlot'
  | 'row'
  | 'easement'
  | 'partial_interest'
  | 'too_small'
  | 'too_large'
  | 'too_expensive'
  | 'has_hoa'
  | 'flood_zone'
  | 'tax_deed_pending'
  | 'excessive_taxes'
  | 'has_liens'
  | 'clouded_title'
  | 'landlocked'
  | 'no_utilities'
  | 'wetlands'
  | 'insufficient_margin'
  | 'seller_is_flipper'
  | 'other'

export type PropertyType = 
  | 'raw_land'
  | 'improved'
  | 'mobile_home'
  | 'unknown'

export type TaxStatus = 
  | 'current'
  | 'delinquent'
  | 'tax_deed_pending'

export type TitleStatus = 
  | 'clear'
  | 'has_liens'
  | 'has_mortgage'
  | 'clouded'

export type SellerType = 
  | 'individual'
  | 'estate'
  | 'investor'
  | 'bank'
  | 'unknown'

export type DealVerdict = 
  | 'good_deal'
  | 'maybe'
  | 'pass'

export type OfferStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'expired'

export type ContactType = 
  | 'phone'
  | 'email'
  | 'mailing_address'

export type CompType = 
  | 'sold'
  | 'active_listing'
  | 'pending'

export type ActivityType = 
  | 'call'
  | 'text'
  | 'email'
  | 'mail'
  | 'voicemail'
  | 'site_visit'
  | 'research'
  | 'status_change'
  | 'offer'
  | 'note'

export interface Property {
  id: string
  parcel_id: string
  county: string
  owner_name: string
  source?: string
  created_at: string
  updated_at: string
  
  // Property Details (Stage 2)
  address?: string
  city?: string
  zip?: string
  subdivision?: string
  legal_description?: string
  acreage?: number
  improvement_value?: number
  land_value?: number
  market_value?: number
  dor_code?: string
  zoning?: string
  property_type?: PropertyType
  
  // Qualification Checks
  has_hoa?: boolean
  hoa_fee?: number
  flood_zone?: string
  has_road_access?: boolean
  road_type?: string
  has_power_at_road?: boolean
  is_landlocked?: boolean
  has_wetlands?: boolean
  allows_mobile_homes?: boolean
  
  // Tax Status (Stage 5)
  tax_status?: TaxStatus
  annual_taxes?: number
  taxes_owed?: number
  years_delinquent?: number
  has_tax_certificate?: boolean
  tax_sale_date?: string
  
  // Liens & Title (Stage 6)
  has_liens?: boolean
  lien_details?: LienDetail[]
  has_mortgage?: boolean
  mortgage_details?: string
  title_status?: TitleStatus
  
  // Motivation Indicators (Stage 9)
  is_out_of_state?: boolean
  is_inherited?: boolean
  is_long_term_holder?: boolean
  is_tax_delinquent_motivated?: boolean
  seller_type?: SellerType
  
  // Valuation & Deal Math (Stage 8)
  asking_price?: number
  price_per_acre?: number
  estimated_retail_value?: number
  target_offer_price?: number
  estimated_margin_percent?: number
  deal_verdict?: DealVerdict
  
  // Pipeline & Status
  status: PropertyStatus
  disqualification_reason?: DisqualificationReason
  disqualification_notes?: string
  pipeline_stage: number
  
  // Offer & Deal Tracking
  offer_amount?: number
  offer_date?: string
  counter_amount?: number
  offer_status?: OfferStatus
  accepted_price?: number
  closing_date?: string
  actual_purchase_price?: number
  sale_price?: number
  actual_profit?: number
  
  // Notes
  notes?: string
}

export interface LienDetail {
  type: string
  amount: number
  holder: string
  date: string
}

export interface Contact {
  id: string
  property_id: string
  contact_type: ContactType
  value: string
  label?: string
  is_valid?: boolean
  source?: string
  created_at: string
}

export interface Comp {
  id: string
  property_id: string
  comp_address?: string
  comp_county?: string
  comp_subdivision?: string
  comp_acreage?: number
  comp_price?: number
  comp_price_per_acre?: number
  comp_type?: CompType
  comp_date?: string
  comp_source?: string
  notes?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  property_id: string
  activity_type: ActivityType
  activity_date: string
  outcome?: string
  follow_up_date?: string
  method?: string
  contact_used?: string
  notes?: string
  created_by: string
  created_at: string
}

export interface SavedView {
  id: string
  name: string
  filters: Record<string, unknown>
  sort: { column: string; direction: 'asc' | 'desc' }
  visible_columns: string[]
  is_default: boolean
  display_order: number
  created_at: string
}

// Insert types (omit auto-generated fields)
export type PropertyInsert = Omit<Property, 'id' | 'created_at' | 'updated_at'>
export type PropertyUpdate = Partial<PropertyInsert>
export type ContactInsert = Omit<Contact, 'id' | 'created_at'>
export type ContactUpdate = Partial<ContactInsert>
export type CompInsert = Omit<Comp, 'id' | 'created_at'>
export type CompUpdate = Partial<CompInsert>
export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>
export type SavedViewInsert = Omit<SavedView, 'id' | 'created_at'>
export type SavedViewUpdate = Partial<SavedViewInsert>

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property
        Insert: PropertyInsert
        Update: PropertyUpdate
      }
      contacts: {
        Row: Contact
        Insert: ContactInsert
        Update: ContactUpdate
      }
      comps: {
        Row: Comp
        Insert: CompInsert
        Update: CompUpdate
      }
      activity_log: {
        Row: ActivityLog
        Insert: ActivityLogInsert
        Update: Partial<ActivityLogInsert>
      }
      saved_views: {
        Row: SavedView
        Insert: SavedViewInsert
        Update: SavedViewUpdate
      }
    }
  }
}
