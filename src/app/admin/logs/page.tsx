import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkDatabaseTables } from '@/lib/db-utils';

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

  // 检查是否为表不存在错误
  const isTableMissingError = error?.code === 'PGRST205' || error?.message?.includes('Could not find the table');
  
  // 如果检测到表不存在错误，进行诊断检查
  let tableStatus = null;
  if (isTableMissingError) {
    tableStatus = await checkDatabaseTables();
  }

  if (error && !isTableMissingError) {
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

      {/* 表不存在错误提示 */}
      {isTableMissingError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                数据库表未初始化
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  <code className="bg-red-100 px-2 py-1 rounded font-mono text-xs">confirmation_logs</code> 表在数据库中不存在。
                  这通常意味着数据库迁移尚未执行。
                </p>
                {tableStatus && !tableStatus.tablesExist && (
                  <div className="mt-3">
                    <p className="font-medium">缺失的表：</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {tableStatus.missingTables.map((table) => (
                        <li key={table}><code className="bg-red-100 px-1 py-0.5 rounded text-xs">{table}</code></li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <p className="font-medium mb-2">修复步骤：</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>运行数据库检查脚本：<code className="bg-red-100 px-1 py-0.5 rounded">npm run check-db</code></li>
                    <li>在 Supabase Dashboard 的 SQL Editor 中执行迁移文件：<code className="bg-red-100 px-1 py-0.5 rounded">supabase/migrations/20240101000000_initial_schema.sql</code></li>
                    <li>刷新此页面查看日志</li>
                  </ol>
                  <p className="mt-3 text-xs">
                    详细说明请参考 <a href="/api/health/db" target="_blank" className="underline font-medium">数据库健康检查</a> 或查看 <code className="bg-red-100 px-1 py-0.5 rounded">DATABASE_SETUP.md</code> 文档。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 其他错误提示 */}
      {error && !isTableMissingError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                加载日志时出错
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>错误代码：<code className="bg-yellow-100 px-2 py-1 rounded font-mono text-xs">{error.code || 'Unknown'}</code></p>
                <p className="mt-1">错误信息：{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {isTableMissingError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    无法加载日志 - 数据库表未初始化。请查看上方的错误提示并按照修复步骤操作。
                  </td>
                </tr>
              ) : logs && logs.length > 0 ? (
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
