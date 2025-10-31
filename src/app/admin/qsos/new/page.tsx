'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewQSOPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    callsign_worked: '',
    my_callsign: '',
    datetime: new Date().toISOString().slice(0, 16),
    band: '20m',
    mode: 'SSB',
    frequency: '',
    rst_sent: '59',
    rst_received: '59',
    notes: '',
  });

  const bands = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '2m', '70cm'];
  const modes = ['SSB', 'CW', 'FM', 'AM', 'RTTY', 'PSK31', 'FT8', 'FT4', 'DIGITAL'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qso/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          frequency: formData.frequency ? parseFloat(formData.frequency) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/qsos');
      } else {
        setError(data.error || 'Failed to create QSO');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link
          href="/admin/qsos"
          className="text-blue-600 hover:text-blue-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to QSOs
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New QSO</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="callsign_worked" className="block text-sm font-medium text-gray-700 mb-1">
                Callsign Worked *
              </label>
              <input
                type="text"
                id="callsign_worked"
                name="callsign_worked"
                value={formData.callsign_worked}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="e.g., N0CALL"
                required
              />
            </div>

            <div>
              <label htmlFor="my_callsign" className="block text-sm font-medium text-gray-700 mb-1">
                My Callsign
              </label>
              <input
                type="text"
                id="my_callsign"
                name="my_callsign"
                value={formData.my_callsign}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="e.g., BG0AAA"
              />
            </div>

            <div>
              <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                id="datetime"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="band" className="block text-sm font-medium text-gray-700 mb-1">
                Band *
              </label>
              <select
                id="band"
                name="band"
                value={formData.band}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {bands.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                Mode *
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {modes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency (MHz)
              </label>
              <input
                type="number"
                step="0.001"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 14.250"
              />
            </div>

            <div>
              <label htmlFor="rst_sent" className="block text-sm font-medium text-gray-700 mb-1">
                RST Sent
              </label>
              <input
                type="text"
                id="rst_sent"
                name="rst_sent"
                value={formData.rst_sent}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 59"
              />
            </div>

            <div>
              <label htmlFor="rst_received" className="block text-sm font-medium text-gray-700 mb-1">
                RST Received
              </label>
              <input
                type="text"
                id="rst_received"
                name="rst_received"
                value={formData.rst_received}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 59"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Additional notes about this QSO..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/qsos"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create QSO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
