import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import CalendarPage from './pages/CalendarPage'
import AdminPage from './pages/AdminPage'

function Layout({ children, showNav = true }) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {showNav && <BottomNav />}
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
