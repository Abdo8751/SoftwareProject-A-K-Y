import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/shared/PrivateRoute';
import Navbar from './components/shared/Navbar';
import ToastNotifications from './components/shared/ToastNotifications';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import MyEvents from './pages/MyEvents';
import EventForm from './pages/EventForm';
import UserBookings from './pages/UserBookings';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <ToastNotifications />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* Authenticated Routes */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/my-events" element={
            <PrivateRoute roles={['organizer', 'admin']}>
              <MyEvents />
            </PrivateRoute>
          } />
          <Route path="/events/new" element={
            <PrivateRoute roles={['organizer', 'admin']}>
              <EventForm />
            </PrivateRoute>
          } />
          <Route path="/events/:id/edit" element={
            <PrivateRoute roles={['organizer', 'admin']}>
              <EventForm />
            </PrivateRoute>
          } />

          {/* User Routes */}
          <Route path="/bookings" element={
            <PrivateRoute roles={['user']}>
              <UserBookings />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/events" element={
            <PrivateRoute roles={['admin']}>
              <AdminEvents />
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
              <AdminUsers />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}