import React, { useEffect, useState } from 'react';
import { getTicketQR } from '../api/api';
import { Download, Loader } from 'lucide-react';

interface Props {
  registrationId: number;
  eventName?: string;
}

const QRDisplay: React.FC<Props> = ({ registrationId, eventName }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const resp = await getTicketQR(registrationId);
        const url = URL.createObjectURL(resp.data);
        setQrUrl(url);
      } catch (e) {
        setError('QR not available. Complete payment to get your ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
    return () => { if (qrUrl) URL.revokeObjectURL(qrUrl); };
    // eslint-disable-next-line
  }, [registrationId]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `ticket-${registrationId}.png`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <Loader className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );

  if (error) return (
    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <p className="text-yellow-700 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      {qrUrl && (
        <>
          <div className="p-3 bg-white border-2 border-indigo-100 rounded-xl shadow-sm">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 btn-secondary text-sm">
            <Download className="w-4 h-4" /> Download Ticket
          </button>
        </>
      )}
    </div>
  );
};

export default QRDisplay;
