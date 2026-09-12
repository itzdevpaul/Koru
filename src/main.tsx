import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Profile from './pages/Profile'
import Upgrade from './pages/Upgrade'
import PaymentReturn from './pages/PaymentReturn'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AdminRoute from './components/AdminRoute'
import ClarityCard from './pages/ClarityCard'
import Journal from './pages/Journal'
import Assistant from './pages/Assistant'
import Roadmap from './pages/Roadmap'
import MoodInsights from './pages/MoodInsights'
import IdleTimer from './components/IdleTimer'
import WhatsAppPrompt from './components/WhatsAppPrompt'
import OfflineStatus from './components/OfflineStatus'
import AccessibilityTools from './components/AccessibilityTools'
import MobileNavigation from './components/MobileNavigation'
import './index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('[Koru] PWA service worker registration failed:', error)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SubscriptionProvider>
          <IdleTimer />
          <WhatsAppPrompt />
          <OfflineStatus />
          <AccessibilityTools />
          <MobileNavigation />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* Protected routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            <Route path="/payment/return" element={<ProtectedRoute><PaymentReturn /></ProtectedRoute>} />
            <Route path="/clarity-card" element={<ProtectedRoute><ClarityCard /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/mood-insights" element={<ProtectedRoute><MoodInsights /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </SubscriptionProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
