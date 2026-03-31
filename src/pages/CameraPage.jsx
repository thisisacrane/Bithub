import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEquipmentRentals } from '../hooks/useRentals'
import StatusBadge from '../components/equipment/StatusBadge'
import RentalForm from '../components/equipment/RentalForm'
import { PURPOSE_LABELS } from '../constants/rules'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export default function CameraPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const { rentals } = useEquipmentRentals(id)

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from('equipments')
      .select(`
        *,
        current_rental:rentals!current_rental_id (
          id,
          borrower_name,
          borrower_generation,
          borrower_department,
          borrower_contact,
          due_date,
          rental_date,
          purpose,
          purpose_detail,
          camera_id,
          tripod_id
        )
      `)
      .eq('id', id)
      .single()
    setEquipment(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEquipment()

    const channel = supabase
      .channel(`equipment-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipments' }, fetchEquipment)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, fetchEquipment)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
      불러오는 중...
    </div>
  )

  if (!equipment) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
      장비를 찾을 수 없어요.
    </div>
  )

  const rental = equipment.current_rental

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        장비 목록
      </button>

      {/* 장비 이미지 */}
      <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {equipment.image_url ? (
          <img src={equipment.image_url} alt={equipment.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ opacity: 0.15 }}>
            {equipment.category === 'camera' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            )}
          </div>
        )}
      </div>

      {/* 장비 정보 */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 기본 정보 */}
        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 2px' }}>{equipment.brand}</p>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>{equipment.name}</h1>
          {equipment.lens_info && <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>{equipment.lens_info}</p>}
          <StatusBadge status={equipment.status} rental={rental} />
        </div>

        {equipment.guide_text && (
          <div style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', margin: 0 }}>💡 {equipment.guide_text}</p>
          </div>
        )}

        {/* 현재 대여 정보 */}
        {rental && (
          <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8', margin: '0 0 8px' }}>현재 대여 중</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
                <strong>{rental.borrower_generation}기 {rental.borrower_name}</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0 }}>
                {formatDate(rental.rental_date)} ~ {formatDate(rental.due_date)} 반납 예정
              </p>
              <p style={{ fontSize: '12px', color: '#3b82f6', margin: 0 }}>
                목적: {PURPOSE_LABELS[rental.purpose]}{rental.purpose_detail ? ` (${rental.purpose_detail})` : ''}
              </p>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {equipment.status === 'available' && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              backgroundColor: '#111827', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            대여 신청
          </button>
        )}

        {/* 대여 이력 */}
        {rentals.length > 0 && (
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px' }}>대여 이력</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rentals.map((r) => (
                <div key={r.id} style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#111827', fontWeight: '500', margin: '0 0 2px' }}>
                      {r.borrower_generation}기 {r.borrower_name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      {formatDate(r.rental_date)} · {PURPOSE_LABELS[r.purpose]}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '9999px',
                    backgroundColor: r.status === 'returned' ? '#f3f4f6' : '#eff6ff',
                    color: r.status === 'returned' ? '#9ca3af' : '#3b82f6',
                  }}>
                    {r.status === 'returned' ? '반납완료' : '대여중'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 대여 폼 바텀시트 */}
      {showForm && (
        <RentalForm
          equipment={equipment}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            showToast('대여 신청 완료!')
            fetchEquipment()
          }}
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#111827', color: '#fff', borderRadius: '9999px',
          padding: '10px 20px', fontSize: '13px', fontWeight: '500', zIndex: 100,
          whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
