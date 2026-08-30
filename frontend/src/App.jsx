import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Shell from './layout/Shell'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Gallery from './pages/Gallery'
import DesignStudio from './pages/DesignStudio'
import Projector from './pages/Projector'
import Calculator from './pages/Calculator'
import Materials from './pages/Materials'
import Settings from './pages/Settings'
import WorkHours from './pages/WorkHours'

function Guard({children}) {
  const isLoggedIn = localStorage.getItem('tufting_auth') === '1'
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Shell /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="design" element={<DesignStudio />} />
        <Route path="projector" element={<Projector />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="materials" element={<Materials />} />
        <Route path="work-hours" element={<WorkHours />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
