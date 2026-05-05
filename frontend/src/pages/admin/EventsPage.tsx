import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllEvents, closeEvent, exportEventData } from '../../api/api';
import { Plus, BarChart2, Download, XCircle, Calendar } from 'lucide-react';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    getAllEvents()
      .then(r => setEvents(r.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchEvents, []);

  const handleClose = async (id: number, name: string) => {
    if (!window.confirm(`Close event "${name}"? This cannot be undone.`)) return;
    try {
      await closeEvent(id);
      toast.success('Event closed');
      fetchEvents();
    } catch {
      toast.error('Failed to close event');
    }
  };

  const handleExport = async (id: number, name: string) => {
    try {
      const resp = await exportEventData(id);
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_registrations.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link to="/admin/events/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 card">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${event.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        event.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {event.status}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{event.category}</span>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                    <span>{event.venue}</span>
                    <span>{new Date(event.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>{event.registeredCount}/{event.totalSeats} registered</span>
                    <span>{event.checkedInCount} checked in</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/events/${event.id}/analytics`} className="flex items-center gap-1 btn-secondary text-xs px-3 py-1.5">
                    <BarChart2 className="w-3 h-3" /> Analytics
                  </Link>
                  <button onClick={() => handleExport(event.id, event.name)} className="flex items-center gap-1 btn-secondary text-xs px-3 py-1.5">
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
                  {event.status === 'OPEN' && (
                    <button onClick={() => handleClose(event.id, event.name)} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                      <XCircle className="w-3 h-3" /> Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
