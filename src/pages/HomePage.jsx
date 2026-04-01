import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useEquipments } from '../hooks/useEquipments'
import { useAllRentals } from '../hooks/useRentals'
import EquipmentCard from '../components/equipment/EquipmentCard'

function getToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'camera', label: '카메라' },
  { key: 'tripod', label: '삼각대' },
]

function LensTipCard() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      margin: '12px 12px 0',
      borderRadius: '14px',
      border: '1px solid #e0e7ff',
      backgroundColor: '#eef2ff',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#3730a3' }}>
          📸 렌즈 스펙, 스마트폰 카메라와 비교해 보기!
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15" height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 기본 공식 */}
          <p style={{ fontSize: '12px', color: '#3730a3', lineHeight: '1.7', margin: 0 }}>
            어렵게 생각하지 마세요! 스마트폰 기본 카메라(1배줌)는 약 <strong>24mm</strong>입니다.
            렌즈 숫자를 24로 나누면 스마트폰 몇 배줌인지 바로 알 수 있어요!
            <br />
            <span style={{ color: '#4f46e5' }}>예: 50mm 렌즈 👉 50 ÷ 24 = 스마트폰 약 2배줌</span>
          </p>

          {/* 크롭바디 주의 */}
          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '10px 12px', border: '1px solid #c7d2fe' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', margin: '0 0 6px' }}>🚨 크롭바디의 함정!</p>
            <p style={{ fontSize: '12px', color: '#3730a3', lineHeight: '1.7', margin: '0 0 6px' }}>
              카메라 센서 크기에 따라 계산법이 달라집니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                <strong>풀프레임</strong> (5D Mark II, D610) → 렌즈 숫자 ÷ 24 그대로
              </p>
              <p style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                <strong>크롭바디</strong> (450D, m100, a6000) → 렌즈 숫자 ÷ 16
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#4f46e5', lineHeight: '1.6', margin: '6px 0 0' }}>
              예: a6000의 16mm → 16 ÷ 16 = 1 → 실제로는 스마트폰 1배줌과 동일!
            </p>
          </div>

          {/* 조리개 */}
          <p style={{ fontSize: '12px', color: '#3730a3', lineHeight: '1.7', margin: 0 }}>
            💡 <strong>조리개(1:x.x)</strong>는 뒤 숫자가 작을수록 빛을 많이 받아 어두운 곳에서도 잘 찍히고,
            스마트폰 인물사진 모드보다 훨씬 자연스럽게 배경이 흐려져요!
          </p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const { equipments, loading, error } = useEquipments()
  const { rentals: allRentals } = useAllRentals()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedDate, setSelectedDate] = useState(
    () => sessionStorage.getItem('selectedDate') || getToday()
  )
  const location = useLocation()

  useEffect(() => {
    if (location.state?.resetToToday) {
      const today = getToday()
      setSelectedDate(today)
    }
  }, [location.state])

  const handleDateChange = (date) => {
    sessionStorage.setItem('selectedDate', date)
    setSelectedDate(date)
  }

  const filtered = activeTab === 'all'
    ? equipments
    : equipments.filter((e) => e.category === activeTab)

  return (
    <div className="flex-1 flex flex-col">
      {/* 카테고리 탭 */}
      <div
        className="flex gap-2"
        style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '6px',
              paddingBottom: '6px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === key ? '#111827' : '#f3f4f6',
              color: activeTab === key ? '#ffffff' : '#6b7280',
              transition: 'background-color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 렌즈 팁 카드 */}
      <LensTipCard />

      {/* 날짜 선택 */}
      <div
        style={{
          margin: '12px 12px 0',
          padding: '14px 16px',
          borderRadius: '14px',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          cursor: 'pointer',
        }}

      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', margin: '0 0 2px' }}>대여 희망일</p>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {(() => {
                const days = ['일', '월', '화', '수', '목', '금', '토']
                const d = new Date(selectedDate + 'T00:00:00')
                if (isNaN(d.getTime())) return selectedDate
                return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
              })()}
            </p>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <input
          id="home-date-input"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* 장비 그리드 */}
      <div className="flex-1" style={{ padding: '12px 12px 16px' }}>
        {loading && (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            불러오는 중...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-48 text-red-400 text-sm">
            오류가 발생했어요. 다시 시도해주세요.
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            장비가 없어요.
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: '12px', paddingTop: '4px' }}>
            {filtered.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} selectedDate={selectedDate} allRentals={allRentals} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
