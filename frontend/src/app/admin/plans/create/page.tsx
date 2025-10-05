'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePlanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name_fa: '',
    plan_type: 'basic',
    description_fa: '',
    monthly_premium: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (!userData.is_admin) {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (parseFloat(formData.monthly_premium) <= 0) {
      setError('حق بیمه ماهانه باید بیشتر از صفر باشد');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          monthly_premium: parseFloat(formData.monthly_premium),
        }),
      });

      if (response.ok) {
        setSuccess('طرح بیمه با موفقیت ایجاد شد');
        setTimeout(() => {
          router.push('/admin/plans');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'خطا در ایجاد طرح بیمه');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/admin/plans"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            بازگشت به لیست طرح‌ها
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ایجاد طرح بیمه جدید
            </h1>
            <p className="text-gray-600">
              اطلاعات طرح بیمه را وارد کنید
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام طرح <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name_fa}
                onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="مثال: بیمه پایه"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع طرح <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plan_type}
                onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="basic">پایه</option>
                <option value="standard">استاندارد</option>
                <option value="premium">ویژه</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description_fa}
                onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="توضیحات کامل درباره طرح بیمه"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حق بیمه ماهانه (ریال) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.monthly_premium}
                onChange={(e) => setFormData({ ...formData, monthly_premium: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="500000"
                min="0"
                step="1000"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                مثال: 500000 ریال (پانصد هزار تومان)
              </p>
            </div>

            <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'در حال ایجاد...' : 'ایجاد طرح بیمه'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}