import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function TokensPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: tokens, error } = await supabase
    .from('qsl_tokens')
    .select(`
      *,
      qsos!inner (
        id,
        user_id,
        callsign_worked,
        datetime,
        band,
        mode
      )
    `)
    .eq('qsos.user_id', user?.id)
    .order('issued_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching tokens:', error);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">QSL Tokens</h2>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Tokens</div>
          <div className="text-2xl font-semibold text-gray-900">{tokens?.length || 0}</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-4">
          <div className="text-sm text-gray-500">Used Tokens</div>
          <div className="text-2xl font-semibold text-green-600">
            {tokens?.filter(t => t.used).length || 0}
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-4">
          <div className="text-sm text-gray-500">Pending Confirmation</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {tokens?.filter(t => !t.used).length || 0}
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QSO Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used By
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens && tokens.length > 0 ? (
                tokens.map((token) => {
                  const qso = Array.isArray(token.qsos) ? token.qsos[0] : token.qsos;
                  return (
                    <tr key={token.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {token.token}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{qso.callsign_worked}</div>
                        <div className="text-gray-500">
                          {qso.band} • {qso.mode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(token.issued_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {token.used ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {token.used ? (
                          <div>
                            <div>{token.used_by || 'Anonymous'}</div>
                            {token.used_at && (
                              <div className="text-xs text-gray-400">
                                {new Date(token.used_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/tokens/${token.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tokens found. Generate tokens from the QSOs page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
