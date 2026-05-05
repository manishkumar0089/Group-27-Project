import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Loader, ShieldCheck, ScanLine, GraduationCap } from 'lucide-react';

type LoginMode = 'student' | 'admin' | 'volunteer';

const modes: { id: LoginMode; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  {
    id: 'student',
    label: 'Student',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'indigo',
    desc: 'Register & view your tickets',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'purple',
    desc: 'Manage events & volunteers',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    icon: <ScanLine className="w-5 h-5" />,
    color: 'emerald',
    desc: 'Scan QR codes at the gate',
  },
];

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
};

const activeTabMap: Record<string, string> = {
  indigo: 'border-indigo-600 text-indigo-600 bg-indigo-50',
  purple: 'border-purple-600 text-purple-600 bg-purple-50',
  emerald: 'border-emerald-600 text-emerald-600 bg-emerald-50',
};

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<LoginMode>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const currentMode = modes.find(m => m.id === mode)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await loginApi({ email, password });
      const role: string = resp.data.role;

      const expectedRole = mode.toUpperCase();
      if (role !== expectedRole) {
        toast.error(`This account is not a ${currentMode.label} account.`);
        setLoading(false);
        return;
      }

      login(resp.data);
      toast.success(`Welcome back, ${resp.data.name}!`);
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'VOLUNTEER') navigate('/volunteer/scan');
      else navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <CalendarDays className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-500 mt-1">Choose your role to continue</p>
        </div>

        {/* Role tabs */}
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden mb-6 shadow-sm">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold border-b-2 transition-all
                ${mode === m.id ? activeTabMap[m.color] : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-sm text-gray-500 mb-6 text-center">{currentMode.desc}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorMap[currentMode.color]}`}
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : `Sign in as ${currentMode.label}`}
            </button>
          </form>

          {mode === 'student' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Register</Link>
            </p>
          )}

          {mode === 'volunteer' && (
            <p className="text-center text-xs text-gray-400 mt-6">
              Volunteer credentials are provided by your event admin.
            </p>
          )}

          {mode === 'admin' && (
            <p className="text-center text-xs text-gray-400 mt-6">
              Admin accounts are created by the system administrator.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
