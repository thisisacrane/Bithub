import React from 'react'
import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    state: { resetToToday: true },
    label: '장비',
    icon: (active) => (
      <div className="w-6 h-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
    ),
  },
  {
    to: '/calendar',
    label: '캘린더',
    icon: (active) => (
      <div className="w-6 h-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="mobile-bottom-nav sticky bottom-0 z-40 bg-white border-t border-gray-100" style={{ alignItems: 'stretch' }}>
      {tabs.map(({ to, state, label, icon }, idx) => (
        <React.Fragment key={to}>
          {idx > 0 && (
            <div style={{ width: '1px', backgroundColor: '#f3f4f6', margin: '8px 0' }} />
          )}
          <NavLink
            to={to}
            state={state}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {icon(isActive)}
                <span style={{ fontSize: '10px' }}>{label}</span>
              </>
            )}
          </NavLink>
        </React.Fragment>
      ))}
    </nav>
  )
}
