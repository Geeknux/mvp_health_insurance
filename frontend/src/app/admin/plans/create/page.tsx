'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        alert('طرح بیمه با موفقیت ایجاد شد');
        router.push('/admin/plans');
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
                required
              />
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