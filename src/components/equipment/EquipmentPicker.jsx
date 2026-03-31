import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function EquipmentOption({ item, selected, onSelect, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(selected ? null : item.id)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '10px',
        border: `1.5px solid ${selected ? '#111827' : '#e5e7eb'}`,
        backgroundColor: selected ? '#f9fafb' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        marginBottom: '6px',
      }}
    >
      <span style={{ fontSize: '13px', color: '#111827', textAlign: 'left' }}>
        {item.name}
        {item.lens_info && (
          <span style={{ color: '#9ca3af', marginLeft: '4px', fontSize: '11px' }}>{item.lens_info}</span>
        )}
      </span>
      <span style={{
        fontSize: '11px',
        fontWeight: '500',
        padding: '2px 8px',
        borderRadius: '9999px',
        backgroundColor: disabled ? '#eff6ff' : (selected ? '#111827' : '#f3f4f6'),
        color: disabled ? '#3b82f6' : (selected ? '#fff' : '#6b7280'),
        flexShrink: 0,
        marginLeft: '8px',
      }}>
        {disabled ? '대여중' : selected ? '선택됨' : '선택'}
      </span>
    </button>
  )
}

export default function EquipmentPicker({ preselectedId, onCameraChange, onTripodChange }) {
  const [cameras, setCameras] = useState([])
  const [tripods, setTripods] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [selectedTripod, setSelectedTripod] = useState(null)

  useEffect(() => {
    const fetchEquipments = async () => {
      const { data } = await supabase
        .from('equipments')
        .select(`
          *,
          current_rental:rentals!current_rental_id (
            borrower_name,
            borrower_generation
          )
        `)
        .order('name')

      if (!data) return
      const cams = data.filter((e) => e.category === 'camera')
      const trips = data.filter((e) => e.category === 'tripod')
      setCameras(cams)
      setTripods(trips)

      // 현재 페이지 장비 자동 선택
      if (preselectedId) {
        const pre = data.find((e) => e.id === preselectedId)
        if (pre?.category === 'camera') setSelectedCamera(preselectedId)
        if (pre?.category === 'tripod') setSelectedTripod(preselectedId)
      }
    }
    fetchEquipments()
  }, [preselectedId])

  const handleCameraSelect = (id) => {
    setSelectedCamera(id)
    onCameraChange(id)
  }

  const handleTripodSelect = (id) => {
    setSelectedTripod(id)
    onTripodChange(id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 카메라 */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>카메라 선택</p>
        {cameras.map((cam) => (
          <EquipmentOption
            key={cam.id}
            item={cam}
            selected={selectedCamera === cam.id}
            disabled={cam.status === 'rented' && cam.id !== preselectedId}
            onSelect={handleCameraSelect}
          />
        ))}
      </div>

      {/* 삼각대 */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>삼각대 선택 <span style={{ fontWeight: '400', color: '#9ca3af' }}>(선택사항)</span></p>
        {tripods.map((tri) => (
          <EquipmentOption
            key={tri.id}
            item={tri}
            selected={selectedTripod === tri.id}
            disabled={tri.status === 'rented' && tri.id !== preselectedId}
            onSelect={handleTripodSelect}
          />
        ))}
      </div>
    </div>
  )
}
