'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, QrCode } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

type TabType = 'input' | 'scan';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setError('请输入确认码或粘贴确认链接');
      return;
    }

    setError('');

    if (trimmedToken.includes('confirm?')) {
      router.push(`/${trimmedToken.substring(trimmedToken.indexOf('confirm'))}`);
    } else {
      router.push(`/confirm?token=${encodeURIComponent(trimmedToken)}`);
    }
  };

  const handleScanQR = () => {
    setIsScanning(true);
    alert('QR扫描功能需要摄像头权限。请使用设备的二维码扫描应用扫描QSL卡上的二维码。');
    setIsScanning(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError('');
  };

  const tabButtonBaseClass =
    'flex-1 rounded-[999px] px-6 py-3.5 text-base font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="fixed top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <header className="mb-12 text-center md:mb-16">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-primary md:text-5xl lg:text-6xl">
            实体QSL 确认系统
          </h1>
          <p className="mt-4 text-xl font-medium text-secondary md:text-2xl">
            选择你喜欢的方式，快速完成确认流程
          </p>
        </header>

        <div className="mx-auto mb-12 max-w-2xl">
          <div
            className="rounded-[28px] px-6 py-10 shadow-[0_24px_60px_rgba(24,19,48,0.12)] sm:px-12 sm:py-14"
            style={{ background: 'var(--color-surface)' }}
          >
            <div
              className="mx-auto mb-10 flex w-full max-w-md rounded-full border p-1.5"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
              role="tablist"
              aria-label="选择确认方式"
            >
              <button
                type="button"
                id="tab-input"
                role="tab"
                aria-selected={activeTab === 'input'}
                tabIndex={activeTab === 'input' ? 0 : -1}
                onClick={() => handleTabChange('input')}
                className={`${tabButtonBaseClass} ${
                  activeTab === 'input'
                    ? 'bg-candy-yellow text-gray-900 shadow-[0_16px_36px_rgba(24,19,48,0.16)]'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                输入确认码
              </button>
              <button
                type="button"
                id="tab-scan"
                role="tab"
                aria-selected={activeTab === 'scan'}
                tabIndex={activeTab === 'scan' ? 0 : -1}
                onClick={() => handleTabChange('scan')}
                className={`${tabButtonBaseClass} ${
                  activeTab === 'scan'
                    ? 'bg-candy-yellow text-gray-900 shadow-[0_16px_36px_rgba(24,19,48,0.16)]'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                扫描二维码
              </button>
            </div>

            {activeTab === 'input' && (
              <form
                onSubmit={handleSubmit}
                className="mx-auto space-y-8"
                role="tabpanel"
                aria-labelledby="tab-input"
              >
                <div className="space-y-4">
                  <label
                    htmlFor="token"
                    className="block text-center text-lg font-semibold font-heading text-primary"
                  >
                    输入确认码 / 粘贴确认链接
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      id="token"
                      value={token}
                      onChange={(event) => {
                        setToken(event.target.value);
                        if (error) {
                          setError('');
                        }
                      }}
                      className="w-full max-w-md rounded-full border-4 border-candy-purple bg-white px-6 py-5 text-center text-xl font-semibold tracking-widest text-primary transition-colors placeholder:text-secondary focus:border-candy-yellow focus:outline-none"
                      placeholder="XXXX-XXXX-XX"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="text-center text-sm font-medium text-red-500">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-candy-yellow px-6 py-5 text-xl font-bold text-gray-900 transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0"
                  >
                    <CheckCircle2 className="h-6 w-6 text-gray-900" />
                    <span>确认 QSL</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'scan' && (
              <div
                className="mx-auto space-y-8"
                role="tabpanel"
                aria-labelledby="tab-scan"
              >
                <div className="text-center">
                  <QrCode className="mx-auto h-24 w-24 text-primary" strokeWidth={2} />
                  <p className="mt-6 text-lg font-semibold text-primary">
                    使用设备摄像头扫描QSL卡上的二维码
                  </p>
                  <p className="mt-2 text-base text-secondary">
                    随时随地，一键完成实体卡片确认
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleScanQR}
                    disabled={isScanning}
                    className="flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-candy-blue px-6 py-5 text-xl font-bold text-gray-900 transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0"
                  >
                    <QrCode className="h-6 w-6 text-gray-900" />
                    <span>{isScanning ? '正在打开相机…' : '开始扫描二维码'}</span>
                  </button>
                </div>

                <p className="text-center text-sm font-medium text-secondary">
                  无法使用摄像头？切换回上方"输入确认码"选项完成操作。
                </p>
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <div className="flex items-center justify-center space-x-3">
                <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" />
              </div>
            </div>

            <p className="mt-4 text-center text-base font-medium text-secondary">
              收到QSL卡片？选择合适的方式即可完成确认。
            </p>
          </div>
        </div>

        <footer className="mt-16 text-center font-medium text-secondary">
          <p className="mb-2 text-base">Built with Next.js &amp; Supabase</p>
          <p className="text-sm">BD1BND</p>
        </footer>
      </div>
    </div>
  );
}
