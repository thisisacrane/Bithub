import { useState, useEffect, useRef } from 'react'
import { useMembers } from '../../hooks/useMembers'

export default function MemberSearch({ onSelect, onManual }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const { results, search } = useMembers()
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (query.trim().length === 0) {
      setShowDropdown(false)
      return
    }
    timerRef.current = setTimeout(() => {
      search(query)
      setShowDropdown(true)
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const handleSelect = (member) => {
    setShowDropdown(false)
    setQuery(member.name)
    onSelect(member)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="이름 입력 (자동완성)"
        style={{
          width: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelect(m)}
              style={{
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#111827',
              }}
            >
              {m.name}
              <span style={{ color: '#9ca3af', marginLeft: '6px' }}>
                {m.generation}기 · {m.department}
              </span>
            </button>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && query.trim().length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          padding: '10px 14px',
        }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>검색 결과 없음</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => { setShowDropdown(false); onManual() }}
        style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        직접 입력하기 →
      </button>
    </div>
  )
}
