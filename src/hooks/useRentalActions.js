import { supabase } from '../lib/supabase'

export function useRentalActions() {
  const createRental = async (payload) => {
    const today = new Date().toISOString().slice(0, 10)
    const isPast = payload.rental_date < today
    const isFuture = payload.rental_date > today

    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
    const isBeforeActivation = nowKST.getUTCHours() < 14 // 오후 2시(14:00 KST) 이전

    let insertPayload = { ...payload }
    if (isPast) {
      insertPayload = { ...payload, status: 'returned', returned_at: new Date().toISOString() }
    } else if (isFuture || (payload.rental_date === today && isBeforeActivation)) {
      insertPayload = { ...payload, status: 'scheduled' }
    }
    // rental_date === today이고 오후 2시 이후 → status 기본값 'rented' 유지

    const { data, error } = await supabase
      .from('rentals')
      .insert([insertPayload])
      .select()
      .single()

    // 과거 날짜 대여 → 장비 상태를 다시 available로 복구
    if (!error && isPast) {
      if (payload.camera_id) {
        await supabase.from('equipments').update({ status: 'available', current_rental_id: null }).eq('id', payload.camera_id)
      }
      if (payload.tripod_id) {
        await supabase.from('equipments').update({ status: 'available', current_rental_id: null }).eq('id', payload.tripod_id)
      }
    }

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

  const deleteRental = async (rentalId, pin) => {
    // PIN 확인을 위해 대여 정보 조회
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('id, pin, status, camera_id, tripod_id')
      .eq('id', rentalId)
      .single()

    if (fetchError || !rental) return { error: '대여 정보를 찾을 수 없습니다.' }
    if (rental.pin !== pin) return { error: '비밀번호가 올바르지 않습니다.' }

    // 아직 활성 상태면 장비 상태 복구
    if (rental.status === 'rented' || rental.status === 'scheduled') {
      if (rental.camera_id) {
        await supabase
          .from('equipments')
          .update({ status: 'available', current_rental_id: null })
          .eq('id', rental.camera_id)
      }
      if (rental.tripod_id) {
        await supabase
          .from('equipments')
          .update({ status: 'available', current_rental_id: null })
          .eq('id', rental.tripod_id)
      }
    }

    const { error } = await supabase.from('rentals').delete().eq('id', rentalId)
    return { error }
  }

  return { createRental, returnRental, deleteRental }
}
