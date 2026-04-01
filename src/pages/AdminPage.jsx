import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useRentalActions } from '../hooks/useRentalActions'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

// ────────────────────────────────────────────────────────────
// 탭 버튼
// ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'equipment', label: '장비 관리' },
  { key: 'calendar', label: '캘린더 편집' },
  { key: 'member', label: '회원 목록' },
]

// ────────────────────────────────────────────────────────────
// 장비 관리 탭
// ────────────────────────────────────────────────────────────
function EquipmentManager() {
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'camera', brand: '', lens_info: '', guide_text: '', image_url: '' })
  const [saving, setSaving] = useState(false)
  const [confirmReturnId, setConfirmReturnId] = useState(null)
  const { returnRental } = useRentalActions()

  const fetch = async () => {
    const { data } = await supabase
      .from('equipments')
      .select('*, current_rental:rentals!current_rental_id(rental_date, borrower_name, borrower_generation)')
      .order('category')
      .order('name')
    setEquipments(data || [])
    setLoading(false)
  }

  const getToday = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const getEffectiveStatus = (eq) => {
    if (eq.status !== 'rented') return eq.status
    if (eq.current_rental?.rental_date > getToday()) return 'available'
    return 'rented'
  }

  useEffect(() => { fetch() }, [])

  const handleStatusToggle = async (eq) => {
    const next = eq.status === 'maintenance' ? 'available' : 'maintenance'
    await supabase.from('equipments').update({ status: next }).eq('id', eq.id)
    fetch()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category) return
    setSaving(true)
    await supabase.from('equipments').insert([{ ...form }])
    setSaving(false)
    setShowAddForm(false)
    setForm({ name: '', category: 'camera', brand: '', lens_info: '', guide_text: '', image_url: '' })
    fetch()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제할까요?')) return
    await supabase.from('equipments').delete().eq('id', id)
    fetch()
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { name, brand, lens_info, guide_text, image_url } = form
    await supabase.from('equipments').update({ name, brand, lens_info, guide_text, image_url }).eq('id', editId)
    setSaving(false)
    setEditId(null)
    fetch()
  }

  const startEdit = (eq) => {
    setEditId(eq.id)
    setForm({ name: eq.name, category: eq.category, brand: eq.brand || '', lens_info: eq.lens_info || '', guide_text: eq.guide_text || '', image_url: eq.image_url || '' })
  }

  const handleReturn = async (eq) => {
    if (!eq.current_rental_id) return
    await returnRental(eq.current_rental_id)
    setConfirmReturnId(null)
    fetch()
  }

  const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
  const STATUS_LABEL = { available: '대여가능', rented: '대여중', maintenance: '수리중' }
  const STATUS_COLOR = { available: '#16a34a', rented: '#2563eb', maintenance: '#ca8a04' }

  if (loading) return <p style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>불러오는 중...</p>

  return (
    <div>
      {/* 장비 추가 버튼 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px dashed #d1d5db', backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          + 장비 추가
        </button>
      </div>

      {/* 추가 폼 */}
      {showAddForm && (
        <form onSubmit={handleAdd} style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={inputStyle}>
            <option value="camera">카메라</option>
            <option value="tripod">삼각대</option>
          </select>
          <input style={inputStyle} placeholder="장비명 *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input style={inputStyle} placeholder="브랜드" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
          <input style={inputStyle} placeholder="렌즈/스펙 정보" value={form.lens_info} onChange={(e) => setForm((p) => ({ ...p, lens_info: e.target.value }))} />
          <input style={inputStyle} placeholder="한줄 가이드" value={form.guide_text} onChange={(e) => setForm((p) => ({ ...p, guide_text: e.target.value }))} />
          <input style={inputStyle} placeholder="이미지 URL" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer' }}>취소</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{saving ? '저장 중...' : '추가'}</button>
          </div>
        </form>
      )}

      {/* 장비 목록 */}
      {equipments.map((eq) => (
        <div key={eq.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          {editId === eq.id ? (
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input style={inputStyle} placeholder="장비명" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <input style={inputStyle} placeholder="브랜드" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
              <input style={inputStyle} placeholder="렌즈/스펙" value={form.lens_info} onChange={(e) => setForm((p) => ({ ...p, lens_info: e.target.value }))} />
              <input style={inputStyle} placeholder="한줄 가이드" value={form.guide_text} onChange={(e) => setForm((p) => ({ ...p, guide_text: e.target.value }))} />
              <input style={inputStyle} placeholder="이미지 URL" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setEditId(null)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer' }}>취소</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{saving ? '저장 중...' : '저장'}</button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{eq.brand} · {eq.category === 'camera' ? '카메라' : '삼각대'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: '500', color: STATUS_COLOR[getEffectiveStatus(eq)] }}>
                    {getEffectiveStatus(eq) === 'rented' && eq.current_rental
                      ? `${eq.current_rental.borrower_generation}기 ${eq.current_rental.borrower_name} 대여중`
                      : STATUS_LABEL[getEffectiveStatus(eq)]}
                  </span>
                  {getEffectiveStatus(eq) === 'rented' && (
                    <button onClick={() => setConfirmReturnId(eq.id)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#ef4444' }}>반납</button>
                  )}
                  <button onClick={() => handleStatusToggle(eq)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#374151' }}>
                    {eq.status === 'maintenance' ? '복구' : '수리'}
                  </button>
                  <button onClick={() => startEdit(eq)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#374151' }}>정보수정</button>
                  <button onClick={() => handleDelete(eq.id)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#ef4444' }}>삭제</button>
                </div>
              </div>
              {confirmReturnId === eq.id && (
                <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>강제 반납 처리할까요?</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setConfirmReturnId(null)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                    <button onClick={() => handleReturn(eq)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>확인</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 회원 목록 탭
// ────────────────────────────────────────────────────────────
function MemberManager() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase
      .from('members')
      .select('id, name, generation, department, contact, student_id')
      .order('generation', { ascending: false })
      .order('name')
      .then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  const filtered = query.trim()
    ? members.filter((m) => m.name.includes(query) || String(m.generation).includes(query))
    : members

  if (loading) return <p style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>불러오는 중...</p>

  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <input
          type="text"
          placeholder="이름 또는 기수 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ padding: '8px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>총 {filtered.length}명</p>
      </div>
      {filtered.map((m) => (
        <div key={m.id} style={{ padding: '11px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: '0 0 2px' }}>{m.name}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{m.generation}기 · {m.department}</p>
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{m.contact}</p>
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 캘린더 편집 탭
// ────────────────────────────────────────────────────────────
function CalendarManager() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchRentals = async () => {
    setLoading(true)
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const { data } = await supabase
      .from('rentals')
      .select(`
        id,
        borrower_name,
        borrower_generation,
        borrower_contact,
        rental_date,
        due_date,
        status,
        camera_id,
        tripod_id,
        camera:equipments!camera_id(name),
        tripod:equipments!tripod_id(name)
      `)
      .lte('rental_date', to)
      .gte('due_date', from)
      .order('rental_date')

    setRentals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRentals()
  }, [year, month])

  const firstDay = new Date(year, month - 1, 1).getDay()
  const lastDate = new Date(year, month, 0).getDate()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) cells.push(d)

  const toDateStr = (d) => `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const getRentalsForDate = (dateStr) => rentals.filter((r) => r.rental_date === dateStr)

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12) }
    else setMonth((m) => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1) }
    else setMonth((m) => m + 1)
    setSelectedDate(null)
  }

  const handleDelete = async (rental) => {
    setDeleting(true)
    setDeleteError('')
    try {
      // 1) 장비의 current_rental_id를 먼저 해제 (FK 충돌 방지)
      if (rental.camera_id) {
        await supabase.from('equipments').update({ status: 'available', current_rental_id: null }).eq('id', rental.camera_id)
      }
      if (rental.tripod_id) {
        await supabase.from('equipments').update({ status: 'available', current_rental_id: null }).eq('id', rental.tripod_id)
      }

      // 2) 대여 건 삭제 (.select()로 실제 삭제 여부 확인)
      const { data, error } = await supabase.from('rentals').delete().eq('id', rental.id).select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('RLS 정책에 DELETE 권한이 없습니다. Supabase에서 rentals 테이블에 DELETE 정책을 추가해 주세요.')
      }

      setConfirmDeleteId(null)
      await fetchRentals()
    } catch (err) {
      setDeleteError(`삭제 실패: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  const selectedRentals = selectedDate ? getRentalsForDate(toDateStr(selectedDate)) : []

  const STATUS_LABEL = { rented: '대여중', returned: '반납완료' }
  const STATUS_COLOR = { rented: '#2563eb', returned: '#16a34a' }

  const touchStartX = useRef(null)
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? nextMonth() : prevMonth()
    touchStartX.current = null
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {deleteError && (
        <div style={{ margin: '12px 16px', padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>{deleteError}</p>
        </div>
      )}

      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#374151', display: 'flex', alignItems: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{year}년 {month}월</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#374151', display: 'flex', alignItems: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', marginBottom: '2px' }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '11px', fontWeight: '600',
            color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#9ca3af',
            padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      {loading ? (
        <p style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>불러오는 중...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', gap: '2px' }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />

            const dateStr = toDateStr(d)
            const dayRentals = getRentalsForDate(dateStr)
            const isToday = dateStr === todayStr
            const isSelected = selectedDate === d
            const dow = (firstDay + d - 1) % 7

            return (
              <div
                key={d}
                onClick={() => setSelectedDate(isSelected ? null : d)}
                style={{
                  minHeight: '48px', padding: '4px', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: isSelected ? '#fef3c7' : 'transparent',
                  border: isSelected ? '1.5px solid #fbbf24' : '1.5px solid transparent',
                  overflow: 'hidden', minWidth: 0,
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: isToday ? '700' : '400',
                  backgroundColor: isToday ? '#111827' : 'transparent',
                  color: isToday ? '#fff' : dow === 0 ? '#ef4444' : dow === 6 ? '#3b82f6' : '#374151',
                  marginBottom: '2px',
                }}>
                  {d}
                </div>
                {dayRentals.length > 0 && (
                  <div style={{
                    fontSize: '9px', backgroundColor: '#dbeafe', color: '#1d4ed8',
                    borderRadius: '3px', padding: '1px 3px', textAlign: 'center',
                  }}>
                    {dayRentals.length}건
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 선택한 날짜의 대여 목록 */}
      {selectedDate && (
        <div style={{ margin: '12px 12px 12px', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '11px 14px', backgroundColor: '#fffbeb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', margin: 0 }}>
              {month}월 {selectedDate}일 대여 목록
            </p>
            <p style={{ fontSize: '11px', color: '#b45309', margin: 0 }}>{selectedRentals.length}건</p>
          </div>

          {selectedRentals.length === 0 ? (
            <div style={{ padding: '20px 14px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              대여 내역이 없어요.
            </div>
          ) : (
            <div>
              {selectedRentals.map((r) => (
                <div key={r.id} style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>
                        {r.camera?.name || ''}{r.camera?.name && r.tripod?.name ? ' + ' : ''}{r.tripod?.name || ''}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px' }}>
                        {r.borrower_generation}기 {r.borrower_name}{r.borrower_contact ? ` · ${r.borrower_contact}` : ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                          {r.rental_date} ~ {r.due_date}
                        </p>
                        <span style={{ fontSize: '10px', fontWeight: '500', color: STATUS_COLOR[r.status] || '#6b7280', backgroundColor: r.status === 'rented' ? '#eff6ff' : '#f0fdf4', padding: '1px 6px', borderRadius: '4px' }}>
                          {STATUS_LABEL[r.status] || r.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmDeleteId(r.id)}
                      style={{
                        marginLeft: '10px', padding: '5px 10px', borderRadius: '6px',
                        border: '1px solid #fecaca', backgroundColor: '#fff',
                        color: '#ef4444', fontSize: '11px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {/* 삭제 확인 */}
                  {confirmDeleteId === r.id && (
                    <div style={{
                      marginTop: '10px', padding: '10px 12px', backgroundColor: '#fef2f2',
                      borderRadius: '8px', border: '1px solid #fecaca',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                    }}>
                      <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>
                        이 대여 건을 삭제할까요?{r.status === 'rented' ? ' (장비가 대여가능으로 변경됩니다)' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer' }}
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          disabled={deleting}
                          style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          {deleting ? '삭제 중...' : '확인'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 메인 AdminPage
// ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('equipment')
  const navigate = useNavigate()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Admin page</p>
        <button onClick={() => navigate('/')} style={{ fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>나가기</button>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1, padding: '11px 0', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              background: 'none', border: 'none',
              color: activeTab === key ? '#111827' : '#9ca3af',
              borderBottom: `2px solid ${activeTab === key ? '#111827' : 'transparent'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {activeTab === 'equipment' && <EquipmentManager />}
      {activeTab === 'member' && <MemberManager />}
      {activeTab === 'calendar' && <CalendarManager />}
    </div>
  )
}
