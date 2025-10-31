'use client';

import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 从localStorage读取用户偏好，如果没有则使用系统偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    // 避免服务端渲染时的不匹配
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-xl font-semibold text-sm transition-all border-2 border-candy-purple bg-white/80 dark:bg-gray-800/80 hover:bg-candy-purple hover:text-white text-gray-900 dark:text-gray-100 dark:hover:text-white"
      aria-label={isDark ? '切换到浅色模式' : '切换到暗黑模式'}
      title={isDark ? '切换到浅色模式' : '切换到暗黑模式'}
    >
      {isDark ? '浅色' : '暗黑'}
    </button>
  );
}

