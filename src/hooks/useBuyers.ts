'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Buyer, BuyerInsert, BuyerUpdate } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- buyers table is not in the generated Database type
const db = (): any => getSupabase()

export function useBuyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBuyers = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await db()
      .from('buyers')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(new Error(fetchError.message))
    } else {
      setBuyers(data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBuyers()
  }, [fetchBuyers])

  const addBuyer = async (buyer: BuyerInsert) => {
    const { data, error: insertError } = await db()
      .from('buyers')
      .insert(buyer)
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)
    setBuyers(prev => [data, ...prev])
    return data
  }

  const updateBuyer = async (id: string, updates: BuyerUpdate) => {
    const { data, error: updateError } = await db()
      .from('buyers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    setBuyers(prev => prev.map(b => b.id === id ? data : b))
    return data
  }

  const deleteBuyer = async (id: string) => {
    const { error: deleteError } = await db()
      .from('buyers')
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(deleteError.message)
    setBuyers(prev => prev.filter(b => b.id !== id))
  }

  return { buyers, loading, error, addBuyer, updateBuyer, deleteBuyer, refetch: fetchBuyers }
}
