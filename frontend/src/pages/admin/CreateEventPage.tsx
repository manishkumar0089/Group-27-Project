import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createEvent } from '../../api/api';
import { Loader, ArrowLeft } from 'lucide-react';

const CreateEventPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '', description: '', category: 'TECHNICAL', venue: '',
    startTime: '', endTime: '', price: '', totalSeats: '', registrationDeadline: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent({
        ...form,
        price: form.price ? parseFloat(form.price) : 0,
        totalSeats: parseInt(form.totalSeats),
      });
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Event Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Tech Hackathon 2025" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} placeholder="Describe the event..." />
            </div>
            <div>
              <label className="label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field" required>
                <option value="TECHNICAL">Technical</option>
                <option value="CULTURAL">Cultural</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>
            <div>
              <label className="label">Venue</label>
              <input name="venue" value={form.venue} onChange={handleChange} className="input-field" placeholder="Main Auditorium" />
            </div>
            <div>
              <label className="label">Start Time *</label>
              <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">End Time *</label>
              <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <input name="registrationDeadline" type="datetime-local" value={form.registrationDeadline} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label">Price (₹) — Leave empty for free</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label">Total Seats *</label>
              <input name="totalSeats" type="number" min="1" value={form.totalSeats} onChange={handleChange} className="input-field" placeholder="200" required />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3">
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-3">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
