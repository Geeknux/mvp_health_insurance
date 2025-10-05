'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function RegistrationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const registrationId = params?.id as string;
  
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrationDetail();
  }, []);

  const fetchRegistrationDetail = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/insurance/registrations/${registrationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRegistration(data);
      } else {
        router.push('/dashboard/registrations');
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
      router.push('/dashboard/registrations');
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-blue-100 text-blue-800 border-blue-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      active: 'bg-green-100 text-green-800 border-green-300',
      expired: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pending: 'ثبت‌نام شما در حال بررسی توسط مدیر سیستم است. لطفاً منتظر بمانید.',
      approved: 'ثبت‌نام شما تایید شده است. منتظر فعال‌سازی بیمه باشید.',
      rejected: 'متأسفانه ثبت‌نام شما رد شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',
      active: 'بیمه شما فعال است و می‌توانید از خدمات بیمه‌ای استفاده کنید.',
      expired: 'بیمه شما منقضی شده است. برای تمدید با پشتیبانی تماس بگیرید.',
      cancelled: 'ثبت‌نام شما لغو شده است.',
    };
    return descriptions[status] || 'وضعیت نامشخص';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ثبت‌نام یافت نشد
            </h3>
            <p className="text-gray-600 mb-6">
              اطلاعات ثبت‌نام درخواستی یافت نشد
            </p>
            <Link
              href="/dashboard/registrations"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              بازگشت به لیست ثبت‌نام‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              جزئیات ثبت‌نام
            </h1>
            <p className="text-gray-600">
              اطلاعات کامل ثبت‌نام بیمه تکمیلی
            </p>
          </div>
          <Link
            href="/dashboard/registrations"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            بازگشت
          </Link>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">وضعیت ثبت‌نام</h2>
              <p className="text-gray-600 text-sm">
                {getStatusDescription(registration.status)}
              </p>
            </div>
            <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border-2 ${getStatusColor(registration.status)}`}>
              {getStatusLabel(registration.status)}
            </span>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">مراحل ثبت‌نام</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                registration.status === 'pending' || registration.status === 'approved' || registration.status === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-4">
                <h3 className="text-sm font-medium text-gray-900">ثبت‌نام انجام شد</h3>
                <p className="text-sm text-gray-600">درخواست شما با موفقیت ثبت شد</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                registration.status === 'approved' || registration.status === 'active'
                  ? 'bg-green-500 text-white'
                  : registration.status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {registration.status === 'approved' || registration.status === 'active' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs">2</span>
                )}
              </div>
              <div className="mr-4">
                <h3 className="text-sm font-medium text-gray-900">بررسی و تایید</h3>
                <p className="text-sm text-gray-600">
                  {registration.status === 'pending' ? 'در حال بررسی توسط مدیر' : 
                   registration.status === 'approved' || registration.status === 'active' ? 'تایید شده' : 
                   'در انتظار بررسی'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                registration.status === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {registration.status === 'active' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs">3</span>
                )}
              </div>
              <div className="mr-4">
                <h3 className="text-sm font-medium text-gray-900">فعال‌سازی بیمه</h3>
                <p className="text-sm text-gray-600">
                  {registration.status === 'active' ? 'بیمه شما فعال است' : 'منتظر فعال‌سازی'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">نیاز به راهنمایی دارید؟</h3>
              <p className="text-sm text-blue-700">
                در صورت داشتن سوال یا نیاز به اطلاعات بیشتر، می‌توانید با واحد پشتیبانی تماس بگیرید.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/dashboard/registrations"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            بازگشت به لیست
          </Link>
          <Link
            href="/dashboard/insurance/plans"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            مشاهده طرح‌های دیگر
          </Link>
        </div>
      </div>
    </div>
  );
}
