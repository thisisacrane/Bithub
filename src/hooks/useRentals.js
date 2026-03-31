import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useEquipmentRentals(equipmentId) {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*')
      .or(`camera_id.eq.${equipmentId},tripod_id.eq.${equipmentId}`)
      .order('created_at', { ascending: false })
    setRentals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!equipmentId) return
    fetch()

    const channel = supabase
      .channel(`rentals-${equipmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [equipmentId])

  return { rentals, loading }
}
