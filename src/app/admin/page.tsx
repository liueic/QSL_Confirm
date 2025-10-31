import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { FileText, Mail, CheckCircle, Key, PartyPopper, BarChart3, Zap, Plus, ArrowRight, ClipboardList, Database, Shield, Cpu, Lock } from 'lucide-react';

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
      icon: FileText,
      bgColor: 'border-candy-blue'
    },
    { 
      name: '已邮寄', 
      value: mailedQsos || 0, 
      color: 'from-candy-purple to-candy-pink',
      icon: Mail,
      bgColor: 'border-candy-purple'
    },
    { 
      name: '已确认', 
      value: confirmedQsos || 0, 
      color: 'from-candy-mint to-candy-cyan',
      icon: CheckCircle,
      bgColor: 'border-candy-mint'
    },
    { 
      name: '确认码总数', 
      value: totalTokens || 0, 
      color: 'from-candy-pink to-candy-orange',
      icon: Key,
      bgColor: 'border-candy-pink'
    },
    { 
      name: '已使用', 
      value: usedTokens || 0, 
      color: 'from-candy-orange to-candy-yellow',
      icon: PartyPopper,
      bgColor: 'border-candy-orange'
    },
  ];

  const confirmationRate = totalTokens ? ((usedTokens || 0) / totalTokens * 100).toFixed(1) : 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="font-heading text-4xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>仪表盘</h2>
        <p className="text-lg font-medium" style={{color: 'var(--text-secondary)'}}>QSL 卡片邮寄与确认统计概览</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className={`card-candy ${stat.bgColor} p-6 bg-white/70`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2" style={{color: 'var(--text-secondary)'}}>{stat.name}</p>
                <p className="text-4xl font-bold font-heading" style={{color: 'var(--text-primary)'}}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Section */}
      <div className="card-candy border-candy-purple p-8 mb-8 bg-white/80">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-heading font-semibold flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
            <BarChart3 className="w-6 h-6" strokeWidth={2.5} />
            确认进度
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold font-heading bg-gradient-to-r from-candy-mint to-candy-cyan bg-clip-text text-transparent">
              {confirmationRate}%
            </span>
          </div>
        </div>
        <div className="relative h-8 bg-purple-100 rounded-full overflow-hidden border-4 border-candy-purple">
          <div
            style={{ width: `${confirmationRate}%` }}
            className="absolute h-full bg-gradient-to-r from-candy-mint via-candy-cyan to-candy-blue rounded-full transition-all duration-1000 shadow-lg"
          ></div>
        </div>
        <p className="text-base font-medium mt-4 flex items-center gap-2" style={{color: 'var(--text-secondary)'}}>
          <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
          {usedTokens || 0} / {totalTokens || 0} 个确认码已被使用
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="card-candy border-candy-pink p-8 bg-white/80">
          <h3 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
            <Zap className="w-6 h-6" strokeWidth={2.5} />
            快速操作
          </h3>
          <div className="space-y-4">
            <Link
              href="/admin/qsos/new"
              className="btn-candy flex items-center justify-between p-5 bg-gradient-to-r from-candy-pink to-candy-purple border-candy-pink text-white font-bold text-lg group shadow-lg"
            >
              <span className="flex items-center gap-3">
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span>添加新 QSO</span>
              </span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </Link>
            <Link
              href="/admin/batch"
              className="btn-candy flex items-center justify-between p-5 bg-gradient-to-r from-candy-blue to-candy-cyan border-candy-blue text-white font-bold text-lg group shadow-lg"
            >
              <span className="flex items-center gap-3">
                <Key className="w-5 h-5" strokeWidth={2.5} />
                <span>批量生成确认码</span>
              </span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </Link>
            <Link
              href="/admin/logs"
              className="btn-candy flex items-center justify-between p-5 bg-gradient-to-r from-candy-orange to-candy-yellow border-candy-orange text-white font-bold text-lg group shadow-lg"
            >
              <span className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5" strokeWidth={2.5} />
                <span>查看活动日志</span>
              </span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="card-candy border-candy-mint p-8 bg-white/80">
          <h3 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
            <Cpu className="w-6 h-6" strokeWidth={2.5} />
            系统状态
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-mint/20 to-candy-cyan/20 rounded-2xl border-3 border-candy-mint">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-candy-mint" strokeWidth={2.5} />
                <span className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>数据库</span>
              </div>
              <span className="text-base font-bold text-candy-mint">在线</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-blue/20 to-candy-cyan/20 rounded-2xl border-3 border-candy-blue">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-candy-blue" strokeWidth={2.5} />
                <span className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>身份验证</span>
              </div>
              <span className="text-base font-bold text-candy-blue">活跃</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-purple/20 to-candy-pink/20 rounded-2xl border-3 border-candy-purple">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-candy-purple" strokeWidth={2.5} />
                <span className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>API</span>
              </div>
              <span className="text-base font-bold text-candy-purple">运行中</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-candy-orange/20 to-candy-yellow/20 rounded-2xl border-3 border-candy-orange">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-candy-orange" strokeWidth={2.5} />
                <span className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>HMAC 加密</span>
              </div>
              <span className="text-base font-bold text-candy-orange">已启用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
