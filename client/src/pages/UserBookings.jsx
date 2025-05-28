import { useState, useEffect } from 'react';
import api from '../services/Api';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings.filter(booking => booking._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <div className="booking-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <h3>{booking.event.title}</h3>
              <p>Date: {new Date(booking.event.date).toLocaleString()}</p>
              <p>Tickets: {booking.ticketQuantity}</p>
              <p>Total: ${booking.totalPrice.toFixed(2)}</p>
              <p>Status: {booking.status}</p>
              {booking.status === 'confirmed' && (
                <button onClick={() => handleCancel(booking._id)}>
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}