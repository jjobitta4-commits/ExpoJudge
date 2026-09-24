import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { EventProvider } from './context/EventContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Navbar from './components/common/Navbar.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EventSetupPage from './pages/EventSetupPage.jsx';
import JudgeDashboardPage from './pages/judge/JudgeDashboardPage.jsx';
import ScoringPage from './pages/judge/ScoringPage.jsx';
import AddTeamPage from './pages/judge/AddTeamPage.jsx';
import JudgingSheetsPage from './pages/judge/JudgingSheetsPage.jsx';
import { Loader2 } from 'lucide-react';

// Performance: Lazy-load admin and grid routes per section 10
const GridViewPage = lazy(() => import('./pages/judge/GridViewPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminJudgesPage = lazy(() => import('./pages/admin/AdminJudgesPage.jsx'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
      <p className="text-xs font-semibold animate-pulse">Loading view...</p>
    </div>
  );
}

function MainLayout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar />
      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Forced Event Setup for Authenticated Users without Active Event */}
            <Route
              path="/event-setup"
              element={
                <ProtectedRoute requireEvent={false}>
                  <EventSetupPage />
                </ProtectedRoute>
              }
            />

            {/* Authenticated Judge Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute requireEvent={true}>
                  <MainLayout>
                    <JudgeDashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/scoring/:teamId"
              element={
                <ProtectedRoute requireEvent={true}>
                  <MainLayout>
                    <ScoringPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-team"
              element={
                <ProtectedRoute requireEvent={true}>
                  <MainLayout>
                    <AddTeamPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/grid"
              element={
                <ProtectedRoute requireEvent={true}>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <GridViewPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sheets"
              element={
                <ProtectedRoute requireEvent={true}>
                  <JudgingSheetsPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer & Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireEvent={true} requireOrganizer={true}>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <AdminDashboardPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/judges"
              element={
                <ProtectedRoute requireEvent={true} requireOrganizer={true}>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <AdminJudgesPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
