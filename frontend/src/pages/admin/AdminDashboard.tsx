import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllEvents } from '../../api/api';
import { CalendarDays, Plus, BarChart2, Users, Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents()
      .then(r => setEvents(r.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + e.checkedInCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage events, volunteers, and check-ins</p>
        </div>
        <Link to="/admin/events/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Total Events', value: events.length, icon: <CalendarDays className="w-6 h-6" />, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Registrations', value: totalRegistrations, icon: <Users className="w-6 h-6" />, color: 'text-green-600 bg-green-50' },
          { label: 'Checked In', value: totalCheckedIn, icon: <BarChart2 className="w-6 h-6" />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Events', value: events.filter(e => e.status === 'OPEN').length, icon: <Settings className="w-6 h-6" />, color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {[
          { to: '/admin/events', label: 'Manage Events', desc: 'View, edit, and close events', icon: <CalendarDays className="w-8 h-8" /> },
          { to: '/admin/volunteers', label: 'Volunteers', desc: 'Create and manage volunteers', icon: <Users className="w-8 h-8" /> },
        ].map((link, i) => (
          <Link key={i} to={link.to} className="card hover:shadow-md transition-shadow flex items-center gap-4 group">
            <div className="text-indigo-500 group-hover:text-indigo-700 transition-colors">{link.icon}</div>
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{link.label}</div>
              <div className="text-sm text-gray-500">{link.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Events Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Events</h2>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Event', 'Category', 'Status', 'Registered', 'Checked In', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{event.name}</td>
                    <td className="py-3 px-2 text-gray-500">{event.category}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${event.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                          event.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-700">{event.registeredCount}/{event.totalSeats}</td>
                    <td className="py-3 px-2 text-gray-700">{event.checkedInCount}</td>
                    <td className="py-3 px-2">
                      <Link to={`/admin/events/${event.id}/analytics`} className="text-indigo-600 hover:underline text-xs font-medium mr-3">Analytics</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
