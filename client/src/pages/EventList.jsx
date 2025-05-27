import { useEffect, useState } from 'react';
import api from '../services/Api';
import EventCard from '../components/Events/EventCard';

export default function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/v1/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="event-list">
      <h1>Upcoming Events</h1>
      <div className="events">
        {events.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}