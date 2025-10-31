'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface InitStatus {
  needsInit: boolean;
  adminConfigured: boolean;
  hasUsers: boolean;
  adminEmail?: string | null;
  adminExists?: boolean;
  existingUserEmails?: string[];
  userCount?: number;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<InitStatus | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetAdminLoading, setResetAdminLoading] = useState(false);
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const checkAndInitAdmin = async () => {
      try {
        setInitializing(true);
        setInitError(null);
        const response = await fetch('/api/auth/init-admin');
        const data = await response.json();
        
        if (!response.ok) {
          setInitError(data.error || data.details || '初始化检查失败');
          setInitStatus({
            needsInit: false,
            adminConfigured: data.adminConfigured || false,
            hasUsers: data.hasUsers || false,
            adminEmail: data.adminEmail || null,
            adminExists: data.adminExists || false,
            existingUserEmails: data.existingUserEmails || [],
            userCount: data.userCount || 0,
          });
          return;
        }

        setInitStatus({
          needsInit: data.needsInit || false,
          adminConfigured: data.adminConfigured || false,
          hasUsers: data.hasUsers || false,
          adminEmail: data.adminEmail || null,
          adminExists: data.adminExists || false,
          existingUserEmails: data.existingUserEmails || [],
          userCount: data.userCount || 0,
        });
        
        if (data.needsInit) {
          const initResponse = await fetch('/api/auth/init-admin', {
            method: 'POST'
          });
          const initData = await initResponse.json();
          
          if (initData.success) {
            console.log('Admin initialized successfully');
            setInitStatus({
              needsInit: false,
              adminConfigured: true,
              hasUsers: true,
              adminEmail: initData.adminEmail || null,
              adminExists: true,
            });
          } else {
            const errorMsg = initData.error || initData.details || '管理员初始化失败';
            setInitError(errorMsg);
            console.error('Admin initialization failed:', initData);
            
            // 即使初始化失败，也保留状态信息（包括邮箱）
            setInitStatus(prev => prev ? { ...prev } : null);
          }
        }
      } catch (error) {
        console.error('Error checking/initializing admin:', error);
        setInitError('无法连接到服务器，请检查网络连接');
      } finally {
        setInitializing(false);
      }
    };

    checkAndInitAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('系统配置错误：Supabase 未配置。请检查环境变量设置。');
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        // 转换常见的错误消息为友好的中文提示
        let friendlyError = error.message;
        
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid credentials')) {
          friendlyError = '登录凭据错误：邮箱或密码不正确。\n\n提示：';
          if (!initStatus?.hasUsers) {
            friendlyError += '\n• 管理员账户可能尚未初始化，请稍候或联系管理员';
          } else {
            friendlyError += '\n• 请确保使用正确的管理员邮箱和密码';
            if (isDevelopment && initStatus?.adminConfigured) {
              friendlyError += '\n• 检查环境变量 ADMIN_EMAIL 和 ADMIN_PASSWORD 是否与输入匹配';
            }
            friendlyError += '\n• 如忘记密码，可使用下方的"重置管理员账户"功能';
          }
        } else if (error.message.includes('Email not confirmed')) {
          friendlyError = '邮箱未确认：请先验证您的邮箱地址';
        } else if (error.message.includes('Too many requests')) {
          friendlyError = '请求过于频繁：请稍后再试';
        } else if (error.message.includes('User not found')) {
          friendlyError = '用户不存在：该邮箱未注册。请确认邮箱地址是否正确。';
        }
        
        throw new Error(friendlyError);
      }
      
      // 登录成功，确保session已保存
      if (data?.session) {
        // 等待session完全保存到localStorage
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 验证session是否已保存
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        
        if (verifySession) {
          // 使用window.location.href进行硬跳转，触发完整的页面刷新
          // 这将确保服务端可以正确读取认证状态
          window.location.href = '/admin';
        } else {
          setError('登录成功，但会话保存失败。请刷新页面后重试。');
          setLoading(false);
        }
      } else {
        // 如果没有session，可能登录失败
        setError('登录成功，但未获取到会话信息。请重试。');
        setLoading(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('登录时发生未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAdmin = async () => {
    if (!confirm('确定要重置管理员账户吗？这将删除现有管理员并重新创建。')) {
      return;
    }

    setResetAdminLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-admin', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '重置管理员账户失败');
      }

      setError(null);
      alert(`管理员账户已成功重置！\n\n请使用环境变量中配置的 ADMIN_EMAIL 和 ADMIN_PASSWORD 登录。`);
      
      // 重新检查初始化状态
      const checkResponse = await fetch('/api/auth/init-admin');
      const checkData = await checkResponse.json();
      if (checkResponse.ok) {
        setInitStatus({
          needsInit: checkData.needsInit || false,
          adminConfigured: checkData.adminConfigured || false,
          hasUsers: checkData.hasUsers || false,
          adminEmail: checkData.adminEmail || null,
          adminExists: checkData.adminExists || false,
          existingUserEmails: checkData.existingUserEmails || [],
          userCount: checkData.userCount || 0,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('重置管理员账户时发生未知错误');
      }
    } finally {
      setResetAdminLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);
    setResetSuccess(false);

    if (!resetEmail) {
      setError('请输入邮箱地址');
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '密码重置请求失败');
      }

      setResetSuccess(true);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('发送密码重置邮件时发生未知错误');
      }
      setResetSuccess(false);
    } finally {
      setResetLoading(false);
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
          <p className="text-center text-sm text-gray-500 mt-4">Initializing system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HamQSL Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* 初始化错误提示 */}
        {initError && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">初始化警告</h3>
                <p className="mt-1 text-sm text-yellow-700 whitespace-pre-line">{initError}</p>
                {isDevelopment && (
                  <p className="mt-2 text-xs text-yellow-600">
                    请检查服务器控制台日志以获取更多详细信息
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 诊断信息和登录提示 */}
        {initStatus && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
            <div className="font-semibold text-blue-800 mb-2 text-sm">登录信息</div>
            <div className="space-y-2 text-sm text-blue-700">
              {initStatus.adminEmail ? (
                <div>
                  <strong>应使用以下邮箱登录：</strong>
                  <div className="mt-1 p-2 bg-white border border-blue-300 rounded font-mono text-sm">
                    {initStatus.adminEmail}
                  </div>
                  {!initStatus.adminExists && initStatus.hasUsers && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                      ⚠️ 注意：配置的邮箱与数据库中的用户不匹配。现有用户：{initStatus.existingUserEmails?.join(', ') || '无'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-700">
                  ⚠️ 管理员邮箱未配置。请设置环境变量 ADMIN_EMAIL。
                </div>
              )}
              
              {isDevelopment && (
                <div className="mt-3 pt-3 border-t border-blue-200 text-xs space-y-1 text-blue-600">
                  <div>初始化状态: {initStatus.needsInit ? '需要初始化' : '已完成'}</div>
                  <div>管理员配置: {initStatus.adminConfigured ? '✓ 已配置' : '✗ 未配置'}</div>
                  <div>已有用户: {initStatus.hasUsers ? `✓ 是 (${initStatus.userCount || 0}个)` : '✗ 否'}</div>
                  {initStatus.adminExists !== undefined && (
                    <div>邮箱匹配: {initStatus.adminExists ? '✓ 是' : '✗ 否'}</div>
                  )}
                </div>
              )}
              
              {initStatus.adminConfigured && !initStatus.hasUsers && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                  提示：管理员已配置但用户未创建。使用上述邮箱和 ADMIN_PASSWORD 环境变量中的密码登录，系统将自动创建账户。
                </div>
              )}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-xl p-8" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">登录失败</h3>
                  <p className="mt-1 text-sm text-red-700 whitespace-pre-line">{error}</p>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => setShowResetForm(!showResetForm)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              忘记密码？
            </button>
            {(isDevelopment || initStatus?.adminConfigured) && (
              <button
                type="button"
                onClick={handleResetAdmin}
                disabled={resetAdminLoading}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-400"
              >
                {resetAdminLoading ? '重置中...' : '重置管理员账户'}
              </button>
            )}
          </div>

          {showResetForm && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="sr-only">
                    重置密码邮箱
                  </label>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="请输入您的邮箱地址"
                  />
                </div>
                {resetSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          密码重置邮件已发送！请检查您的邮箱并按照说明重置密码。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? '发送中...' : '发送重置邮件'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetEmail('');
                      setResetSuccess(false);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
