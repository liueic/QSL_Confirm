'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface QSO {
  id: string;
  callsign_worked: string;
  datetime: string;
  band: string;
  mode: string;
}

interface TokenData {
  token: string;
  signature: string;
  qr_payload: string;
  pin: string | null;
}

export default function GenerateTokenPage() {
  const router = useRouter();
  const params = useParams();
  const qsoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qso, setQso] = useState<QSO | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [usePin, setUsePin] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchQSO();
  }, [qsoId]);

  useEffect(() => {
    if (tokenData && qrCanvasRef.current) {
      generateQRCode();
    }
  }, [tokenData]);

  const fetchQSO = async () => {
    try {
      const response = await fetch(`/api/qso/${qsoId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setQso(data.data);
      } else {
        setError('QSO not found');
      }
    } catch (err) {
      setError('Failed to load QSO');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!tokenData || !qrCanvasRef.current) return;

    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(qrCanvasRef.current, tokenData.qr_payload, {
        width: 300,
        margin: 2,
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/qso/${qsoId}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          use_pin: usePin,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTokenData(data.data);
      } else {
        setError(data.error || 'Failed to generate token');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (tokenData) {
      navigator.clipboard.writeText(tokenData.qr_payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    
    const url = qrCanvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qsl-token-${tokenData?.token}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !qso) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Link
          href="/admin/qsos"
          className="mt-4 inline-block text-blue-600 hover:text-blue-900"
        >
          Back to QSOs
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 print:hidden">
        <Link
          href={`/admin/qsos/${qsoId}`}
          className="text-blue-600 hover:text-blue-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to QSO Details
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Confirmation Token</h2>

        {qso && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">QSO Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Callsign:</span> <span className="font-semibold">{qso.callsign_worked}</span>
              </div>
              <div>
                <span className="text-gray-600">Date/Time:</span> <span className="font-semibold">{new Date(qso.datetime).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Band:</span> <span className="font-semibold">{qso.band}</span>
              </div>
              <div>
                <span className="text-gray-600">Mode:</span> <span className="font-semibold">{qso.mode}</span>
              </div>
            </div>
          </div>
        )}

        {!tokenData ? (
          <div>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={usePin}
                  onChange={(e) => setUsePin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Generate with PIN protection (Recommended for increased security)
                </span>
              </label>
              <p className="mt-1 ml-6 text-xs text-gray-500">
                When enabled, recipients will need to enter a 6-digit PIN to confirm receipt
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : 'Generate Token'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center">
              <canvas ref={qrCanvasRef} className="mx-auto border border-gray-300 rounded"></canvas>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                <code className="block bg-white px-4 py-2 rounded border border-gray-300 text-lg font-mono">
                  {tokenData.token}
                </code>
              </div>

              {tokenData.pin && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN (Required for Confirmation)</label>
                  <code className="block bg-white px-4 py-2 rounded border border-yellow-300 text-lg font-mono text-center">
                    {tokenData.pin}
                  </code>
                  <p className="mt-2 text-xs text-gray-600">
                    Print this PIN on the QSL card. Recipients will need it to confirm receipt.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Link</label>
                <div className="flex">
                  <input
                    type="text"
                    value={tokenData.qr_payload}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 print:hidden">
              <button
                onClick={handleDownloadQR}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download QR Code
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Print
              </button>
              <Link
                href={`/admin/qsos/${qsoId}`}
                className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Done
              </Link>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Print or download the QR code</li>
                <li>Include the QR code and token on your QSL card</li>
                {tokenData.pin && <li>Print the PIN code on the card (required for confirmation)</li>}
                <li>Mail the card to the recipient</li>
                <li>Mark the QSO as mailed in your records</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
