import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  result: {
    success: boolean;
    message: string;
    attendeeName?: string;
    eventName?: string;
    status: string;
  } | null;
}

const statusConfig = {
  VALID: {
    bg: 'bg-green-500',
    icon: <CheckCircle className="w-16 h-16 text-white" />,
    title: 'Valid Ticket!',
  },
  ALREADY_SCANNED: {
    bg: 'bg-yellow-500',
    icon: <AlertCircle className="w-16 h-16 text-white" />,
    title: 'Already Scanned',
  },
  INVALID: {
    bg: 'bg-red-500',
    icon: <XCircle className="w-16 h-16 text-white" />,
    title: 'Invalid QR',
  },
  WRONG_EVENT: {
    bg: 'bg-orange-500',
    icon: <XCircle className="w-16 h-16 text-white" />,
    title: 'Wrong Event',
  },
};

const CheckInResult: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  const config = statusConfig[result.status as keyof typeof statusConfig] || statusConfig.INVALID;

  return (
    <div className={`fixed inset-0 ${config.bg} flex flex-col items-center justify-center z-50 transition-all`}>
      <div className="text-center text-white p-8">
        <div className="flex justify-center mb-4">{config.icon}</div>
        <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
        {result.attendeeName && (
          <p className="text-2xl font-semibold mb-1">{result.attendeeName}</p>
        )}
        {result.eventName && (
          <p className="text-lg opacity-90 mb-2">{result.eventName}</p>
        )}
        <p className="text-base opacity-80">{result.message}</p>
      </div>
    </div>
  );
};

export default CheckInResult;
