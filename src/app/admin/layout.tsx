'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [myCallsign, setMyCallsign] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const callsign = process.env.NEXT_PUBLIC_MY_CALLSIGN || localStorage.getItem('my_callsign') || '';
    setMyCallsign(callsign);

    const email = localStorage.getItem('user_email') || '';
    setUserEmail(email);
  }, []);

  const navItems = [
    { href: '/admin', label: '仪表盘', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', emoji: '🏠' },
    { href: '/admin/qsos', label: 'QSO记录', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', emoji: '📝' },
    { href: '/admin/tokens', label: '确认码', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', emoji: '🔑' },
    { href: '/admin/logs', label: '日志', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', emoji: '📋' },
    { href: '/admin/batch', label: '批量操作', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', emoji: '⚡' },
    { href: '/admin/settings', label: '设置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', emoji: '⚙️' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100 relative overflow-hidden">
        {/* 🎨 像素点背景装饰 */}
        <div className="fixed inset-0 bg-pixel-dots pointer-events-none"></div>
        
        {/* ⭐ 星星装饰 */}
        <div className="fixed inset-0 stars pointer-events-none"></div>

        {/* Header */}
        <nav className="relative z-10 bg-white/80 backdrop-blur-lg border-b-4 border-candy-purple shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all border-3 border-white">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-black font-[family-name:var(--font-pixel-mono)] text-sm" style={{color: 'var(--text-primary)'}}>✨QSL.ADMIN✨</h1>
                    {myCallsign && (
                      <p className="text-xs font-bold" style={{color: 'var(--candy-purple)'}}>{myCallsign}</p>
                    )}
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:ml-8 md:flex md:space-x-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white border-3 border-white shadow-lg scale-105'
                          : 'text-purple-600 hover:bg-white/80 hover:scale-105 border-2 border-transparent hover:border-candy-purple'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{item.emoji}</span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <Link 
                  href="/"
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl font-bold text-sm transition-all hover:scale-105 border-2 border-candy-cyan"
                  style={{color: 'var(--text-primary)'}}
                >
                  <span>🏠</span>
                  <span>主页</span>
                </Link>

                {userEmail && (
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border-2 border-candy-mint">
                    <div className="w-2.5 h-2.5 bg-candy-mint rounded-full animate-candy-pulse"></div>
                    <span className="text-xs font-bold" style={{color: 'var(--text-primary)'}}>{userEmail}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:bg-candy-pink hover:text-white border-2 border-candy-pink"
                >
                  <span>🚪</span>
                  <span>退出</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-3 rounded-xl bg-white/80 border-2 border-candy-purple hover:scale-110 transition-all"
                >
                  <svg className="w-6 h-6 text-candy-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t-4 border-candy-purple bg-white/90 backdrop-blur-lg">
              <div className="px-3 pt-3 pb-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white border-2 border-white shadow-lg'
                        : 'text-purple-600 bg-white/60 border-2 border-transparent hover:border-candy-purple'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
                <div className="pt-3 border-t-4 border-dashed border-candy-purple/30">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl font-bold bg-candy-pink/10 border-2 border-candy-pink text-candy-pink hover:bg-candy-pink hover:text-white transition-all"
                  >
                    <span>🚪</span>
                    <span>退出</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
