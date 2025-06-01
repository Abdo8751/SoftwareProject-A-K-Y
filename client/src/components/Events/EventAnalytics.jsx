import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const EventAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventAnalytics(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/events/organizer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEvent(response.data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAnalytics = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/v1/events/${eventId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Event Analytics</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          You haven't created any events yet.
        </div>
      ) : (
        <>
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Event
            </label>
            <select
              value={selectedEvent || ''}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} - {format(new Date(event.date), 'PPP')}
                </option>
              ))}
            </select>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Ticket Sales</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Total Tickets</p>
                    <p className="text-2xl font-bold">{analytics.totalTickets}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tickets Sold</p>
                    <p className="text-2xl font-bold">{analytics.ticketsSold}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available Tickets</p>
                    <p className="text-2xl font-bold">{analytics.availableTickets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${analytics.totalRevenue}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Average Ticket Price</p>
                    <p className="text-2xl font-bold">${analytics.averageTicketPrice}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Active Bookings</p>
                    <p className="text-2xl font-bold">{analytics.activeBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cancelled Bookings</p>
                    <p className="text-2xl font-bold">{analytics.cancelledBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cancellation Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.cancellationRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.recentBookings.map(booking => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.tickets}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${booking.totalPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${booking.isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                            >
                              {booking.isCancelled ? 'Cancelled' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(booking.bookingDate), 'PPP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventAnalytics; 