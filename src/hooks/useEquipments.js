import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useEquipments() {
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEquipments = async () => {
    const { data, error } = await supabase
      .from('equipments')
      .select(`
        *,
        current_rental:rentals!current_rental_id (
          borrower_name,
          borrower_generation,
          rental_date,
          due_date,
          purpose
        )
      `)
      .order('category')
      .order('name')

    if (error) {
      console.error('useEquipments error:', error.message, error.code, error.details, error.hint)
      setError(error)
    } else {
      setEquipments(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEquipments()

    const channel = supabase
      .channel('equipments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipments' }, fetchEquipments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetchEquipments)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { equipments, loading, error }
}
