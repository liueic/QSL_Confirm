'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface QSO {
  id: string;
  callsign_worked: string;
  datetime: string;
  band: string;
  mode: string;
  mailed: boolean;
  qsl_tokens?: Array<{ id: string; token: string }>;
}

export default function BatchOperationsPage() {
  const [qsos, setQsos] = useState<QSO[]>([]);
  const [selectedQsos, setSelectedQsos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<{ successful: number; failed: number; errors: string[] } | null>(null);

  useEffect(() => {
    loadQsos();
  }, []);

  const loadQsos = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        console.error('Supabase client is not initialized. Please check your environment variables.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { data, error } = await supabase
        .from('qsos')
        .select(`
          id,
          callsign_worked,
          datetime,
          band,
          mode,
          mailed,
          qsl_tokens (
            id,
            token
          )
        `)
        .eq('user_id', user.id)
        .order('datetime', { ascending: false });

      if (error) throw error;
      setQsos(data || []);
    } catch (error) {
      console.error('Error loading QSOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQso = (id: string) => {
    const newSelection = new Set(selectedQsos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedQsos(newSelection);
  };

  const toggleAll = () => {
    if (selectedQsos.size === availableQsos.length) {
      setSelectedQsos(new Set());
    } else {
      setSelectedQsos(new Set(availableQsos.map(q => q.id)));
    }
  };

  const handleGenerateTokens = async () => {
    if (selectedQsos.size === 0) return;

    setGenerating(true);
    setResults(null);

    try {
      const response = await fetch('/api/qso/batch/generate-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qso_ids: Array.from(selectedQsos),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          successful: data.data.successful,
          failed: data.data.failed,
          errors: data.data.errors,
        });
        setSelectedQsos(new Set());
        await loadQsos();
      } else {
        alert('Error generating tokens: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const availableQsos = qsos.filter(q => {
    const hasToken = Array.isArray(q.qsl_tokens) ? q.qsl_tokens.length > 0 : !!q.qsl_tokens;
    return !hasToken;
  });

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QSOs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Batch Token Generation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Generate QSL tokens for multiple QSOs at once
        </p>
      </div>

      {results && (
        <div className={`mb-6 rounded-md p-4 ${results.failed > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${results.failed > 0 ? 'text-yellow-400' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${results.failed > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                Batch generation completed
              </h3>
              <div className={`mt-2 text-sm ${results.failed > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                <p>Successfully generated: {results.successful}</p>
                {results.failed > 0 && <p>Failed: {results.failed}</p>}
                {results.errors.length > 0 && (
                  <ul className="list-disc list-inside mt-2">
                    {results.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Select QSOs
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedQsos.size} of {availableQsos.length} QSOs selected
              </p>
            </div>
            <div className="mt-5 sm:mt-0 sm:flex sm:items-center space-x-3">
              <button
                onClick={toggleAll}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {selectedQsos.size === availableQsos.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleGenerateTokens}
                disabled={selectedQsos.size === 0 || generating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating...' : `Generate Tokens (${selectedQsos.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {availableQsos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedQsos.size === availableQsos.length && availableQsos.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Callsign
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Band
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableQsos.map((qso) => (
                  <tr
                    key={qso.id}
                    className={selectedQsos.has(qso.id) ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedQsos.has(qso.id)}
                        onChange={() => toggleQso(qso.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {qso.callsign_worked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(qso.datetime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {qso.band}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {qso.mode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {qso.mailed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Mailed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Not Mailed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No QSOs available</h3>
            <p className="mt-1 text-sm text-gray-500">
              All your QSOs already have tokens or no QSOs exist yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
