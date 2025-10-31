'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, QrCode, Lock, Zap, FileText, Settings } from 'lucide-react';

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
      {/* Subtle background decoration */}
      <div className="fixed inset-0 bg-pixel-dots pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 tracking-tight text-candy-purple">
            实体QSL 确认系统
          </h1>
          
          <p className="text-xl md:text-2xl font-medium mb-6" style={{color: 'var(--text-primary)'}}>
            扫描二维码或输入确认码，快速完成QSL卡片确认
          </p>
          
        </header>

        {/* Main Search Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card-candy border-candy-pink p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-lg font-semibold mb-3 font-heading" style={{color: 'var(--text-primary)'}}>
                  输入确认码 / 粘贴确认链接
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-6 py-5 bg-white border-4 border-candy-purple rounded-2xl font-semibold text-center text-xl tracking-wider placeholder-purple-600"
                    style={{color: 'var(--text-primary)'}}
                    placeholder="XXXX-XXXX-XX"
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <Search className="w-7 h-7 text-candy-purple" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!token.trim()}
                className="btn-candy w-full bg-candy-pink border-candy-pink text-gray-900 py-5 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认 QSL
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-4 border-dashed" style={{borderColor: 'var(--color-border)'}}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 font-semibold text-lg" style={{color: 'var(--text-primary)', background: 'var(--color-surface)'}}>或</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleScanQR}
                disabled={isScanning}
                className="btn-candy w-full bg-candy-blue border-candy-blue text-gray-900 py-5 font-bold text-xl flex items-center justify-center space-x-3"
              >
                <QrCode className="w-7 h-7 text-gray-900" strokeWidth={2.5} />
                <span>扫描二维码</span>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t-4 border-dashed" style={{borderColor: 'var(--color-border)'}}>
              <p className="text-center font-medium" style={{color: 'var(--text-primary)'}}>
                收到QSL卡片？扫描卡片上的二维码或输入确认码即可完成确认
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 font-medium" style={{color: 'var(--text-secondary)'}}>
          <p className="mb-2 text-base">Built with Next.js & Supabase</p>
          <p className="text-sm">BD1BND</p>
        </footer>
      </div>
    </div>
  );
}
