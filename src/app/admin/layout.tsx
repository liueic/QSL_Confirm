'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import ThemeSwitcher from '@/components/ThemeSwitcher';

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
    { href: '/admin', label: '仪表盘' },
    { href: '/admin/qsos', label: 'QSO记录' },
    { href: '/admin/tokens', label: '确认码' },
    { href: '/admin/logs', label: '日志' },
    { href: '/admin/batch', label: '批量操作' },
    { href: '/admin/settings', label: '设置' },
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
        <div className="fixed inset-0 bg-pixel-dots pointer-events-none"></div>

        {/* Header */}
        <nav className="relative z-10 bg-white/80 backdrop-blur-lg border-b-4 border-candy-purple shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Link href="/admin" className="flex items-center space-x-3 group">
                  <div>
                    <h1 className="text-xl font-heading font-semibold" style={{color: 'var(--text-primary)'}}>QSL.ADMIN</h1>
                    {myCallsign && (
                      <p className="text-xs font-semibold" style={{color: 'var(--text-primary)'}}>{myCallsign}</p>
                    )}
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:ml-8 md:flex md:space-x-2">
                  {navItems.map((item) => {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white border-3 border-white shadow-lg'
                            : 'text-gray-900 hover:bg-white/80 border-2 border-transparent hover:border-candy-purple'
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <ThemeSwitcher />

                <Link 
                  href="/"
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl font-semibold text-sm transition-all border-2 border-candy-cyan text-gray-900"
                >
                  <span>主页</span>
                </Link>

                {userEmail && (
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border-2 border-candy-mint">
                    <div className="w-2.5 h-2.5 bg-candy-mint rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-900">{userEmail}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl font-semibold text-sm transition-all hover:bg-candy-pink hover:text-white border-2 border-candy-pink text-gray-900"
                >
                  <span>退出</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden px-4 py-2 rounded-xl bg-white/80 border-2 border-candy-purple transition-all text-gray-900 font-semibold"
                >
                  {isMobileMenuOpen ? '关闭' : '菜单'}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t-4 border-candy-purple bg-white/90 backdrop-blur-lg">
              <div className="px-3 pt-3 pb-4 space-y-2">
                {navItems.map((item) => {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white border-2 border-white shadow-lg'
                          : 'text-gray-900 bg-white/60 border-2 border-transparent hover:border-candy-purple'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <div className="pt-3 border-t-4 border-dashed border-candy-purple/30">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold bg-candy-pink/10 border-2 border-candy-pink text-candy-pink hover:bg-candy-pink hover:text-white transition-all"
                  >
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
