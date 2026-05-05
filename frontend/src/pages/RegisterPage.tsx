import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerApi, getOpenEvents } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Loader } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', college: '', year: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getOpenEvents().then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEvent = (id: number) => {
    setSelectedEvents(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const resp = await registerApi({
        name: form.name,
        email: form.email,
        phone: form.phone,
        college: form.college,
        year: parseInt(form.year),
        password: form.password,
        eventIds: selectedEvents,
      });
      login(resp.data);
      toast.success('Registered successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <CalendarDays className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Register once, attend everything.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="9876543210" />
            </div>
            <div>
              <label className="label">College</label>
              <input name="college" value={form.college} onChange={handleChange} className="input-field" placeholder="Your College Name" />
            </div>
            <div>
              <label className="label">Year</label>
              <select name="year" value={form.year} onChange={handleChange} className="input-field">
                <option value="">Select Year</option>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min. 8 characters" minLength={8} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Confirm Password *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input-field" placeholder="Re-enter password" required />
            </div>
          </div>

          {events.length > 0 && (
            <div className="border-t pt-5">
              <h3 className="font-semibold text-gray-800 mb-3">Select Events (Optional)</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {events.map(event => (
                  <label key={event.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                    ${selectedEvents.includes(event.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{event.name}</div>
                      <div className="text-xs text-gray-500">
                        {event.price ? `₹${event.price}` : 'Free'} • {event.availableSeats ?? event.totalSeats} seats left
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedEvents.length > 0 && (
                <p className="text-sm text-indigo-700 bg-indigo-50 rounded-lg p-3 mt-3">
                  Free event tickets will be emailed to you instantly after registration.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
