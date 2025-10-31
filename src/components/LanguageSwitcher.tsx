'use client';

import { useTransition } from 'react';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (locale: string) => {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('zh')}
        disabled={isPending}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currentLocale === 'zh'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        中文
      </button>
      <button
        onClick={() => changeLanguage('en')}
        disabled={isPending}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currentLocale === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        English
      </button>
    </div>
  );
}
