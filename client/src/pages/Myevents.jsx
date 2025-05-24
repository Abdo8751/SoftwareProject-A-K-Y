import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function MyEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events/organizer')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>My Events</h1>
      <Link to="/events/new">Create New Event</Link>
      <div className="event-list">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <h3>{event.title}</h3>
            <p>Status: {event.status}</p>
            <p>Tickets Sold: {event.ticketsSold}/{event.ticketCount}</p>
            <Link to={`/events/${event._id}/edit`}>Edit</Link>
            <button onClick={() => handleDelete(event._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}