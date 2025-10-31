'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [myCallsign, setMyCallsign] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const callsign = process.env.NEXT_PUBLIC_MY_CALLSIGN || localStorage.getItem('my_callsign') || '';
    setMyCallsign(callsign);
  }, []);

  const handleSave = () => {
    localStorage.setItem('my_callsign', myCallsign.toUpperCase());
    localStorage.setItem('user_email', myCallsign.toUpperCase() + '@qsl.local');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/admin');
    }, 1500);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl max-w-2xl">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">系统设置</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="callsign" className="block text-sm font-medium text-gray-300 mb-2">
              我的呼号
            </label>
            <input
              type="text"
              id="callsign"
              value={myCallsign}
              onChange={(e) => setMyCallsign(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase font-mono text-xl tracking-wider text-center"
              placeholder="BG0AAA"
            />
            <p className="mt-2 text-sm text-gray-500">
              此呼号将用于生成QSL卡片和显示在后台界面
            </p>
          </div>

          {process.env.NEXT_PUBLIC_MY_CALLSIGN && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-200 font-medium">环境变量已配置</p>
                  <p className="text-xs text-blue-300 mt-1">
                    系统检测到环境变量 NEXT_PUBLIC_MY_CALLSIGN 已设置为: <code className="font-mono bg-blue-500/20 px-1 rounded">{process.env.NEXT_PUBLIC_MY_CALLSIGN}</code>
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    本地设置将覆盖环境变量配置。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">配置说明</h3>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• 推荐通过环境变量 <code className="font-mono bg-slate-700 px-1 rounded">NEXT_PUBLIC_MY_CALLSIGN</code> 配置呼号</li>
              <li>• 环境变量配置在 <code className="font-mono bg-slate-700 px-1 rounded">.env.local</code> 文件中</li>
              <li>• 本页面的设置会保存在浏览器本地存储中</li>
              <li>• 生产环境建议在 Vercel 环境变量中配置</li>
            </ul>
          </div>

          {saved && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-200 font-medium">设置已保存！</span>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-700">
            <button
              onClick={handleSave}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
