import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useRentalActions } from '../hooks/useRentalActions'


// ────────────────────────────────────────────────────────────
// 탭 버튼
// ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'rental', label: '대여 현황' },
  { key: 'equipment', label: '장비 관리' },
  { key: 'member', label: '회원 목록' },
]

// ────────────────────────────────────────────────────────────
// 대여 현황 탭
// ────────────────────────────────────────────────────────────
function RentalManager() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const { returnRental } = useRentalActions()
  const [confirmId, setConfirmId] = useState(null)

  const fetch = async () => {
    const { data } = await supabase
      .from('rentals')
      .select(`
        id, borrower_name, borrower_generation, borrower_contact,
        rental_date, due_date, status, returned_at,
        camera:equipments!camera_id(name),
        tripod:equipments!tripod_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
    setRentals(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleReturn = async (id) => {
    await returnRental(id)
    setConfirmId(null)
    fetch()
  }

  const active = rentals.filter((r) => r.status === 'rented')
  const returned = rentals.filter((r) => r.status === 'returned')

  const RentalRow = ({ r }) => (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>
            {r.camera?.name || ''}{r.camera?.name && r.tripod?.name ? ' + ' : ''}{r.tripod?.name || ''}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px' }}>
            {r.borrower_generation}기 {r.borrower_name} · {r.borrower_contact}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
            {r.rental_date} ~ {r.due_date}
          </p>
        </div>
        {r.status === 'rented' && (
          <button
            onClick={() => setConfirmId(r.id)}
            style={{ marginLeft: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            반납
          </button>
        )}
        {r.status === 'returned' && (
          <span style={{ marginLeft: '12px', fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>반납완료</span>
        )}
      </div>

      {/* 반납 확인 인라인 */}
      {confirmId === r.id && (
        <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>반납 처리할까요?</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setConfirmId(null)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer' }}>취소</button>
            <button onClick={() => handleReturn(r.id)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>확인</button>
          </div>
        </div>
      )}
    </div>
  )

  if (loading) return <p style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>불러오는 중...</p>

  return (
    <div>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>대여 중 ({active.length}건)</p>
      </div>
      {active.length === 0 && <p style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>현재 대여 중인 장비가 없어요.</p>}
      {active.map((r) => <RentalRow key={r.id} r={r} />)}

      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', marginTop: '8px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>반납 완료 ({returned.length}건)</p>
      </div>
      {returned.length === 0 && <p style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>반납 완료 내역이 없어요.</p>}
      {returned.map((r) => <RentalRow key={r.id} r={r} />)}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 장비 관리 탭
// ────────────────────────────────────────────────────────────
function EquipmentManager() {
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { returnRental } = useRentalActions()
  const [form, setForm] = useState({ name: '', category: 'camera', brand: '', lens_info: '', guide_text: '', image_url: '' })
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('equipments').select('*').order('category').order('name')
    setEquipments(data || [])
    setLoading(false)
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.name}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{eq.brand} · {eq.category === 'camera' ? '카메라' : '삼각대'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '500', color: STATUS_COLOR[eq.status] }}>{STATUS_LABEL[eq.status]}</span>
                {eq.status === 'rented' && eq.current_rental_id && (
                  <button onClick={() => returnRental(eq.current_rental_id).then(fetch)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', fontSize: '11px', cursor: 'pointer', color: '#2563eb', fontWeight: '600' }}>반납</button>
                )}
                {eq.status !== 'rented' && (
                  <button onClick={() => handleStatusToggle(eq)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#374151' }}>
                    {eq.status === 'maintenance' ? '복구' : '수리'}
                  </button>
                )}
                <button onClick={() => startEdit(eq)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#374151' }}>정보수정</button>
                {eq.status !== 'rented' && (
                  <button onClick={() => handleDelete(eq.id)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fff', fontSize: '11px', cursor: 'pointer', color: '#ef4444' }}>삭제</button>
                )}
              </div>
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
// 메인 AdminPage
// ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('rental')
  const navigate = useNavigate()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>관리자</p>
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
      {activeTab === 'rental' && <RentalManager />}
      {activeTab === 'equipment' && <EquipmentManager />}
      {activeTab === 'member' && <MemberManager />}
    </div>
  )
}
