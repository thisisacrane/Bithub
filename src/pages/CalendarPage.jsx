import { useState, useRef } from 'react'
import { useAllRentals } from '../hooks/useAllRentals'
import { useRentalActions } from '../hooks/useRentalActions'

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
  const { deleteRental } = useRentalActions()

  const [deletingRental, setDeletingRental] = useState(null)
  const [deletePin, setDeletePin] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDeleteSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(deletePin)) { setDeleteError('숫자 4자리를 입력해주세요.'); return }
    setDeleting(true)
    const { error } = await deleteRental(deletingRental.id, deletePin)
    setDeleting(false)
    if (error) {
      setDeleteError(typeof error === 'string' ? error : '비밀번호가 올바르지 않습니다.')
      setDeletePin('')
    } else {
      setDeletingRental(null)
      setDeletePin('')
      setDeleteError('')
    }
  }

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
                <div key={r.id} style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: '0 0 2px' }}>
                      {[r.camera?.name, r.tripod?.name].filter(Boolean).join(' + ')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px' }}>
                      {r.borrower_generation}기 {r.borrower_name} · {r.borrower_department}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                      {r.rental_date} 14:00 ~ {r.due_date} 13:00
                    </p>
                  </div>
                  {(r.status === 'scheduled' || r.status === 'rented') && (
                    <button
                      onClick={() => { setDeletingRental(r); setDeletePin(''); setDeleteError('') }}
                      style={{ flexShrink: 0, background: 'none', border: '1px solid #fca5a5', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '11px', fontWeight: '500' }}
                    >
                      취소
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ height: '16px' }} />

      {/* PIN 확인 모달 */}
      {deletingRental && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => e.target === e.currentTarget && setDeletingRental(null)}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px 24px 24px', width: '300px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '4px' }}>대여 신청 취소</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginBottom: '4px' }}>
              {[deletingRental.camera?.name, deletingRental.tripod?.name].filter(Boolean).join(' + ')}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginBottom: '20px' }}>
              신청 시 설정한 비밀번호 4자리를 입력해주세요
            </p>
            <form onSubmit={handleDeleteSubmit}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={deletePin}
                onChange={(e) => { setDeletePin(e.target.value.replace(/\D/g, '').slice(0, 4)); setDeleteError('') }}
                placeholder="• • • •"
                autoFocus
                style={{
                  width: '100%', border: deleteError ? '1.5px solid #f87171' : '1.5px solid #e5e7eb',
                  borderRadius: '10px', padding: '11px 14px', fontSize: '20px', textAlign: 'center',
                  letterSpacing: '0.3em', outline: 'none', boxSizing: 'border-box', color: '#111827',
                }}
              />
              {deleteError && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px', textAlign: 'center' }}>{deleteError}</p>}
              <button
                type="submit"
                disabled={deleting}
                style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? '처리 중...' : '신청 취소'}
              </button>
              <button
                type="button"
                onClick={() => setDeletingRental(null)}
                style={{ width: '100%', marginTop: '8px', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}
              >
                돌아가기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
