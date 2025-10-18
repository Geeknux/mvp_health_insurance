'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Coverage {
  id: string;
  plan_id: string;
  coverage_type: string;
  title_fa: string;
  description_fa: string;
  coverage_amount: number;
  coverage_percentage: number;
  max_usage_count: number | null;
  is_active: boolean;
}

export default function AdminCoveragesPage() {
  const router = useRouter();
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoverages();
  }, []);

  const fetchCoverages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/coverages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCoverages(data);
      } else if (response.status === 403) {
        alert('شما دسترسی مدیریتی ندارید');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching coverages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  const getCoverageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      outpatient: 'درمان سرپایی',
      hospitalization: 'بستری',
      medication: 'دارو',
      laboratory: 'آزمایش',
      imaging: 'تصویربرداری',
      dental: 'دندانپزشکی',
      ophthalmology: 'چشم‌پزشکی',
      physiotherapy: 'فیزیوتراپی',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              مدیریت پوشش‌های بیمه
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              مشاهده و مدیریت تمام پوشش‌های بیمه
            </p>
          </div>
          <Link
            href="/admin/coverages/create"
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors text-sm sm:text-base text-center whitespace-nowrap"
          >
            + ایجاد پوشش جدید
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع پوشش
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سقف پوشش
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  درصد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تعداد مجاز
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coverages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    هیچ پوشش بیمه‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                coverages.map((coverage) => (
                  <tr key={coverage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{coverage.title_fa}</div>
                      <div className="text-sm text-gray-500">{coverage.description_fa.substring(0, 40)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {getCoverageTypeLabel(coverage.coverage_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(coverage.coverage_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coverage.coverage_percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coverage.max_usage_count || 'نامحدود'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        coverage.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coverage.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 ml-4">
                        ویرایش
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </div>
  );
}