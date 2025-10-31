'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Home, FileText, Key, ClipboardList, Zap, Settings, LogOut, Menu, X } from 'lucide-react';

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
    { href: '/admin', label: '仪表盘', icon: Home },
    { href: '/admin/qsos', label: 'QSO记录', icon: FileText },
    { href: '/admin/tokens', label: '确认码', icon: Key },
    { href: '/admin/logs', label: '日志', icon: ClipboardList },
    { href: '/admin/batch', label: '批量操作', icon: Zap },
    { href: '/admin/settings', label: '设置', icon: Settings },
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
                  <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-2xl flex items-center justify-center shadow-lg border-3 border-white">
                    <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-semibold" style={{color: 'var(--text-primary)'}}>QSL.ADMIN</h1>
                    {myCallsign && (
                      <p className="text-xs font-semibold" style={{color: 'var(--candy-purple)'}}>{myCallsign}</p>
                    )}
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:ml-8 md:flex md:space-x-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive(item.href)
                            ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white border-3 border-white shadow-lg'
                            : 'text-purple-600 hover:bg-white/80 border-2 border-transparent hover:border-candy-purple'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" strokeWidth={2.5} />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <Link 
                  href="/"
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl font-semibold text-sm transition-all border-2 border-candy-cyan"
                  style={{color: 'var(--text-primary)'}}
                >
                  <Home className="w-4 h-4" strokeWidth={2.5} />
                  <span>主页</span>
                </Link>

                {userEmail && (
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border-2 border-candy-mint">
                    <div className="w-2.5 h-2.5 bg-candy-mint rounded-full"></div>
                    <span className="text-xs font-semibold" style={{color: 'var(--text-primary)'}}>{userEmail}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl font-semibold text-sm transition-all hover:bg-candy-pink hover:text-white border-2 border-candy-pink"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span>退出</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-3 rounded-xl bg-white/80 border-2 border-candy-purple transition-all"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-candy-purple" strokeWidth={2.5} />
                  ) : (
                    <Menu className="w-6 h-6 text-candy-purple" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t-4 border-candy-purple bg-white/90 backdrop-blur-lg">
              <div className="px-3 pt-3 pb-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white border-2 border-white shadow-lg'
                          : 'text-purple-600 bg-white/60 border-2 border-transparent hover:border-candy-purple'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
                <div className="pt-3 border-t-4 border-dashed border-candy-purple/30">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold bg-candy-pink/10 border-2 border-candy-pink text-candy-pink hover:bg-candy-pink hover:text-white transition-all"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={2.5} />
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
