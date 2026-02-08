// API layer for Supabase operations
import { supabase } from './supabase'
import type { 
  Property, 
  PropertyInsert, 
  PropertyUpdate,
  Contact, 
  ContactInsert,
  Comp, 
  CompInsert,
  ActivityLog, 
  ActivityLogInsert,
  SavedView, 
  SavedViewInsert,
  SavedViewUpdate 
} from '@/types/database'

// ============ Properties ============

export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Property[]
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Property
}

export async function createProperty(property: PropertyInsert) {
  const { data, error } = await supabase
    .from('properties')
    .insert(property as never)
    .select()
    .single()
  
  if (error) throw error
  return data as Property
}

export async function updateProperty(id: string, updates: PropertyUpdate) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Property
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============ Contacts ============

export async function getContacts(propertyId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Contact[]
}

export async function createContact(contact: ContactInsert) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact as never)
    .select()
    .single()
  
  if (error) throw error
  return data as Contact
}

export async function deleteContact(id: string) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============ Comps ============

export async function getComps(propertyId: string) {
  const { data, error } = await supabase
    .from('comps')
    .select('*')
    .eq('property_id', propertyId)
    .order('comp_date', { ascending: false })
  
  if (error) throw error
  return data as Comp[]
}

export async function createComp(comp: CompInsert) {
  const { data, error } = await supabase
    .from('comps')
    .insert(comp as never)
    .select()
    .single()
  
  if (error) throw error
  return data as Comp
}

export async function deleteComp(id: string) {
  const { error } = await supabase
    .from('comps')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============ Activity Log ============

export async function getActivityLog(propertyId: string) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('property_id', propertyId)
    .order('activity_date', { ascending: false })
  
  if (error) throw error
  return data as ActivityLog[]
}

export async function createActivity(activity: ActivityLogInsert) {
  const { data, error } = await supabase
    .from('activity_log')
    .insert(activity as never)
    .select()
    .single()
  
  if (error) throw error
  return data as ActivityLog
}

// ============ Saved Views ============

export async function getSavedViews() {
  const { data, error } = await supabase
    .from('saved_views')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) throw error
  return data as SavedView[]
}

export async function createSavedView(view: SavedViewInsert) {
  const { data, error } = await supabase
    .from('saved_views')
    .insert(view as never)
    .select()
    .single()
  
  if (error) throw error
  return data as SavedView
}

export async function updateSavedView(id: string, updates: SavedViewUpdate) {
  const { data, error } = await supabase
    .from('saved_views')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as SavedView
}

export async function deleteSavedView(id: string) {
  const { error } = await supabase
    .from('saved_views')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
