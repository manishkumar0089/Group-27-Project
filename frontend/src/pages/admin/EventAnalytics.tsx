import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEventStats, getCheckInFeed, exportEventData } from '../../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, TrendingUp, Download, RefreshCw } from 'lucide-react';

const EventAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsResp, feedResp] = await Promise.all([
        getEventStats(Number(id)),
        getCheckInFeed(Number(id)),
      ]);
      setStats(statsResp.data);
      setFeed(feedResp.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const resp = await exportEventData(Number(id));
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${id}_registrations.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  // Mock hourly trend for recharts (in real app, this would come from the backend)
  const hourlyData = Array.from({ length: 8 }, (_, i) => ({
    hour: `${8 + i}:00`,
    checkIns: Math.floor(Math.random() * 30 + 5),
  }));

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{stats?.eventName}</h1>
          <p className="text-gray-500 mt-1">Live analytics — auto-refreshing every 3s</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Seats', value: stats?.totalSeats, icon: <Users className="w-5 h-5" />, color: 'text-gray-600 bg-gray-50' },
          { label: 'Total Registrations', value: stats?.totalRegistrations, icon: <Users className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Confirmed', value: stats?.confirmedCount, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
          { label: 'Checked In', value: stats?.checkedInCount, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value ?? 0}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Capacity Bar */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Capacity Utilization</h2>
          <span className="text-2xl font-bold text-indigo-600">{stats?.capacityUtilization?.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${Math.min(100, stats?.capacityUtilization || 0)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>{stats?.totalSeats} seats</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Hourly Check-In Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="checkIns" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Feed */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-800">Live Check-In Feed</h2>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600">Live</span>
            </span>
          </div>
          {feed.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No check-ins yet</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {feed.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">Registration #{entry.id}</div>
                    <div className="text-xs text-gray-500">
                      {entry.registeredAt ? new Date(entry.registeredAt).toLocaleTimeString() : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
