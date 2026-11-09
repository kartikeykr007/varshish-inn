import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import MyComplaints from './pages/MyComplaints'
import ComplaintDetail from './pages/ComplaintDetail'
import AdminDashboard from './pages/AdminDashboard'
import AdminComplaints from './pages/AdminComplaints'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/submit" element={<ProtectedRoute role="student"><SubmitComplaint /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute role="student"><MyComplaints /></ProtectedRoute>} />
        <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
