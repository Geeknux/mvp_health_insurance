'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface RegistrationDetail {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_national_id: string;
  plan_id: string;
  plan_name: string;
  plan_type: string;
  monthly_premium: number;
  school_id: string;
  school_name: string;
  school_code: string;
  status: string;
  registration_date: string;
  start_date: string | null;
  end_date: string | null;
}

export default function RegistrationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const registrationId = params?.id as string;
  
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
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
          return;
        }
        fetchRegistrationDetail();
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchRegistrationDetail = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations/${registrationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRegistration(data);
        if (data.start_date) setStartDate(data.start_date.split('T')[0]);
        if (data.end_date) setEndDate(data.end_date.split('T')[0]);
      } else {
        setMessage({ type: 'error', text: 'خطا در دریافت اطلاعات ثبت‌نام' });
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت اطلاعات ثبت‌نام' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!registration) return;

    setUpdating(true);
    setMessage(null);

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/registrations/${registrationId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            start_date: startDate || null,
            end_date: endDate || null,
          }),
        }
      );

      if (response.ok) {
        setMessage({ type: 'success', text: 'وضعیت ثبت‌نام با موفقیت به‌روزرسانی شد' });
        fetchRegistrationDetail();
        setTimeout(() => {
          router.push('/admin/registrations');
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'خطا در به‌روزرسانی وضعیت' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'خطا در به‌روزرسانی وضعیت' });
    } finally {
      setUpdating(false);
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

  const getPlanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      basic: 'پایه',
      standard: 'استاندارد',
      premium: 'ویژه',
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

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ثبت‌نام یافت نشد
            </h3>
            <Link
              href="/admin/registrations"
              className="inline-block mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
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
              مشاهده و مدیریت اطلاعات ثبت‌نام کاربر
            </p>
          </div>
          <Link
            href="/admin/registrations"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            بازگشت
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">وضعیت ثبت‌نام</h2>
            <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border-2 ${getStatusColor(registration.status)}`}>
              {getStatusLabel(registration.status)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span>تاریخ ثبت‌نام: </span>
            <span className="font-medium text-gray-900">
              {new Date(registration.registration_date).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات کاربر</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">نام و نام خانوادگی</label>
              <p className="text-gray-900 font-medium">{registration.user_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">کد ملی</label>
              <p className="text-gray-900 font-medium">{registration.user_national_id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">ایمیل</label>
              <p className="text-gray-900 font-medium">{registration.user_email}</p>
            </div>
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات طرح بیمه</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">نام طرح</label>
              <p className="text-gray-900 font-medium">{registration.plan_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">نوع طرح</label>
              <p className="text-gray-900 font-medium">{getPlanTypeLabel(registration.plan_type)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">حق بیمه ماهانه</label>
              <p className="text-gray-900 font-medium">
                {registration.monthly_premium.toLocaleString('fa-IR')} ریال
              </p>
            </div>
          </div>
        </div>

        {/* School Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات مدرسه</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">نام مدرسه</label>
              <p className="text-gray-900 font-medium">{registration.school_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">کد مدرسه</label>
              <p className="text-gray-900 font-medium">{registration.school_code}</p>
            </div>
          </div>
        </div>

        {/* Date Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">مدیریت تاریخ‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ شروع
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ پایان
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">تغییر وضعیت</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => updateStatus('approved')}
              disabled={updating || registration.status === 'approved'}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              تایید
            </button>
            
            <button
              onClick={() => updateStatus('active')}
              disabled={updating || registration.status === 'active'}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              فعال‌سازی
            </button>
            
            <button
              onClick={() => updateStatus('rejected')}
              disabled={updating || registration.status === 'rejected'}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              رد
            </button>
            
            <button
              onClick={() => updateStatus('cancelled')}
              disabled={updating || registration.status === 'cancelled'}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              لغو
            </button>
            
            <button
              onClick={() => updateStatus('pending')}
              disabled={updating || registration.status === 'pending'}
              className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              در انتظار
            </button>
            
            <button
              onClick={() => updateStatus('expired')}
              disabled={updating || registration.status === 'expired'}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              منقضی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
