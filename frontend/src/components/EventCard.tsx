import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, DollarSign } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
  venue: string;
  startTime: string;
  price: number | null;
  totalSeats: number;
  registeredCount: number;
  availableSeats: number;
  status: string;
}

interface Props {
  event: Event;
  onRegister?: (eventId: number) => void;
  showRegisterButton?: boolean;
}

const categoryColors: Record<string, string> = {
  TECHNICAL: 'bg-blue-100 text-blue-700',
  CULTURAL: 'bg-pink-100 text-pink-700',
  WORKSHOP: 'bg-green-100 text-green-700',
};

const EventCard: React.FC<Props> = ({ event, onRegister, showRegisterButton = true }) => {
  const formattedDate = new Date(event.startTime).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const isFull = event.availableSeats <= 0;
  const isFree = !event.price || event.price === 0;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[event.category] || 'bg-gray-100 text-gray-600'}`}>
          {event.category}
        </span>
        <span className={`text-xs font-bold ${isFree ? 'text-green-600' : 'text-indigo-600'}`}>
          {isFree ? 'FREE' : `₹${event.price}`}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{event.name}</h3>
      <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{event.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{event.availableSeats} / {event.totalSeats} seats left</span>
        </div>
      </div>

      {/* Seat progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
            style={{ width: `${Math.min(100, (event.registeredCount / event.totalSeats) * 100)}%` }}
          />
        </div>
      </div>

      {showRegisterButton && (
        isFull ? (
          <button disabled className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed">
            Event Full
          </button>
        ) : (
          <button
            onClick={() => onRegister && onRegister(event.id)}
            className="w-full btn-primary text-sm"
          >
            Register Now
          </button>
        )
      )}
    </div>
  );
};

export default EventCard;
