import { useState } from 'react';
import api from '../../services/api';

export default function BookTicketForm({ eventId, maxTickets, price }) {
  const [tickets, setTickets] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBook = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/api/v1/bookings', {
        event: eventId,
        ticketQuantity: tickets
      });
      setMessage('Booking confirmed! Check your email for the ticket.');
      // Download ticket if available
      if (res.data.ticket) {
        const blob = new Blob([Buffer.from(res.data.ticket, 'base64')], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${eventId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Book Tickets</h3>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Number of Tickets:</label>
        <div className="flex items-center">
          <input
            type="number"
            min="1"
            max={maxTickets}
            value={tickets}
            onChange={(e) => setTickets(Math.min(parseInt(e.target.value) || 1, maxTickets))}
            className="w-20 px-3 py-2 border rounded-lg mr-2"
          />
          <span className="text-gray-600">(Max: {maxTickets})</span>
        </div>
      </div>
      <p className="text-lg font-semibold mb-4">Total: ${(tickets * price).toFixed(2)}</p>
      <button
        onClick={handleBook}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
      >
        {isLoading ? 'Processing...' : 'Book Now'}
      </button>
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${message.includes('confirmed') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}