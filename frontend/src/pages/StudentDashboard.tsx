import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyRegistrations, verifyPayment } from '../api/api';
import { useAuth } from '../context/AuthContext';
import QRDisplay from '../components/QRDisplay';
import { Calendar, MapPin, CreditCard, CheckCircle, Clock, Ticket } from 'lucide-react';

const statusColors: Record<string, string> = {
  FREE: 'text-green-600 bg-green-50',
  PAID: 'text-blue-600 bg-blue-50',
  PENDING: 'text-yellow-600 bg-yellow-50',
};

const StudentDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [txnId, setTxnId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getMyRegistrations()
      .then(r => setRegistrations(r.data))
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (registrationId: number) => {
    if (!txnId.trim()) { toast.error('Enter transaction ID'); return; }
    try {
      await verifyPayment(registrationId, txnId);
      toast.success('Payment verified! Your ticket has been emailed.');
      setPayingId(null);
      setTxnId('');
      const r = await getMyRegistrations();
      setRegistrations(r.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment verification failed');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-1">Hello, {user?.name}! Here are your event registrations.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-16 card">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-500">No registrations yet</h2>
          <p className="text-gray-400 mt-2">Browse and register for events!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map(reg => (
            <div key={reg.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{reg.eventName}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[reg.paymentStatus]}`}>
                      {reg.paymentStatus}
                    </span>
                    {reg.checkedIn && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Checked In
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {reg.eventStartTime && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(reg.eventStartTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {reg.eventVenue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {reg.eventVenue}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Reg ID: #{reg.id}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {reg.paymentStatus === 'PENDING' && (
                    <button
                      onClick={() => setPayingId(payingId === reg.id ? null : reg.id)}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      <CreditCard className="w-4 h-4" /> Pay
                    </button>
                  )}
                  {reg.qrToken && (
                    <button
                      onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                      className="flex items-center gap-1 btn-secondary text-sm px-3 py-1.5"
                    >
                      <Ticket className="w-4 h-4" /> {expandedId === reg.id ? 'Hide' : 'View'} Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Payment form */}
              {payingId === reg.id && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 mb-3 font-medium">
                    Enter your UPI/payment transaction ID to verify payment:
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={txnId}
                      onChange={e => setTxnId(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Transaction ID"
                    />
                    <button onClick={() => handlePayment(reg.id)} className="btn-primary px-4">Verify</button>
                  </div>
                </div>
              )}

              {/* QR Code */}
              {expandedId === reg.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <QRDisplay registrationId={reg.id} eventName={reg.eventName} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
