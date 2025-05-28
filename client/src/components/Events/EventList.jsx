import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: filters.search || undefined,
          date: filters.date || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          location: filters.location || undefined
        }
      });
      setEvents(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleBooking = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/bookings`, {
        eventId,
        tickets: 1 // Default to 1 ticket for simplicity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh events list to update availability
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book event');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Events</h2>
      
      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Search events..."
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Filter by location..."
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Min Price
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Max Price
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-bold">Date:</span>{' '}
                  {format(new Date(event.date), 'PPP')}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Location:</span> {event.location}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Price:</span> ${event.price}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Available Tickets:</span>{' '}
                  {event.availableTickets}
                </p>
              </div>
              <button
                onClick={() => handleBooking(event._id)}
                disabled={event.availableTickets === 0}
                className={`w-full ${
                  event.availableTickets === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-700'
                } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              >
                {event.availableTickets === 0 ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="text-center text-gray-600 mt-8">
          No events found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default EventList; 