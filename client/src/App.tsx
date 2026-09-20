import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ExplorePage from './pages/public/ExplorePage';
import ProjectPage from './pages/public/ProjectPage';
import AboutPage from './pages/public/AboutPage';
import PricingPage from './pages/public/PricingPage';
import OwnerPortalPage from './pages/public/OwnerPortalPage';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MyProjects from './pages/dashboard/MyProjects';
import SubmitProject from './pages/dashboard/SubmitProject';
import BidHistory from './pages/dashboard/BidHistory';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBids from './pages/admin/AdminBids';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';

import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/owner" state={{ from: location }} replace />;
  return <>{children}</>;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/owner" state={{ from: location }} replace />;
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Public Layout Wrapper
const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

import { authService } from './services/auth.service';

function App() {
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    const validateSession = async () => {
      if (!token) return;
      try {
        const res = await authService.getMe();
        if (isMounted && res.success && res.data) {
          setAuth(res.data, token);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Session revalidation failed, logging out:', err.message);
          logout();
        }
      }
    };

    validateSession();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/leaderboard" replace />} />
          <Route path="/leaderboard" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/explore" element={<PublicLayout><ExplorePage /></PublicLayout>} />
          <Route path="/project/:slug" element={<PublicLayout><ProjectPage /></PublicLayout>} />
          <Route path="/categories" element={<Navigate to="/explore" replace />} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
          <Route path="/login" element={<Navigate to="/owner" replace />} />
          <Route path="/register" element={<Navigate to="/owner" replace />} />

          {/* Navigation Aliases */}
          <Route path="/transparency" element={<Navigate to="/about#transparency" replace />} />
          <Route path="/rules" element={<Navigate to="/about#rules" replace />} />
          <Route path="/faq" element={<Navigate to="/about#faq" replace />} />

          {/* Owner Portal */}
          <Route path="/owner" element={<PublicLayout><OwnerPortalPage /></PublicLayout>} />
          <Route path="/owner/*" element={<PublicLayout><OwnerPortalPage /></PublicLayout>} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="projects" element={<MyProjects />} />
            <Route path="projects/submit" element={<SubmitProject />} />
            <Route path="bids" element={<BidHistory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bids" element={<AdminBids />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Catch-all redirect to public leaderboard */}
          <Route path="*" element={<Navigate to="/leaderboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
