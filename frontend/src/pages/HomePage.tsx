import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOpenEvents, registerForEvent } from '../api/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Star, Users, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getOpenEvents()
      .then(r => setEvents(r.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (eventId: number) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (!hasRole('STUDENT')) {
      toast.error('Only students can register for events');
      return;
    }
    try {
      await registerForEvent(eventId);
      toast.success('Registered successfully! Check your email for the ticket.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-indigo-200 text-sm mb-6">
            <Zap className="w-4 h-4" /> Annual College Festival 2025
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Experience the <span className="text-indigo-300">Magic</span> of
            <br />College Events
          </h1>
          <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
            Register for technical workshops, cultural shows, and exciting competitions.
            Get your digital QR pass instantly!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-indigo-900 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Browse Events
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/register')}
                className="bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400"
              >
                Register Now
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { icon: <CalendarDays className="w-6 h-6" />, value: events.length, label: 'Events' },
              { icon: <Users className="w-6 h-6" />, value: '2000+', label: 'Students' },
              { icon: <Star className="w-6 h-6" />, value: '3', label: 'Categories' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-center mb-2 text-indigo-300">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-indigo-300 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Upcoming Events</h2>
          <p className="text-gray-500">Discover and register for exciting college events</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No events open for registration right now.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
                showRegisterButton={true}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
