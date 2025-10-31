import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  
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
    { 
      name: 'QSO 总数', 
      value: totalQsos || 0, 
      color: 'from-candy-blue to-candy-cyan',
      emoji: '📝',
      bgColor: 'border-candy-blue'
    },
    { 
      name: '已邮寄', 
      value: mailedQsos || 0, 
      color: 'from-candy-purple to-candy-pink',
      emoji: '✉️',
      bgColor: 'border-candy-purple'
    },
    { 
      name: '已确认', 
      value: confirmedQsos || 0, 
      color: 'from-candy-mint to-candy-cyan',
      emoji: '✅',
      bgColor: 'border-candy-mint'
    },
    { 
      name: '确认码总数', 
      value: totalTokens || 0, 
      color: 'from-candy-pink to-candy-orange',
      emoji: '🔑',
      bgColor: 'border-candy-pink'
    },
    { 
      name: '已使用', 
      value: usedTokens || 0, 
      color: 'from-candy-orange to-candy-yellow',
      emoji: '🎉',
      bgColor: 'border-candy-orange'
    },
  ];

  const confirmationRate = totalTokens ? ((usedTokens || 0) / totalTokens * 100).toFixed(1) : 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black mb-2" style={{color: 'var(--text-primary)'}}>🎮 仪表盘 🎮</h2>
        <p className="text-lg font-bold" style={{color: 'var(--text-secondary)'}}>QSL 卡片邮寄与确认统计概览</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className={`card-candy ${stat.bgColor} p-6 bg-white/70 hover:scale-105 transition-transform`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg animate-wiggle`}>
                <span className="text-3xl">{stat.emoji}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold mb-2" style={{color: 'var(--text-secondary)'}}>{stat.name}</p>
              <p className="text-4xl font-black" style={{color: 'var(--text-primary)'}}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      <div className="card-candy border-candy-purple p-8 mb-8 bg-white/80">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black flex items-center" style={{color: 'var(--text-primary)'}}>
            <span className="mr-2">📊</span>
            确认进度
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-black bg-gradient-to-r from-candy-mint to-candy-cyan bg-clip-text text-transparent">
              {confirmationRate}%
            </span>
          </div>
        </div>
        <div className="relative h-8 bg-purple-100 rounded-full overflow-hidden border-4 border-candy-purple">
          <div
            style={{ width: `${confirmationRate}%` }}
            className="absolute h-full bg-gradient-to-r from-candy-mint via-candy-cyan to-candy-blue rounded-full transition-all duration-1000 shadow-lg"
          >
            <div className="absolute inset-0 bg-white/30 animate-sparkle"></div>
          </div>
        </div>
        <p className="text-base font-bold mt-4" style={{color: 'var(--text-secondary)'}}>
          🎯 {usedTokens || 0} / {totalTokens || 0} 个确认码已被使用
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="card-candy border-candy-pink p-8 bg-white/80">
          <h3 className="text-2xl font-black mb-6 flex items-center" style={{color: 'var(--text-primary)'}}>
            <span className="mr-2">⚡</span>
            快速操作
          </h3>
          <div className="space-y-4">
            <Link
              href="/admin/qsos/new"
              className="btn-candy flex items-center justify-between p-5 bg-gradient-to-r from-candy-pink to-candy-purple border-candy-pink text-white font-bold text-lg hover:scale-105 group shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span>✨</span>
                <span>添加新 QSO</span>
              </span>
              <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <Link
              href="/admin/batch"
              className="btn-candy flex items-center justify-between p-5 bg-gradient-to-r from-candy-blue to-candy-cyan border-candy-blue text-white font-bold text-lg hover:scale-105 group shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span>🔑</span>
                <span>批量生成确认码</span>
              </span>
              <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/admin/logs"
              className="btn-candy flex items-center justify-between p-5 bg-gradient-to-r from-candy-orange to-candy-yellow border-candy-orange text-white font-bold text-lg hover:scale-105 group shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>查看活动日志</span>
              </span>
              <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="card-candy border-candy-mint p-8 bg-white/80">
          <h3 className="text-2xl font-black mb-6 flex items-center" style={{color: 'var(--text-primary)'}}>
            <span className="mr-2">💚</span>
            系统状态
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-mint/20 to-candy-cyan/20 rounded-2xl border-3 border-candy-mint">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-candy-mint rounded-full mr-3 animate-candy-pulse"></div>
                <span className="text-base font-bold" style={{color: 'var(--text-primary)'}}>数据库</span>
              </div>
              <span className="text-base font-black text-candy-mint">✓ 在线</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-blue/20 to-candy-cyan/20 rounded-2xl border-3 border-candy-blue">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-candy-blue rounded-full mr-3 animate-candy-pulse"></div>
                <span className="text-base font-bold" style={{color: 'var(--text-primary)'}}>身份验证</span>
              </div>
              <span className="text-base font-black text-candy-blue">✓ 活跃</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-purple/20 to-candy-pink/20 rounded-2xl border-3 border-candy-purple">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-candy-purple rounded-full mr-3 animate-candy-pulse"></div>
                <span className="text-base font-bold" style={{color: 'var(--text-primary)'}}>API</span>
              </div>
              <span className="text-base font-black text-candy-purple">✓ 运行中</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-orange/20 to-candy-yellow/20 rounded-2xl border-3 border-candy-orange">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-candy-orange rounded-full mr-3 animate-sparkle"></div>
                <span className="text-base font-bold" style={{color: 'var(--text-primary)'}}>🔐 HMAC 加密</span>
              </div>
              <span className="text-base font-black text-candy-orange">✓ 已启用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
