import { supabase } from '../lib/supabase'

export function useRentalActions() {
  const createRental = async (payload) => {
    const { data, error } = await supabase
      .from('rentals')
      .insert([payload])
      .select()
      .single()
    return { data, error }
  }

  const returnRental = async (rentalId) => {
    const { data, error } = await supabase
      .from('rentals')
      .update({ returned_at: new Date().toISOString(), status: 'returned' })
      .eq('id', rentalId)
      .select()
      .single()
    return { data, error }
  }

  return { createRental, returnRental }
}
