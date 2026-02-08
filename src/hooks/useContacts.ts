'use client'

import { useState, useEffect, useCallback } from 'react'
import { getContacts, createContact, deleteContact } from '@/lib/api'
import type { Contact, ContactInsert } from '@/types/database'

export function usePropertyContacts(propertyId: string) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getContacts(propertyId)
      setContacts(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contacts'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const addContact = async (contact: ContactInsert) => {
    const newContact = await createContact(contact)
    setContacts(prev => [newContact, ...prev])
    return newContact
  }

  const removeContact = async (id: string) => {
    await deleteContact(id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    addContact,
    removeContact,
  }
}
