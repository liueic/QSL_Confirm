'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewQSOPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myCallsign = process.env.NEXT_PUBLIC_MY_CALLSIGN || '';

  const [formData, setFormData] = useState({
    callsign_worked: '',
    mailing_address: '',
    postal_code: '',
    mailed_at: new Date().toISOString().slice(0, 16),
    mailing_location: '',
    mailing_method: 'Direct',
  });

  const mailingMethods = ['Direct', 'Bureau', 'Manager'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qso/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callsign_worked: formData.callsign_worked,
          my_callsign: myCallsign,
          mailing_address: formData.mailing_address,
          postal_code: formData.postal_code,
          mailed_at: formData.mailed_at,
          mailing_location: formData.mailing_location,
          mailing_method: formData.mailing_method,
          datetime: formData.mailed_at,
          band: '20m',
          mode: 'SSB',
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/qsos');
      } else {
        setError(data.error || 'Failed to create QSO');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link
          href="/admin/qsos"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回 QSO 列表
        </Link>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">添加实体 QSL 卡</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="callsign_worked" className="block text-sm font-medium text-gray-300 mb-2">
                对方呼号 *
              </label>
              <input
                type="text"
                id="callsign_worked"
                name="callsign_worked"
                value={formData.callsign_worked}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase font-mono"
                placeholder="例如: BG0AAA"
                required
              />
              <p className="mt-1 text-xs text-gray-500">收卡方的业余无线电呼号</p>
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-300 mb-2">
                邮政编码 *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="例如: 100000"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="mailing_address" className="block text-sm font-medium text-gray-300 mb-2">
              邮寄地址 *
            </label>
            <textarea
              id="mailing_address"
              name="mailing_address"
              value={formData.mailing_address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="例如: 北京市朝阳区xxx路xxx号"
              required
            />
            <p className="mt-1 text-xs text-gray-500">QSL卡片的邮寄目的地址</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mailed_at" className="block text-sm font-medium text-gray-300 mb-2">
                邮寄时间 *
              </label>
              <input
                type="datetime-local"
                id="mailed_at"
                name="mailed_at"
                value={formData.mailed_at}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="mailing_method" className="block text-sm font-medium text-gray-300 mb-2">
                邮寄方式 *
              </label>
              <select
                id="mailing_method"
                name="mailing_method"
                value={formData.mailing_method}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                {mailingMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Direct: 直邮 | Bureau: 卡片局 | Manager: 通过Manager
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="mailing_location" className="block text-sm font-medium text-gray-300 mb-2">
              邮寄地点
            </label>
            <input
              type="text"
              id="mailing_location"
              name="mailing_location"
              value={formData.mailing_location}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="例如: 北京邮局"
            />
            <p className="mt-1 text-xs text-gray-500">从哪里寄出的QSL卡片</p>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/qsos"
                className="px-6 py-3 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700/50 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? '创建中...' : '创建 QSO'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
