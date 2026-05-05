import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { searchAttendee, manualCheckIn } from '../../api/api';
import { Search, UserCheck, CheckCircle, Clock, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ManualSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [eventId, setEventId] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !eventId) { toast.error('Enter query and event ID'); return; }
    setSearching(true);
    try {
      const resp = await searchAttendee(query, parseInt(eventId));
      setResults(resp.data);
      if (resp.data.length === 0) toast('No attendees found', { icon: '🔍' });
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async (registrationId: number) => {
    setCheckingIn(registrationId);
    try {
      const resp = await manualCheckIn(registrationId);
      if (resp.data.success) {
        toast.success(resp.data.message);
        setResults(prev => prev.map(r =>
          r.id === registrationId ? { ...r, checkedIn: true } : r
        ));
      } else {
        toast.error(resp.data.message);
      }
    } catch {
      toast.error('Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manual Search</h1>
        <p className="text-gray-500 mt-1">Search attendees by name, phone, or registration ID</p>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Event ID</label>
              <input
                type="number"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="input-field"
                placeholder="Enter event ID"
                required
              />
            </div>
            <div>
              <label className="label">Search Query</label>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="input-field"
                placeholder="Name, phone, or Reg ID"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={searching} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
            {searching ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700">{results.length} result(s) found</h2>
          {results.map(reg => (
            <div key={reg.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">Registration #{reg.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${reg.paymentStatus === 'FREE' ? 'bg-green-100 text-green-700' :
                        reg.paymentStatus === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {reg.paymentStatus}
                    </span>
                    {reg.checkedIn && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Checked In
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Event: {reg.eventName}</div>
                  {reg.registeredAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      Registered: {new Date(reg.registeredAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {!reg.checkedIn && (
                  <button
                    onClick={() => handleCheckIn(reg.id)}
                    disabled={checkingIn === reg.id}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors ml-4"
                  >
                    {checkingIn === reg.id ? <Loader className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Check In
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManualSearchPage;
