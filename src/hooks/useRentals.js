import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 과거 날짜 scheduled 대여를 반납 처리하고, 처리된 건수를 반환
async function autoReturnStale(rentals) {
  const today = getToday()
  const stale = rentals.filter(r => (r.status === 'scheduled' || r.status === 'rented') && r.rental_date < today)
  if (stale.length === 0) return false
  await Promise.all(stale.map(r =>
    supabase.from('rentals').update({ status: 'returned', returned_at: new Date().toISOString() }).eq('id', r.id)
  ))
  return true
}

export function useEquipmentRentals(equipmentId) {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*')
      .or(`camera_id.eq.${equipmentId},tripod_id.eq.${equipmentId}`)
      .order('rental_date', { ascending: false })
    const fetched = data || []
    const hadStale = await autoReturnStale(fetched)
    if (hadStale) {
      // 반납 처리 후 최신 데이터로 다시 fetch
      const { data: fresh } = await supabase
        .from('rentals')
        .select('*')
        .or(`camera_id.eq.${equipmentId},tripod_id.eq.${equipmentId}`)
        .order('rental_date', { ascending: false })
      setRentals(fresh || [])
    } else {
      setRentals(fetched)
    }
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

  return { rentals, loading, refetch: fetch }
}

// 모든 장비의 활성 대여 목록을 가져오는 훅
export function useAllRentals() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*')
      .in('status', ['rented', 'scheduled'])
      .order('rental_date', { ascending: true })
    const fetched = data || []
    const hadStale = await autoReturnStale(fetched)
    if (hadStale) {
      const { data: fresh } = await supabase
        .from('rentals')
        .select('*')
        .in('status', ['rented', 'scheduled'])
        .order('rental_date', { ascending: true })
      setRentals(fresh || [])
    } else {
      setRentals(fetched)
    }
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
