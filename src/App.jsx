import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import CalendarPage from './pages/CalendarPage'
import AdminPage from './pages/AdminPage'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

function DesktopSidebar() {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('adminUnlocked') === 'true')
  const [showPin, setShowPin] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  const handleAdminClick = () => {
    if (unlocked) { navigate('/admin'); return }
    setPin(''); setPinError(''); setShowPin(true)
  }

  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('adminUnlocked', 'true')
      setUnlocked(true); setShowPin(false); navigate('/admin')
    } else {
      setPinError('PIN이 올바르지 않습니다'); setPin('')
    }
  }

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: isActive ? '#111827' : 'transparent',
    color: isActive ? '#ffffff' : '#6b7280',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.15s',
  })

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid #f0ece5',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        backgroundColor: '#faf8f5',
        alignSelf: 'flex-start',
      }}
    >
      {/* 브랜드 */}
      <div
        onClick={() => {
          const d = new Date()
          const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          sessionStorage.setItem('selectedDate', today)
          navigate('/', { state: { resetToToday: true } })
        }}
        style={{ padding: '32px 24px 24px', borderBottom: '1px solid #f0ece5', cursor: 'pointer' }}
      >
        <p style={{ fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>Bithub</p>
        <p style={{ fontSize: '11px', color: '#b8b0a6', marginTop: '6px', letterSpacing: '0.03em' }}>빛담 장비 대여 시스템</p>
      </div>

      {/* 내비게이션 */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <NavLink to="/" end style={({ isActive }) => navItemStyle(isActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          장비
        </NavLink>
        <NavLink to="/calendar" style={({ isActive }) => navItemStyle(isActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          캘린더
        </NavLink>
      </nav>

      {/* Admin 링크 */}
      <div style={{ padding: '0 12px 12px' }}>
        <button
          onClick={handleAdminClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0ece5'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Admin page
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {showPin && (
          <form onSubmit={handlePinSubmit} style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError('') }}
              placeholder="PIN 입력"
              autoFocus
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', textAlign: 'center', letterSpacing: '0.2em', outline: 'none', boxSizing: 'border-box' }}
            />
            {pinError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px', textAlign: 'center' }}>{pinError}</p>}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowPin(false)} style={{ flex: 1, padding: '7px', borderRadius: '7px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '12px', cursor: 'pointer', color: '#6b7280' }}>취소</button>
              <button type="submit" style={{ flex: 1, padding: '7px', borderRadius: '7px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>확인</button>
            </div>
          </form>
        )}
      </div>

      {/* 푸터 */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ece5' }}>
        <p style={{ fontSize: '10px', color: '#c8c0b6', lineHeight: '1.8', letterSpacing: '0.02em' }}>
          빛을 담다.<br />공과대학 사진동아리 · 빛담
        </p>
        <p style={{ fontSize: '10px', color: '#d0c8be', marginTop: '6px', letterSpacing: '0.02em' }}>
          © {new Date().getFullYear()} 빛담. All rights reserved.
        </p>
      </div>
    </aside>
  )
}

function Layout({ children, showNav = true }) {
  return (
    <>
      <DesktopSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/camera/:id" element={<Layout><CameraPage /></Layout>} />
        <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
        <Route path="/admin" element={<Layout showNav={false}><AdminPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
