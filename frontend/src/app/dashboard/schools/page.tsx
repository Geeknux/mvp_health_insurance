'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface School {
  id: string;
  name_fa: string;
  code: string;
  school_type: string;
  address: string | null;
  phone: string | null;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const getSchoolTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      elementary: 'ابتدایی',
      middle: 'متوسطه اول',
      high: 'متوسطه دوم',
      combined: 'ترکیبی',
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
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            لیست مدارس
          </h1>
          <p className="text-gray-600">
            مشاهده اطلاعات مدارس ثبت شده در سامانه
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-700">
            برای مشاهده لیست مدارس، لطفاً از فرم ثبت‌نام بیمه استفاده کنید و پس از انتخاب ناحیه، لیست مدارس نمایش داده می‌شود.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard/insurance/register"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              رفتن به فرم ثبت‌نام
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              اطلاعات کلی
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">تعداد کل مدارس</p>
                <p className="text-2xl font-bold text-blue-600">33+</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">مدارس ابتدایی</p>
                <p className="text-2xl font-bold text-green-600">12+</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">مدارس متوسطه</p>
                <p className="text-2xl font-bold text-purple-600">21+</p>
              </div>
            </div>
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