import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createVolunteer, getAllEvents, getVolunteersForEvent } from '../../api/api';
import { UserPlus, Loader, Users, Copy, Check, KeyRound } from 'lucide-react';

const VolunteerManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', assignedEventId: '' });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);

  useEffect(() => {
    getAllEvents().then(r => setEvents(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.assignedEventId) {
      getVolunteersForEvent(parseInt(form.assignedEventId))
        .then(r => setVolunteers(r.data))
        .catch(() => {});
    }
  }, [form.assignedEventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assignedEventId) { toast.error('Select an event'); return; }
    setLoading(true);
    try {
      const resp = await createVolunteer({
        ...form,
        assignedEventId: parseInt(form.assignedEventId),
      });
      setCreated(prev => [resp.data, ...prev]);
      toast.success('Volunteer created successfully!');
      setForm({ name: '', email: '', assignedEventId: form.assignedEventId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create volunteer');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = (password: string, id: number) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Password copied!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
        <p className="text-gray-500 mt-1">Create volunteer accounts and assign them to events</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" /> Add Volunteer
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Volunteer Name" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="volunteer@college.edu" required />
            </div>
            <div>
              <label className="label">Assigned Event *</label>
              <select name="assignedEventId" value={form.assignedEventId} onChange={handleChange} className="input-field" required>
                <option value="">Select an event</option>
                {events.filter(e => e.status === 'OPEN').map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              A random password will be generated and shown here. Share it directly with the volunteer.
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Create Volunteer
            </button>
          </form>
        </div>

        {/* Created Credentials */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Created This Session
          </h2>
          {created.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Credentials will appear here after creation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {created.map((v, i) => (
                <div key={i} className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {v.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.email}</div>
                    </div>
                  </div>

                  <div className="bg-white border border-green-200 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Email</span>
                      <span className="font-mono text-gray-800">{v.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Password</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-800 bg-yellow-100 px-2 py-0.5 rounded">
                          {v.password}
                        </span>
                        <button
                          onClick={() => copyPassword(v.password, i)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy password"
                        >
                          {copiedId === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Assigned Event</span>
                      <span className="text-xs text-indigo-600 font-medium">Event #{v.assignedEventId}</span>
                    </div>
                  </div>

                  <p className="text-xs text-amber-600 mt-2">
                    Share these credentials directly. This is the only time the password is shown.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" /> Volunteers
        </h2>
        <div className="card">
          {volunteers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Select an event to see assigned volunteers</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Password</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.email}</td>
                    <td>{v.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerManagement;
