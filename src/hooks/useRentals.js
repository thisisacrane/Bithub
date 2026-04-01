import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 시간 기준으로 상태 자동 처리
//   scheduled → rented : 대여 당일 오후 2시 (14:00 KST = 05:00 UTC) 이후
//   rented    → returned: 대여 익일 오후 1시 (13:00 KST = 04:00 UTC) 이후
async function autoReturnStale(rentals) {
  const now = new Date()
  const toActivate = []
  const toReturn = []

  for (const r of rentals) {
    const base = new Date(r.rental_date) // midnight UTC of rental_date

    if (r.status === 'scheduled') {
      // rental_date 당일 05:00 UTC = 14:00 KST
      const activateAt = new Date(base)
      activateAt.setUTCHours(5, 0, 0, 0)
      if (now >= activateAt) toActivate.push(r)
    } else if (r.status === 'rented') {
      // rental_date 익일 04:00 UTC = 13:00 KST
      const returnAt = new Date(base)
      returnAt.setDate(returnAt.getDate() + 1)
      returnAt.setUTCHours(4, 0, 0, 0)
      if (now >= returnAt) toReturn.push(r)
    }
  }

  if (toActivate.length === 0 && toReturn.length === 0) return false

  await Promise.all([
    ...toActivate.map(r => supabase.from('rentals').update({ status: 'rented' }).eq('id', r.id)),
    ...toReturn.map(r => supabase.from('rentals').update({ status: 'returned', returned_at: new Date().toISOString() }).eq('id', r.id)),
  ])
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
