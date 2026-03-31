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
      .order('rental_date', { ascending: false })
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

// 모든 장비의 활성 대여 목록을 가져오는 훅
export function useAllRentals() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*')
      .eq('status', 'rented')
      .order('rental_date', { ascending: true })
    setRentals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()

    const channel = supabase
      .channel('all-rentals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetchAll)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { rentals, loading }
}
