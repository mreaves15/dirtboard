#!/usr/bin/env npx tsx
/**
 * DirtBoard CLI - Database operations for skills
 * 
 * Usage:
 *   npx tsx scripts/db.ts <command> [args]
 * 
 * Commands:
 *   list                          - List all properties
 *   get <id>                      - Get property by ID
 *   find-parcel <parcel_id>       - Find by parcel ID
 *   add <json>                    - Add new property
 *   update <id> <json>            - Update property
 *   disqualify <id> <reason> [notes] - Disqualify property
 *   add-contact <property_id> <type> <value> [label] - Add contact
 *   log <property_id> <notes>     - Log activity
 *   needs-validation              - List properties needing due diligence
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load env from dirtboard project
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  const [,, command, ...args] = process.argv

  switch (command) {
    case 'list': {
      const { data, error } = await supabase
        .from('properties')
        .select('id, owner_name, status, parcel_id, county')
        .order('created_at', { ascending: false })
      if (error) throw error
      console.log(JSON.stringify(data, null, 2))
      break
    }

    case 'get': {
      const [id] = args
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      console.log(JSON.stringify(data, null, 2))
      break
    }

    case 'find-parcel': {
      const [parcelId] = args
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('parcel_id', parcelId)
        .single()
      if (error && error.code !== 'PGRST116') throw error  // PGRST116 = not found
      console.log(JSON.stringify(data || null, null, 2))
      break
    }

    case 'add': {
      const [jsonStr] = args
      const property = JSON.parse(jsonStr)
      const { data, error } = await supabase
        .from('properties')
        .insert({
          status: 'new',
          pipeline_stage: 1,
          property_type: 'raw_land',
          ...property
        })
        .select()
        .single()
      if (error) throw error
      console.log('Created:', data.id)
      console.log(JSON.stringify(data, null, 2))
      break
    }

    case 'update': {
      const [id, jsonStr] = args
      const updates = JSON.parse(jsonStr)
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      console.log('Updated:', data.id)
      console.log(JSON.stringify(data, null, 2))
      break
    }

    case 'disqualify': {
      const [id, reason, notes] = args
      const { data, error } = await supabase
        .from('properties')
        .update({
          status: 'disqualified',
          disqualification_reason: reason,
          disqualification_notes: notes || null,
          pipeline_stage: 0
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      console.log('Disqualified:', data.id, '-', reason)
      break
    }

    case 'add-contact': {
      const [propertyId, contactType, value, label] = args
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          property_id: propertyId,
          contact_type: contactType,
          value: value,
          label: label || 'primary',
          source: 'skip_trace'
        })
        .select()
        .single()
      if (error) throw error
      console.log('Contact added:', data.id)
      break
    }

    case 'log': {
      const [propertyId, ...notesParts] = args
      const notes = notesParts.join(' ')
      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          property_id: propertyId,
          activity_type: 'research',
          notes: notes,
          created_by: 'jorge'
        })
        .select()
        .single()
      if (error) throw error
      console.log('Activity logged:', data.id)
      break
    }

    case 'needs-validation': {
      const { data, error } = await supabase
        .from('properties')
        .select('id, owner_name, parcel_id, status, tax_status')
        .eq('status', 'qualified')
        .is('tax_status', null)
      if (error) throw error
      console.log('Properties needing validation:', data?.length || 0)
      console.log(JSON.stringify(data, null, 2))
      break
    }

    default:
      console.log(`Unknown command: ${command}`)
      console.log('Commands: list, get, find-parcel, add, update, disqualify, add-contact, log, needs-validation')
      process.exit(1)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
