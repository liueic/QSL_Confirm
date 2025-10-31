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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !tokenInfo) {
    const isMissingParams = error === 'missing_params';
    
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isMissingParams 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
          : 'bg-gradient-to-br from-red-50 to-pink-100'
      }`}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
              isMissingParams ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              {isMissingParams ? (
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isMissingParams ? t('linkRequired') : t('error')}
            </h2>
            <p className="text-gray-600 mb-4">
              {isMissingParams ? t('linkRequiredDesc') : error}
            </p>
            {isMissingParams && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-800 font-medium mb-1">{t('whatYouNeed')}</p>
                <p className="text-xs text-blue-700">
                  {t('linkFormat')}<br />
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">/confirm?token=...&sig=...</code>
                </p>
              </div>
            )}
            <a
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('confirmed')}</h2>
            <p className="text-gray-600 mb-6">
              {t('confirmedDesc')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">{t('token')}</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{token}</p>
            </div>
            <p className="text-sm text-gray-500">
              {t('thankYou')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenInfo?.used) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('alreadyConfirmed')}</h2>
            <p className="text-gray-600 mb-4">
              {t('alreadyConfirmedDesc')}
            </p>
            {tokenInfo.used_at && (
              <p className="text-sm text-gray-500 mb-6">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeLanguage('zh')}
              disabled={isPending}
              className="px-3 py-1 text-sm rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              中文
            </button>
            <button
              onClick={() => changeLanguage('en')}
              disabled={isPending}
              className="px-3 py-1 text-sm rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              English
            </button>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {tokenInfo && (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('qsoDetails')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('callsign')}:</span>
                <span className="font-semibold text-gray-900">{tokenInfo.qso.callsign_worked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('dateTime')}:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(tokenInfo.qso.datetime).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('band')}:</span>
                <span className="font-semibold text-gray-900">{tokenInfo.qso.band}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('mode')}:</span>
                <span className="font-semibold text-gray-900">{tokenInfo.qso.mode}</span>
              </div>
              {tokenInfo.qso.frequency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('frequency')}:</span>
                  <span className="font-semibold text-gray-900">{tokenInfo.qso.frequency} MHz</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleConfirm} className="space-y-4">
          {tokenInfo?.requires_pin && (
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                {t('pinRequired')} *
              </label>
              <input
                type="text"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('pinPlaceholder')}
                maxLength={6}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('pinHelp')}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="callsign" className="block text-sm font-medium text-gray-700 mb-1">
              {t('yourCallsign')}
            </label>
            <input
              type="text"
              id="callsign"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('callsignPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('yourEmail')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {t('message')}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t('messagePlaceholder')}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={confirming}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {confirming ? t('confirming') : t('confirmReceipt')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {t('privacyNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
