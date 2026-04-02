import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function EquipmentCard({ equipment, selectedDate, allRentals = [] }) {
  const navigate = useNavigate()

  // 이 장비에 대해 선택한 날짜에 해당하는 대여 찾기
  // rented가 scheduled보다 우선 (같은 날 두 건이 겹칠 때 현재 대여중인 쪽을 표시)
  const rentalsOnDate = allRentals.filter((r) => {
    if (r.status !== 'rented' && r.status !== 'scheduled' && r.status !== 'returned') return false
    const isThisEquipment = r.camera_id === equipment.id || r.tripod_id === equipment.id
    const isOnDate = selectedDate >= r.rental_date && selectedDate < r.due_date
    return isThisEquipment && isOnDate
  })
  // 우선순위: 대여중 > 대여 예정 > 반납완료
  const matchedRental =
    rentalsOnDate.find(r => r.status === 'rented') ||
    rentalsOnDate.find(r => r.status === 'scheduled') ||
    rentalsOnDate[0]

  const isUnavailable = !!matchedRental || equipment.status === 'maintenance'

  return (
    <div
      onClick={() => navigate(`/camera/${equipment.id}`, { state: { selectedDate } })}
      className="active:scale-95 transition-transform"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 장비 이미지 */}
      <div
        style={{
          aspectRatio: '1 / 1',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {equipment.image_url ? (
          <img
            src={equipment.image_url}
            alt={equipment.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isUnavailable ? 0.4 : 1,
            }}
          />
        ) : (
          <div style={{ opacity: isUnavailable ? 0.3 : 0.2 }}>
            {equipment.category === 'camera' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="12" y1="2" x2="12" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            )}
          </div>
        )}
      </div>

      {/* 장비 정보 */}
      <div
        style={{
          padding: '12px 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: 1,
        }}
      >
        <div>
          <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', margin: 0 }}>{equipment.brand}</p>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: '1.3', margin: 0 }}>{equipment.name}</p>
          {equipment.lens_info && (
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', marginBottom: 0 }}>{equipment.lens_info}</p>
          )}
        </div>

        {equipment.guide_text && (
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            lineHeight: '1.6',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {equipment.guide_text}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <StatusBadge
            status={equipment.status}
            rental={matchedRental}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  )
}
