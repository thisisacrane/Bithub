import { useState, useRef } from 'react'
import { useAllRentals } from '../hooks/useAllRentals'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function getRentalsForDate(rentals, dateStr) {
  return rentals.filter((r) => r.rental_date === dateStr)
}


export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(today.getDate())

  const { rentals } = useAllRentals(year, month)

  const firstDay = new Date(year, month - 1, 1).getDay()
  const lastDate = new Date(year, month, 0).getDate()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) cells.push(d)

  const slideDir = useRef('left')

  const prevMonth = () => {
    slideDir.current = 'right'
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    slideDir.current = 'left'
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }
  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
    setSelectedDate(null)
  }

  const toDateStr = (d) => `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const selectedRentals = selectedDate ? getRentalsForDate(rentals, toDateStr(selectedDate)) : []

  const touchStartX = useRef(null)
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? nextMonth() : prevMonth()
    touchStartX.current = null
  }

  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#374151' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#111827' }}>{year}년 {month}월</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#374151' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToday}
          style={{ fontSize: '12px', fontWeight: '500', padding: '5px 12px', borderRadius: '9999px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', cursor: 'pointer' }}
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 + 날짜 그리드 (슬라이드 애니메이션) */}
      <div key={`${year}-${month}`} className={slideDir.current === 'left' ? 'cal-slide-left' : 'cal-slide-right'} style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', marginBottom: '4px' }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#9ca3af',
            padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', gap: '2px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />

          const dateStr = toDateStr(d)
          const dayRentals = getRentalsForDate(rentals, dateStr)
          const isToday = dateStr === todayStr
          const isSelected = selectedDate === d
          const dow = (firstDay + d - 1) % 7

          return (
            <div
              key={d}
              onClick={() => setSelectedDate(isSelected ? null : d)}
              style={{
                minHeight: '54px',
                padding: '4px',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                border: isSelected ? '1.5px solid #bae6fd' : '1.5px solid transparent',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {/* 날짜 숫자 */}
              <div style={{
                width: '24px', height: '24px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: isToday ? '700' : '400',
                backgroundColor: isToday ? '#111827' : 'transparent',
                color: isToday ? '#fff' : dow === 0 ? '#ef4444' : dow === 6 ? '#3b82f6' : '#374151',
                marginBottom: '3px',
              }}>
                {d}
              </div>

              {/* 대여 도트 (최대 2개 + 더보기) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dayRentals.slice(0, 2).map((r) => (
                  <div key={r.id} style={{
                    fontSize: '9px',
                    lineHeight: '1.3',
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    borderRadius: '3px',
                    padding: '1px 3px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>
                    {[r.camera?.name, r.tripod?.name].filter(Boolean).join(' + ')}
                  </div>
                ))}
                {dayRentals.length > 2 && (
                  <div style={{ fontSize: '9px', color: '#9ca3af', paddingLeft: '3px' }}>
                    +{dayRentals.length - 2}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>{/* /슬라이드 래퍼 */}

      {/* 선택한 날짜 상세 */}
      {selectedDate && (
        <div style={{ margin: '12px 12px 0', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {month}월 {selectedDate}일 대여 현황
            </p>
          </div>
          {selectedRentals.length === 0 ? (
            <div style={{ padding: '16px 14px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              대여 내역이 없어요.
            </div>
          ) : (
            <div>
              {selectedRentals.map((r) => (
                <div key={r.id} style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: '0 0 2px' }}>
                      {[r.camera?.name, r.tripod?.name].filter(Boolean).join(' + ')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {r.borrower_generation}기 {r.borrower_name} · {r.borrower_department}
                    </p>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, textAlign: 'right' }}>
                    ~{r.due_date.slice(5).replace('-', '/')} 반납
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ height: '16px' }} />
    </div>
  )
}
