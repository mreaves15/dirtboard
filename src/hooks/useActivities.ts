'use client'

import { useState, useEffect, useCallback } from 'react'
import { getActivityLog, createActivity } from '@/lib/api'
import type { ActivityLog, ActivityLogInsert } from '@/types/database'

export function usePropertyActivities(propertyId: string) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActivityLog(propertyId)
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'))
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const logActivity = async (activity: ActivityLogInsert) => {
    const newActivity = await createActivity(activity)
    setActivities(prev => [newActivity, ...prev])
    return newActivity
  }

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    logActivity,
  }
}
