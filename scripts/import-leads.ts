/**
 * Import existing leads from Google Drive CSV into Supabase
 * Run with: npx tsx scripts/import-leads.ts
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

// Load env from .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Map CSV status to our status enum
function mapStatus(csvStatus: string): string {
  const statusMap: Record<string, string> = {
    'QUALIFIED': 'qualified',
    'RESEARCH': 'new',
    'NEW': 'new',
    'CONTACTED': 'contacted',
    'DISQUALIFIED': 'disqualified',
  }
  return statusMap[csvStatus.toUpperCase()] || 'new'
}

// Parse the CSV data
interface CsvLead {
  Lead_ID: string
  Date_Added: string
  Lead_Source: string
  Status: string
  Priority: string
  Owner_Name: string
  Property_Address: string
  Parcel_ID: string
  County: string
  Subdivision: string
  Size_Acres: string
  Market_Value: string
  Asking_Price: string
  Flood_Zone: string
  Tax_Status: string
  Contact_Name: string
  Contact_Address: string
  Contact_Phone: string
  Contact_Email: string
  Last_Contact_Date: string
  Last_Contact_Method: string
  Next_Follow_Up: string
  Contact_Attempts: string
  Offer_Amount: string
  Notes: string
}

async function importLeads(csvPath: string) {
  console.log(`Reading CSV from: ${csvPath}`)
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records: CsvLead[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  })

  console.log(`Found ${records.length} leads to import`)

  for (const record of records) {
    const property = {
      parcel_id: record.Parcel_ID,
      county: record.County || 'Putnam',
      owner_name: record.Owner_Name,
      source: record.Lead_Source?.toLowerCase() || 'probate',
      status: mapStatus(record.Status),
      pipeline_stage: mapStatus(record.Status) === 'qualified' ? 4 : 1,
      
      // Property details
      address: record.Property_Address || null,
      subdivision: record.Subdivision || null,
      acreage: record.Size_Acres ? parseFloat(record.Size_Acres) : null,
      market_value: record.Market_Value ? parseInt(record.Market_Value) : null,
      asking_price: record.Asking_Price ? parseInt(record.Asking_Price) : null,
      
      // Flood & Tax
      flood_zone: record.Flood_Zone || null,
      tax_status: record.Tax_Status?.toLowerCase() === 'clear' ? 'current' : null,
      
      // Offer
      target_offer_price: record.Offer_Amount ? parseInt(record.Offer_Amount) : null,
      
      // Notes
      notes: record.Notes || null,
      
      // Motivation indicators
      is_inherited: record.Lead_Source?.toLowerCase() === 'probate',
      is_out_of_state: record.Contact_Address ? !record.Contact_Address.includes('FL') : null,
      
      // Defaults
      property_type: 'raw_land',
      improvement_value: 0,
    }

    console.log(`Importing: ${record.Owner_Name} (${record.Parcel_ID})`)

    // Insert property
    const { data: propData, error: propError } = await supabase
      .from('properties')
      .upsert(property, { onConflict: 'parcel_id,county' })
      .select()
      .single()

    if (propError) {
      console.error(`  Error inserting property: ${propError.message}`)
      continue
    }

    console.log(`  ✓ Property created: ${propData.id}`)

    // Insert contacts if present
    if (record.Contact_Name || record.Contact_Phone || record.Contact_Email) {
      const contacts = []

      if (record.Contact_Phone) {
        contacts.push({
          property_id: propData.id,
          contact_type: 'phone',
          value: record.Contact_Phone,
          label: 'primary',
          source: 'skip_trace',
        })
      }

      if (record.Contact_Email) {
        contacts.push({
          property_id: propData.id,
          contact_type: 'email',
          value: record.Contact_Email,
          label: 'primary',
          source: 'skip_trace',
        })
      }

      if (record.Contact_Address) {
        contacts.push({
          property_id: propData.id,
          contact_type: 'mailing_address',
          value: `${record.Contact_Name}\n${record.Contact_Address}`,
          label: 'heir',
          source: 'skip_trace',
        })
      }

      for (const contact of contacts) {
        const { error: contactError } = await supabase
          .from('contacts')
          .insert(contact)

        if (contactError) {
          console.error(`  Error inserting contact: ${contactError.message}`)
        } else {
          console.log(`  ✓ Contact added: ${contact.contact_type}`)
        }
      }
    }
  }

  console.log('\n✅ Import complete!')
}

// Main
const csvPath = process.argv[2] || '/tmp/leads.csv'
importLeads(csvPath).catch(console.error)
