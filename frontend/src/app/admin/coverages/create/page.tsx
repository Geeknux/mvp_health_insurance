'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCoveragePage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    plan_id: '',
    coverage_type: 'outpatient',
    title_fa: '',
    description_fa: '',
    coverage_amount: '',
    coverage_percentage: '',
    max_usage_count: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/coverages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: formData.plan_id,
          coverage_type: formData.coverage_type,
          title_fa: formData.title_fa,
          description_fa: formData.description_fa,
          coverage_amount: parseFloat(formData.coverage_amount),
          coverage_percentage: parseInt(formData.coverage_percentage),
          max_usage_count: formData.max_usage_count ? parseInt(formData.max_usage_count) : null,
        }),
      });

      if (response.ok) {
        alert('پوشش بیمه با موفقیت ایجاد شد');
        router.push('/admin/coverages');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'خطا در ایجاد پوشش بیمه');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const coverageTypes = [
    { value: 'outpatient', label: 'درمان سرپایی' },
    { value: 'hospitalization', label: 'بستری' },
    { value: 'medication', label: 'دارو' },
    { value: 'laboratory', label: 'آزمایش' },
    { value: 'imaging', label: 'تصویربرداری' },
    { value: 'dental', label: 'دندانپزشکی' },
    { value: 'ophthalmology', label: 'چشم‌پزشکی' },
    { value: 'physiotherapy', label: 'فیزیوتراپی' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ایجاد پوشش بیمه جدید
            </h1>
            <p className="text-gray-600">
              اطلاعات پوشش بیمه را وارد کنید
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
                طرح بیمه <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">انتخاب طرح بیمه</option>
                {plans.map((plan: any) => (
                  <option key={plan.id} value={plan.id}>{plan.name_fa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع پوشش <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.coverage_type}
                onChange={(e) => setFormData({ ...formData, coverage_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {coverageTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title_fa}
                onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="مثال: درمان سرپایی"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description_fa}
                onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="توضیحات کامل درباره پوشش"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سقف پوشش (ریال) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.coverage_amount}
                  onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="5000000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درصد پوشش <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.coverage_percentage}
                  onChange={(e) => setFormData({ ...formData, coverage_percentage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="70"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعداد استفاده مجاز (اختیاری)
              </label>
              <input
                type="number"
                value={formData.max_usage_count}
                onChange={(e) => setFormData({ ...formData, max_usage_count: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="خالی = نامحدود"
                min="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                اگر خالی باشد، تعداد استفاده نامحدود خواهد بود
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
                {loading ? 'در حال ایجاد...' : 'ایجاد پوشش بیمه'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}