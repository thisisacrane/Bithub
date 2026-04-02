import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 날짜 기준 상태 자동 처리 (KST 오늘 날짜 기준)
//   scheduled → rented  : rental_date === today
//   * → returned        : rental_date < today (이미 returned인 건 스킵)
export async function autoReturnStale(rentals) {
  const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const toActivate = []
  const toReturn = []

  for (const r of rentals) {
    if (r.status !== 'returned' && r.rental_date < kstToday) {
      toReturn.push(r)
    } else if (r.status === 'scheduled' && r.rental_date === kstToday) {
      toActivate.push(r)
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

    // 자정이 지나면 자동 갱신 (autoReturnStale 재실행)
    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now + 1000
    const midnightTimer = setTimeout(() => fetch(), msUntilMidnight)

    const channel = supabase
      .channel(`rentals-${equipmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetch)
      .subscribe()

    return () => {
      clearTimeout(midnightTimer)
      supabase.removeChannel(channel)
    }
  }, [equipmentId])

  return { rentals, loading, refetch: fetch }
}

// 모든 장비의 대여 목록 (활성 + 최근 30일 반납 포함 — 과거 날짜 조회 지원)
export function useAllRentals() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const thirtyDaysAgo = new Date(Date.now() + 9 * 60 * 60 * 1000 - 30 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10)

    const [{ data: activeData }, { data: returnedData }] = await Promise.all([
      supabase.from('rentals').select('*').in('status', ['rented', 'scheduled']).order('rental_date', { ascending: true }),
      supabase.from('rentals').select('*').eq('status', 'returned').gte('rental_date', thirtyDaysAgo).order('rental_date', { ascending: true }),
    ])

    const fetched = [...(activeData || []), ...(returnedData || [])]
    const hadStale = await autoReturnStale(fetched)
    if (hadStale) {
      const [{ data: freshActive }, { data: freshReturned }] = await Promise.all([
        supabase.from('rentals').select('*').in('status', ['rented', 'scheduled']).order('rental_date', { ascending: true }),
        supabase.from('rentals').select('*').eq('status', 'returned').gte('rental_date', thirtyDaysAgo).order('rental_date', { ascending: true }),
      ])
      setRentals([...(freshActive || []), ...(freshReturned || [])])
    } else {
      setRentals(fetched)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()

    // 자정이 지나면 자동 갱신 (autoReturnStale 재실행)
    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now + 1000
    const midnightTimer = setTimeout(() => fetchAll(), msUntilMidnight)

    const channel = supabase
      .channel('all-rentals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetchAll)
      .subscribe()

    return () => {
      clearTimeout(midnightTimer)
      supabase.removeChannel(channel)
    }
  }, [])

  return { rentals, loading }
}
