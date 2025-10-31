import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function LogsPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: logs, error } = await supabase
    .from('confirmation_logs')
    .select(`
      *,
      qsl_tokens!inner (
        id,
        token,
        qsos!inner (
          id,
          user_id,
          callsign_worked
        )
      )
    `)
    .eq('qsl_tokens.qsos.user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching logs:', error);
  }

  const eventColors = {
    generated: 'bg-purple-100 text-purple-800',
    scanned: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    revoked: 'bg-red-100 text-red-800',
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
        <p className="mt-1 text-sm text-gray-500">
          Complete audit trail of all token operations
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Callsign
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs && logs.length > 0 ? (
                logs.map((log) => {
                  const token = Array.isArray(log.qsl_tokens) ? log.qsl_tokens[0] : log.qsl_tokens;
                  const qso = token && (Array.isArray(token.qsos) ? token.qsos[0] : token.qsos);
                  
                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          eventColors[log.event as keyof typeof eventColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {log.event}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {token ? (
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {token.token}
                          </code>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qso ? qso.callsign_worked : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.meta && Object.keys(log.meta).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-900">View</summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs && logs.length >= 100 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing the most recent 100 logs. Older logs are archived.
          </p>
        </div>
      )}
    </div>
  );
}
