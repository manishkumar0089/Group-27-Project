import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, CalendarDays, LogOut, User, LayoutDashboard, QrCode } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <CalendarDays className="w-6 h-6 text-indigo-300" />
            <span>CollegeFest</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-indigo-200 hover:text-white transition-colors text-sm font-medium">Events</Link>
            {isAuthenticated && hasRole('STUDENT') && (
              <Link to="/dashboard" className="text-indigo-200 hover:text-white transition-colors text-sm font-medium">My Tickets</Link>
            )}
            {isAuthenticated && hasRole('ADMIN') && (
              <Link to="/admin" className="text-indigo-200 hover:text-white transition-colors text-sm font-medium">Admin</Link>
            )}
            {isAuthenticated && hasRole('VOLUNTEER') && (
              <Link to="/volunteer/scan" className="text-indigo-200 hover:text-white transition-colors text-sm font-medium">Scanner</Link>
            )}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-indigo-200 hover:text-white transition-colors text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Register</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-indigo-200 text-sm">Hi, {user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-indigo-200 hover:text-white transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-indigo-200 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Events</Link>
            {isAuthenticated && hasRole('STUDENT') && (
              <Link to="/dashboard" className="block text-indigo-200 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>My Tickets</Link>
            )}
            {isAuthenticated && hasRole('ADMIN') && (
              <Link to="/admin" className="block text-indigo-200 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Admin</Link>
            )}
            {isAuthenticated && hasRole('VOLUNTEER') && (
              <Link to="/volunteer/scan" className="block text-indigo-200 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Scanner</Link>
            )}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block text-indigo-200 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="block text-indigo-200 hover:text-white py-2 text-sm" onClick={() => setOpen(false)}>Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="block text-indigo-200 hover:text-white py-2 text-sm">Logout</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
