import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { autoReturnStale } from './useRentals'

export function useAllRentals(year, month) {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    // 해당 월의 첫날 ~ 마지막날
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const { data } = await supabase
      .from('rentals')
      .select(`
        id,
        borrower_name,
        borrower_generation,
        borrower_department,
        rental_date,
        due_date,
        status,
        camera:equipments!camera_id(name),
        tripod:equipments!tripod_id(name)
      `)
      .lte('rental_date', to)
      .gte('due_date', from)
      .order('rental_date')

    const fetched = data || []
    const hadStale = await autoReturnStale(fetched)
    if (hadStale) {
      const { data: fresh } = await supabase
        .from('rentals')
        .select(`
        id,
        borrower_name,
        borrower_generation,
        borrower_department,
        rental_date,
        due_date,
        status,
        camera:equipments!camera_id(name),
        tripod:equipments!tripod_id(name)
      `)
        .lte('rental_date', to)
        .gte('due_date', from)
        .order('rental_date')
      setRentals(fresh || [])
    } else {
      setRentals(fetched)
    }
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetch()

    const channel = supabase
      .channel('rentals-calendar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [year, month])

  return { rentals, loading, refetch: fetch }
}
