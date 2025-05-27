import { useState, useEffect } from 'react';
import api from '../services/Api';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get(`/events/admin?status=${filter}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/events/${id}/status`, { status });
      setEvents(events.map(event => 
        event._id === id ? {...event, status} : event
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Event Management</h1>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All Events</option>
        <option value="pending">Pending Approval</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="event-list">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <h3>{event.title}</h3>
            <p>Organizer: {event.organizer.name}</p>
            <p>Status: {event.status}</p>
            {event.status === 'pending' && (
              <div>
                <button onClick={() => handleStatusChange(event._id, 'approved')}>
                  Approve
                </button>
                <button onClick={() => handleStatusChange(event._id, 'rejected')}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}