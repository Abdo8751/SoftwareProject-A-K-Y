import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/shared/Navbar';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import UserProfile from './components/user/UserProfile';
import EventList from './components/Events/EventList';
import EventForm from './components/Events/EventForm';
import EventAnalytics from './components/Events/EventAnalytics';
import BookingHistory from './components/Booking/BookingHistory';
import AdminDashboard from './components/admin/AdminDashboard';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes - Standard User */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <EventList />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <PrivateRoute>
                  <BookingHistory />
                </PrivateRoute>
              }
            />

            {/* Protected Routes - Event Organizer */}
            <Route
              path="/events/new"
              element={
                <PrivateRoute roles={['organizer', 'admin']}>
                  <EventForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/edit/:id"
              element={
                <PrivateRoute roles={['organizer', 'admin']}>
                  <EventForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/analytics"
              element={
                <PrivateRoute roles={['organizer', 'admin']}>
                  <EventAnalytics />
                </PrivateRoute>
              }
            />

            {/* Protected Routes - Admin */}
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
