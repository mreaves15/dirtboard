'use client'

import { useState, useEffect, useCallback } from 'react'
import { getProperties, getProperty, createProperty, updateProperty, deleteProperty } from '@/lib/api'
import type { Property, PropertyInsert, PropertyUpdate } from '@/types/database'

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProperties()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch properties'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const addProperty = async (property: PropertyInsert) => {
    const newProperty = await createProperty(property)
    setProperties(prev => [newProperty, ...prev])
    return newProperty
  }

  const editProperty = async (id: string, updates: PropertyUpdate) => {
    const updated = await updateProperty(id, updates)
    setProperties(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }

  const removeProperty = async (id: string) => {
    await deleteProperty(id)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    addProperty,
    editProperty,
    removeProperty,
  }
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProperty(id)
      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch property'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  const update = async (updates: PropertyUpdate) => {
    const updated = await updateProperty(id, updates)
    setProperty(updated)
    return updated
  }

  return {
    property,
    loading,
    error,
    refetch: fetchProperty,
    update,
  }
}
