import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <Link to={`/events/${event._id}`}>
        <h3>{event.title}</h3>
        <p>Date: {new Date(event.date).toLocaleDateString()}</p>
        <p>Location: {event.location}</p>
        <p>Price: ${event.price}</p>
      </Link>
    </div>
  );
}