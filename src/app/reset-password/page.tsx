'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 检查是否有有效的重置令牌（Supabase 会在 URL 中添加 hash fragment）
    const checkSession = async () => {
      if (!supabase) {
        setError('Supabase 配置缺失，请检查环境变量');
        setInitializing(false);
        return;
      }

      // Supabase 会在 URL 中添加 #access_token=...&type=recovery
      // 我们需要等待 Supabase 自动处理这个令牌
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // 尝试从 URL hash 中恢复会话
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');

          if (accessToken && type === 'recovery') {
            // Supabase 应该已经处理了这个令牌，如果没有会话，可能是令牌已过期
            setError('重置链接已过期或无效。请重新请求密码重置。');
          } else {
            setError('无效的重置链接。请从登录页面重新请求密码重置。');
          }
        }
      } catch (error) {
        console.error('检查会话错误:', error);
        setError('验证重置链接时发生错误');
      } finally {
        setInitializing(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!password || !confirmPassword) {
      setError('请输入新密码');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 个字符');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError('Supabase 配置缺失，请检查环境变量');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      // 3 秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('更新密码时发生未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">验证重置链接...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">密码重置成功</h2>
            <p className="mt-2 text-sm text-gray-600">
              您的密码已成功更新。即将跳转到登录页面...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            重置密码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入您的新密码
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-xl p-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                新密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="至少 6 个字符"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                确认新密码
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="再次输入新密码"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '更新密码'}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← 返回登录
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

