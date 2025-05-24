import { useState } from 'react';
import api from '../../services/api';

export default function BookTicketForm({ eventId, maxTickets, price }) {
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState('');

  const handleBook = async () => {
    try {
      const res = await api.post(`/events/${eventId}/book`, { tickets });
      setMessage(`Booking confirmed! Total: $${res.data.total}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div>
      <h3>Book Tickets</h3>
      <div>
        <label>Tickets: </label>
        <input
          type="number"
          min="1"
          max={maxTickets}
          value={tickets}
          onChange={(e) => setTickets(Math.min(e.target.value, maxTickets))}
        />
        <span> (Max: {maxTickets})</span>
      </div>
      <p>Total: ${(tickets * price).toFixed(2)}</p>
      <button onClick={handleBook}>Book Now</button>
      {message && <p>{message}</p>}
    </div>
  );
}