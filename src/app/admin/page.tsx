import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('admin');
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const [
    { count: totalQsos },
    { count: mailedQsos },
    { count: confirmedQsos },
    { count: totalTokens },
    { count: usedTokens },
  ] = await Promise.all([
    supabase.from('qsos').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
    supabase.from('qsos').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).eq('mailed', true),
    supabase.from('qsos').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).eq('confirmed', true),
    supabase.from('qsl_tokens').select('*, qsos!inner(user_id)', { count: 'exact', head: true }).eq('qsos.user_id', user?.id),
    supabase.from('qsl_tokens').select('*, qsos!inner(user_id)', { count: 'exact', head: true }).eq('qsos.user_id', user?.id).eq('used', true),
  ]);

  const stats = [
    { name: t('totalQsos'), value: totalQsos || 0, color: 'bg-blue-500' },
    { name: t('mailed'), value: mailedQsos || 0, color: 'bg-indigo-500' },
    { name: t('confirmed'), value: confirmedQsos || 0, color: 'bg-green-500' },
    { name: t('totalTokens'), value: totalTokens || 0, color: 'bg-purple-500' },
    { name: t('usedTokens'), value: usedTokens || 0, color: 'bg-pink-500' },
  ];

  const confirmationRate = totalTokens ? ((usedTokens || 0) / totalTokens * 100).toFixed(1) : 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard')}</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirmationRate')}</h3>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                {t('progress')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {confirmationRate}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
            <div
              style={{ width: `${confirmationRate}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {t('tokensConfirmed', { used: usedTokens || 0, total: totalTokens || 0 })}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('quickActions')}</h3>
          <div className="space-y-3">
            <a
              href="/admin/qsos/new"
              className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('addNewQSO')}
            </a>
            <a
              href="/admin/batch"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('batchGenerateTokens')}
            </a>
            <a
              href="/admin/logs"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('viewActivityLogs')}
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('systemStatus')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('database')}</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                {t('connected')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('authentication')}</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                {t('active')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('api')}</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                {t('operational')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
