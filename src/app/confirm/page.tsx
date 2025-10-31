'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

interface QSOInfo {
  callsign_worked: string;
  datetime: string;
  band: string;
  mode: string;
  frequency?: number;
}

interface TokenInfo {
  token: string;
  used: boolean;
  used_at?: string;
  qso: QSOInfo;
  requires_pin: boolean;
}

function ConfirmContent() {
  const t = useTranslations('confirm');
  const searchParams = useSearchParams();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Form state
  const [pin, setPin] = useState('');
  const [callsign, setCallsign] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const signature = searchParams.get('sig');

  useEffect(() => {
    if (!token || !signature) {
      setError('missing_params'); // Use special error code for better UI handling
      setLoading(false);
      return;
    }

    // Fetch token information
    fetch(`/api/confirm?token=${encodeURIComponent(token)}&sig=${encodeURIComponent(signature)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTokenInfo(data.data);
        } else {
          setError(data.error || 'Failed to load confirmation information');
        }
      })
      .catch(err => {
        setError('Network error. Please try again.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, signature]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !signature) {
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          signature,
          pin: pin || undefined,
          callsign: callsign || undefined,
          email: email || undefined,
          message: message || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfirmed(true);
      } else {
        setError(data.error || 'Failed to confirm');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background: 'var(--color-bg)'}}>
        <div className="fixed inset-0 bg-pixel-dots pointer-events-none"></div>
        <div className="fixed inset-0 stars pointer-events-none"></div>
        <div className="card-candy border-candy-purple p-8 max-w-md w-full relative z-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-candy-purple rounded-3xl w-3/4 mx-auto"></div>
            <div className="h-4 bg-candy-blue rounded-2xl"></div>
            <div className="h-4 bg-candy-purple rounded-2xl w-5/6"></div>
          </div>
          <p className="text-center text-base font-bold mt-4" style={{color: 'var(--text-secondary)'}}>✨ Loading... ✨</p>
        </div>
      </div>
    );
  }

  if (error && !tokenInfo) {
    const isMissingParams = error === 'missing_params';
    
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}>
        <div className="card-candy p-8 max-w-md w-full" style={{borderColor: isMissingParams ? 'var(--color-accent)' : 'var(--color-secondary)'}}>
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
              isMissingParams ? 'bg-candy-blue' : 'bg-candy-pink'
            }`}>
              {isMissingParams ? (
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-black mb-3" style={{color: 'var(--text-primary)'}}>
              {isMissingParams ? t('linkRequired') : t('error')}
            </h2>
            <p className="text-lg font-semibold mb-4" style={{color: 'var(--text-secondary)'}}>
              {isMissingParams ? t('linkRequiredDesc') : error}
            </p>
            {isMissingParams && (
              <div className="card-candy border-candy-blue p-4 mb-6 text-left">
                <p className="text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>{t('whatYouNeed')}</p>
                <p className="text-xs font-semibold" style={{color: 'var(--text-secondary)'}}>
                  {t('linkFormat')}<br />
                  <code className="bg-candy-blue text-white px-2 py-1 rounded-xl text-xs font-[family-name:var(--font-pixel-mono)] mt-2 inline-block">/confirm?token=...&sig=...</code>
                </p>
              </div>
            )}
            <a
              href="/"
              className="btn-candy inline-block px-6 py-3 bg-candy-blue border-candy-blue text-white rounded-3xl font-bold text-lg"
            >
              {t('goHome')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}>
        <div className="card-candy border-candy-mint p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-candy-mint mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-3" style={{color: 'var(--text-primary)'}}>{t('confirmed')}</h2>
            <p className="text-lg font-semibold mb-6" style={{color: 'var(--text-secondary)'}}>
              {t('confirmedDesc')}
            </p>
            <div className="card-candy border-candy-blue p-4 mb-6">
              <p className="text-sm font-bold mb-2" style={{color: 'var(--text-secondary)'}}>{t('token')}</p>
              <p className="font-[family-name:var(--font-pixel-mono)] text-lg font-bold" style={{color: 'var(--text-primary)'}}>{token}</p>
            </div>
            <p className="text-base font-bold" style={{color: 'var(--text-secondary)'}}>
              {t('thankYou')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenInfo?.used) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}>
        <div className="card-candy border-candy-yellow p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-candy-yellow mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-3" style={{color: 'var(--text-primary)'}}>{t('alreadyConfirmed')}</h2>
            <p className="text-lg font-semibold mb-4" style={{color: 'var(--text-secondary)'}}>
              {t('alreadyConfirmedDesc')}
            </p>
            {tokenInfo.used_at && (
              <p className="text-base font-bold mb-6" style={{color: 'var(--text-secondary)'}}>
                {t('confirmedOn', { date: new Date(tokenInfo.used_at).toLocaleString() })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const [isPending, startTransition] = useTransition();

  const changeLanguage = (locale: string) => {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{background: 'var(--color-bg)'}}>
      {/* 🎨 装饰背景 */}
      <div className="fixed inset-0 bg-pixel-dots pointer-events-none"></div>
      <div className="fixed inset-0 stars pointer-events-none"></div>
      
      <div className="relative z-10 card-candy border-candy-pink p-8 max-w-lg w-full">
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeLanguage('zh')}
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-2xl font-bold transition-all border-3 border-candy-purple hover:bg-candy-purple hover:text-white disabled:opacity-50"
              style={{color: 'var(--text-primary)', background: 'var(--color-surface)'}}
            >
              🇨🇳 中文
            </button>
            <button
              onClick={() => changeLanguage('en')}
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-2xl font-bold transition-all border-3 border-candy-blue hover:bg-candy-blue hover:text-white disabled:opacity-50"
              style={{color: 'var(--text-primary)', background: 'var(--color-surface)'}}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-6 py-3 bg-candy-purple border-4 border-candy-purple rounded-3xl animate-wiggle">
            <span className="text-white font-[family-name:var(--font-pixel-mono)] text-xs tracking-wider font-bold">✨ QSL CONFIRMATION ✨</span>
          </div>
          <h1 className="text-3xl font-black mb-2" style={{color: 'var(--text-primary)'}}>
            {t('title')}
          </h1>
          <p className="text-lg font-bold" style={{color: 'var(--text-secondary)'}}>
            {t('subtitle')}
          </p>
        </div>

        {tokenInfo && (
          <div className="card-candy border-candy-blue p-6 mb-6">
            <h3 className="font-black text-xl mb-4 flex items-center" style={{color: 'var(--text-primary)'}}>
              <span className="mr-2">📻</span>
              {t('qsoDetails')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-candy-blue rounded-2xl">
                <span className="font-bold text-white">{t('callsign')}:</span>
                <span className="font-black text-white font-[family-name:var(--font-pixel-mono)] text-sm">{tokenInfo.qso.callsign_worked}</span>
              </div>
              <div className="flex justify-between p-3 bg-candy-purple rounded-2xl">
                <span className="font-bold text-white">{t('dateTime')}:</span>
                <span className="font-bold text-white">
                  {new Date(tokenInfo.qso.datetime).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-candy-pink rounded-2xl">
                <span className="font-bold text-white">{t('band')}:</span>
                <span className="font-bold text-white">{tokenInfo.qso.band}</span>
              </div>
              <div className="flex justify-between p-3 bg-candy-mint rounded-2xl">
                <span className="font-bold text-white">{t('mode')}:</span>
                <span className="font-bold text-white">{tokenInfo.qso.mode}</span>
              </div>
              {tokenInfo.qso.frequency && (
                <div className="flex justify-between p-3 bg-candy-yellow rounded-2xl">
                  <span className="font-bold text-white">{t('frequency')}:</span>
                  <span className="font-bold text-white">{tokenInfo.qso.frequency} MHz</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleConfirm} className="space-y-5">
          {tokenInfo?.requires_pin && (
            <div>
              <label htmlFor="pin" className="block text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                🔐 {t('pinRequired')} *
              </label>
              <input
                type="text"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 bg-white border-4 border-candy-purple rounded-2xl font-bold placeholder-purple-300 focus:border-candy-pink transition-all"
                style={{color: 'var(--text-primary)'}}
                placeholder={t('pinPlaceholder')}
                maxLength={6}
                required
              />
              <p className="mt-2 text-sm font-bold" style={{color: 'var(--text-secondary)'}}>
                💡 {t('pinHelp')}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="callsign" className="block text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              📡 {t('yourCallsign')}
            </label>
            <input
              type="text"
              id="callsign"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-white border-4 border-candy-blue rounded-2xl font-bold placeholder-blue-300 focus:border-candy-cyan transition-all font-[family-name:var(--font-pixel-mono)] text-sm uppercase"
              style={{color: 'var(--text-primary)'}}
              placeholder={t('callsignPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              📧 {t('yourEmail')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border-4 border-candy-mint rounded-2xl font-bold placeholder-green-300 focus:border-candy-cyan transition-all"
              style={{color: 'var(--text-primary)'}}
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              💬 {t('message')}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border-4 border-candy-yellow rounded-2xl font-bold placeholder-yellow-300 focus:border-candy-orange transition-all resize-none"
              style={{color: 'var(--text-primary)'}}
              placeholder={t('messagePlaceholder')}
            />
          </div>

          {error && (
            <div className="card-candy border-candy-pink p-4 bg-candy-pink">
              <p className="text-white font-bold text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={confirming}
            className="btn-candy w-full py-4 bg-candy-pink border-candy-pink text-white font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? `🔄 ${t('confirming')}` : `🎉 ${t('confirmReceipt')}`}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-4 border-dashed" style={{borderColor: 'var(--color-border)'}}>
          <p className="text-sm font-bold text-center" style={{color: 'var(--text-secondary)'}}>
            🔒 {t('privacyNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}>
        <div className="card-candy border-candy-blue p-8 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-candy-blue rounded-3xl w-3/4 mx-auto"></div>
            <div className="h-4 bg-candy-purple rounded-2xl"></div>
            <div className="h-4 bg-candy-pink rounded-2xl w-5/6"></div>
          </div>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
