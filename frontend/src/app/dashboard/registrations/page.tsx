'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Registration {
  id: string;
  user_id: string;
  plan_id: string;
  school_id: string;
  status: string;
  registration_date: string;
  start_date: string | null;
  end_date: string | null;
}

export default function RegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/insurance/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: 'در انتظار بررسی',
      approved: 'تایید شده',
      rejected: 'رد شده',
      active: 'فعال',
      expired: 'منقضی شده',
      cancelled: 'لغو شده',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ثبت‌نام‌های بیمه من
            </h1>
            <p className="text-gray-600">
              مشاهده وضعیت ثبت‌نام‌های بیمه تکمیلی
            </p>
          </div>
          <Link
            href="/dashboard/insurance/plans"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            مشاهده طرح‌های بیمه
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              هیچ ثبت‌نامی یافت نشد
            </h3>
            <p className="text-gray-600 mb-6">
              شما هنوز برای هیچ طرح بیمه‌ای ثبت‌نام نکرده‌اید
            </p>
            <Link
              href="/dashboard/insurance/plans"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              مشاهده طرح‌های بیمه
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 space-x-reverse mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        ثبت‌نام بیمه
                      </h3>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                        {getStatusLabel(registration.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">تاریخ ثبت‌نام:</span>
                        <span className="text-gray-900 font-medium mr-2">
                          {new Date(registration.registration_date).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      {registration.start_date && (
                        <div>
                          <span className="text-gray-600">تاریخ شروع:</span>
                          <span className="text-gray-900 font-medium mr-2">
                            {new Date(registration.start_date).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      )}
                      {registration.end_date && (
                        <div>
                          <span className="text-gray-600">تاریخ پایان:</span>
                          <span className="text-gray-900 font-medium mr-2">
                            {new Date(registration.end_date).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/registrations/${registration.id}`}
                      className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center"
                    >
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      جزئیات
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
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