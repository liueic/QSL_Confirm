'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    // If token contains a full URL, extract token and sig
    if (token.includes('confirm?')) {
      router.push(`/${token.substring(token.indexOf('confirm'))}`);
    } else {
      // Assume it's just a token, navigate to confirm page
      router.push(`/confirm?token=${encodeURIComponent(token.trim())}`);
    }
  };

  const handleScanQR = () => {
    setIsScanning(true);
    // In a real implementation, this would open a QR scanner
    // For now, we'll show a message
    alert('QR扫描功能需要摄像头权限。请使用设备的二维码扫描应用扫描QSL卡上的二维码。');
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--color-bg)'}}>
      {/* 🎨 像素点背景装饰 */}
      <div className="fixed inset-0 bg-pixel-dots pointer-events-none"></div>
      
      {/* ⭐ 星星装饰 */}
      <div className="fixed inset-0 stars pointer-events-none"></div>

      {/* 🍬 浮动糖果装饰 - 完全扁平化 */}
      <div className="fixed top-20 left-10 w-16 h-16 bg-candy-pink rounded-full opacity-20 animate-bounce-rainbow"></div>
      <div className="fixed top-40 right-20 w-12 h-12 bg-candy-blue rounded-full opacity-20 animate-wiggle"></div>
      <div className="fixed bottom-20 left-1/4 w-20 h-20 bg-candy-yellow rounded-full opacity-15 animate-sparkle"></div>
      <div className="fixed bottom-32 right-1/3 w-14 h-14 bg-candy-mint rounded-full opacity-20 animate-bounce-rainbow"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6 px-6 py-3 bg-candy-purple border-4 border-candy-purple rounded-3xl animate-wiggle">
            <span className="text-white font-[family-name:var(--font-pixel-mono)] text-xs md:text-sm tracking-wider font-bold">✨ HAM RADIO QSL ✨</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight text-candy-purple">
            实体QSL 确认系统
          </h1>
          
          <p className="text-xl md:text-2xl font-bold mb-6" style={{color: 'var(--text-primary)'}}>
            🎮 扫描二维码或输入确认码，快速完成QSL卡片确认 🎮
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-base font-semibold flex-wrap gap-3">
            <div className="flex items-center px-4 py-2 bg-candy-mint rounded-full border-3 border-candy-mint">
              <div className="w-3 h-3 bg-white rounded-full mr-2 animate-candy-pulse"></div>
              <span className="text-white font-bold">系统在线</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-candy-blue rounded-full border-3 border-candy-blue">
              <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
              <span className="text-white font-bold">🔒 HMAC 加密</span>
            </div>
          </div>
        </header>

        {/* Main Search Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card-candy border-candy-pink p-8 md:p-12 transform hover:scale-[1.02] transition-transform">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-lg font-bold mb-3 font-[family-name:var(--font-pixel-mono)] text-sm" style={{color: 'var(--text-primary)'}}>
                  💌 输入确认码 / 粘贴确认链接
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-6 py-5 bg-white border-4 border-candy-purple rounded-2xl font-bold text-center text-xl tracking-wider placeholder-purple-300 focus:border-candy-pink transition-all"
                    style={{color: 'var(--text-primary)'}}
                    placeholder="XXXX-XXXX-XX"
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <svg className="w-7 h-7 text-candy-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!token.trim()}
                className="btn-candy w-full bg-candy-pink border-candy-pink text-white py-5 font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎉 确认 QSL 🎉
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-4 border-dashed" style={{borderColor: 'var(--color-border)'}}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 font-bold text-lg" style={{color: 'var(--text-secondary)', background: 'var(--color-surface)'}}>或</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleScanQR}
                disabled={isScanning}
                className="btn-candy w-full bg-candy-blue border-candy-blue text-white py-5 font-black text-xl flex items-center justify-center space-x-3"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>📷 扫描二维码</span>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t-4 border-dashed" style={{borderColor: 'var(--color-border)'}}>
              <p className="text-center font-bold" style={{color: 'var(--text-secondary)'}}>
                💝 收到QSL卡片？扫描卡片上的二维码或输入确认码即可完成确认 💝
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-candy border-candy-purple p-6 hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-candy-purple rounded-3xl flex items-center justify-center mb-4 animate-wiggle">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2" style={{color: 'var(--text-primary)'}}>🔐 HMAC 安全加密</h3>
            <p className="font-semibold" style={{color: 'var(--text-secondary)'}}>使用 HMAC-SHA256 签名技术，确保每个确认码的真实性和不可伪造性</p>
          </div>

          <div className="card-candy border-candy-pink p-6 hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-candy-pink rounded-3xl flex items-center justify-center mb-4 animate-sparkle">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2" style={{color: 'var(--text-primary)'}}>⚡ 极速确认</h3>
            <p className="font-semibold" style={{color: 'var(--text-secondary)'}}>无需注册登录，扫码或输入确认码即可完成确认，流程简单快捷</p>
          </div>

          <div className="card-candy border-candy-blue p-6 hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-candy-blue rounded-3xl flex items-center justify-center mb-4 animate-bounce-rainbow">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2" style={{color: 'var(--text-primary)'}}>📝 完整日志</h3>
            <p className="font-semibold" style={{color: 'var(--text-secondary)'}}>记录所有确认操作，包含时间戳和IP地址，方便审计和追踪</p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="text-center">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-3 px-6 py-3 bg-candy-yellow border-4 border-candy-yellow rounded-3xl font-bold text-lg hover:scale-105 transition-transform group"
          >
            <svg className="w-6 h-6 transform group-hover:rotate-180 transition-transform text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-[family-name:var(--font-pixel-mono)] text-sm text-white">⚙️ 管理后台 ⚙️</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 font-bold" style={{color: 'var(--text-secondary)'}}>
          <p className="mb-2 text-lg">🌈 Built with Next.js & Supabase 🌈</p>
          <p className="text-base">✨ QSL Mail Confirmation System ✨</p>
        </footer>
      </div>
    </div>
  );
}
