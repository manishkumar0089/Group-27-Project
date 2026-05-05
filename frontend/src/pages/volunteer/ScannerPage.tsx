import React, { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQR } from '../../api/api';
import CheckInResult from '../../components/CheckInResult';
import { QrCode, Camera, X } from 'lucide-react';

const ScannerPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showResult = useCallback((data: any) => {
    setResult(data);
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setResult(null);
    }, 3000);
  }, []);

  const handleScan = useCallback(async (token: string) => {
    try {
      const resp = await scanQR(token);
      showResult(resp.data);
    } catch (err: any) {
      showResult({ success: false, message: 'Scan error', status: 'INVALID' });
    }
  }, [showResult]);

  const startScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode('qr-reader');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Pause while processing
          await handleScan(decodedText);
        },
        undefined
      );
      setScanning(true);
    } catch (err) {
      toast.error('Failed to start camera. Check camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await handleScan(manualToken.trim());
    setManualToken('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Result overlay */}
      {result && <CheckInResult result={result} />}

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <QrCode className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
          <h1 className="text-2xl font-bold">QR Scanner</h1>
          <p className="text-gray-400 text-sm mt-1">Scan attendee tickets at entry</p>
        </div>

        {/* Camera viewfinder */}
        <div className="relative bg-black rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '1/1' }}>
          <div id="qr-reader" className="w-full h-full" />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
              <Camera className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">Camera off</p>
            </div>
          )}
          {scanning && (
            <>
              {/* Corner brackets */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mb-8">
          {!scanning ? (
            <button onClick={startScanner} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" /> Start Camera
            </button>
          ) : (
            <button onClick={stopScanner} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
              <X className="w-5 h-5" /> Stop Camera
            </button>
          )}
        </div>

        {/* Manual token input */}
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-3 text-gray-300">Manual Token Entry</h3>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500"
              placeholder="Paste QR token here..."
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Scan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
