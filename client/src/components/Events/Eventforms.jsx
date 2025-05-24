import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function EventForm() {
  const [event, setEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: 0,
    ticketCount: 0
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      api.get(`/events/${id}`)
        .then(res => setEvent(res.data))
        .catch(err => console.error(err));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, event);
      } else {
        await api.post('/events', event);
      }
      navigate('/my-events');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={event.title}
        onChange={(e) => setEvent({...event, title: e.target.value})}
        placeholder="Event Title"
        required
      />
      <textarea
        value={event.description}
        onChange={(e) => setEvent({...event, description: e.target.value})}
        placeholder="Description"
        required
      />
      <input
        type="datetime-local"
        value={event.date}
        onChange={(e) => setEvent({...event, date: e.target.value})}
        required
      />
      <input
        type="text"
        value={event.location}
        onChange={(e) => setEvent({...event, location: e.target.value})}
        placeholder="Location"
        required
      />
      <input
        type="number"
        value={event.price}
        onChange={(e) => setEvent({...event, price: e.target.value})}
        placeholder="Price"
        min="0"
        required
      />
      <input
        type="number"
        value={event.ticketCount}
        onChange={(e) => setEvent({...event, ticketCount: e.target.value})}
        placeholder="Ticket Count"
        min="1"
        required
      />
      <button type="submit">
        {isEdit ? 'Update Event' : 'Create Event'}
      </button>
    </form>
  );
}