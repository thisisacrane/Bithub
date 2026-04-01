import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

export default function Header() {
  const navigate = useNavigate()
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('adminUnlocked') === 'true')

  const handleLockClick = () => {
    if (unlocked) {
      navigate('/admin')
      return
    }
    setPin('')
    setError('')
    setShowPinModal(true)
  }

  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('adminUnlocked', 'true')
      setUnlocked(true)
      setShowPinModal(false)
      navigate('/admin')
    } else {
      setError('PIN이 올바르지 않습니다')
      setPin('')
    }
  }

  return (
    <>
      <header className="app-header sticky top-0 z-40 bg-white border-b border-gray-100 h-14 flex items-center justify-between" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
        <span
          className="header-brand-text text-lg font-bold text-gray-900 cursor-pointer"
          onClick={() => {
            const d = new Date()
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            sessionStorage.setItem('selectedDate', today)
            navigate('/', { state: { resetToToday: true } })
          }}
        >
          Bithub
        </span>
        <button
          onClick={handleLockClick}
          className="header-lock-btn text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          style={{ cursor: 'pointer' }}
          aria-label="관리자"
        >
          {unlocked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1.51" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </button>
      </header>

      {showPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowPinModal(false)}
        >
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            padding: '24px 24px 20px',
            width: '260px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>관리자 PIN 입력</h2>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError('') }}
                placeholder="PIN 입력"
                autoFocus
                style={{
                  width: '100%',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  textAlign: 'center',
                  fontSize: '16px',
                  letterSpacing: '0.2em',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    color: '#6b7280',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#111827',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
