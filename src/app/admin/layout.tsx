import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 强制动态渲染，因为需要用户认证
export const dynamic = 'force-dynamic';

async function AdminNav({ userEmail }: { userEmail?: string | null }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">HamQSL Admin</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/admin"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/qsos"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                QSOs
              </Link>
              <Link
                href="/admin/tokens"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Tokens
              </Link>
              <Link
                href="/admin/logs"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Logs
              </Link>
              <Link
                href="/admin/batch"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Batch Operations
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {userEmail && (
              <span className="text-sm text-gray-600 mr-4">{userEmail}</span>
            )}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 尝试获取用户信息（用于显示邮箱），但不强制要求
  let userEmail: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email || null;
  } catch {
    // 如果服务端无法获取用户，由客户端组件处理
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        <AdminNav userEmail={userEmail} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
