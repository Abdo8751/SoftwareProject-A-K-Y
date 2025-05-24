import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <Link to="/">Home</Link>
      {user ? (
        <>
          {user.role === 'organizer' && <Link to="/my-events">My Events</Link>}
          {user.role === 'admin' && (
            <>
              <Link to="/admin/events">Manage Events</Link>
              <Link to="/admin/users">Manage Users</Link>
            </>
          )}
          <Link to="/bookings">My Bookings</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}