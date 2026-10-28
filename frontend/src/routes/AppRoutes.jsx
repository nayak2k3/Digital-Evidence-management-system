import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==========================================
// PAGES
// ==========================================

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

import Dashboard from "../pages/Dashboard";
import Cases from "../pages/Cases";
import Evidence from "../pages/Evidence";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import AuditLogs from "../pages/AuditLogs";
import Notifications from "../pages/Notifications";

// ==========================================
// LAYOUT
// ==========================================

import DashboardLayout from "../layouts/DashboardLayout";

// ==========================================
// AUTH
// ==========================================

import { useAuth } from "../context/AuthContext";


// ==========================================
// PROTECTED ROUTE
// ==========================================

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait while checking authentication
  if (loading) {
    return <p>Loading...</p>;
  }

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User is logged in
  return children;
};


// ==========================================
// APP ROUTES
// ==========================================

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================
            LOGIN
        ================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==================================
            REGISTER
        ================================== */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================
            FORGOT PASSWORD
        ================================== */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ==================================
            DASHBOARD
        ================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <Dashboard />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            CASES
        ================================== */}

        <Route
          path="/cases"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <Cases />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            EVIDENCE
        ================================== */}

        <Route
          path="/evidence"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <Evidence />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            REPORTS
        ================================== */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <Reports />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            USERS
        ================================== */}

        <Route
          path="/users"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <Users />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            AUDIT LOGS
        ================================== */}

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <AuditLogs />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            NOTIFICATIONS
        ================================== */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>

              <DashboardLayout>

                <Notifications />

              </DashboardLayout>

            </ProtectedRoute>
          }
        />


        {/* ==================================
            DEFAULT ROUTE
        ================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* ==================================
            UNKNOWN URL
        ================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;