'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Coverage {
  id: string;
  coverage_type: string;
  title_fa: string;
  description_fa: string;
  coverage_amount: number;
  coverage_percentage: number;
  max_usage_count: number | null;
}

interface Plan {
  id: string;
  name_fa: string;
  plan_type: string;
  description_fa: string;
  monthly_premium: number;
  coverages: Coverage[];
}

export default function InsurancePlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/insurance/plans`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    checkAdminStatus();
  }, [fetchPlans, checkAdminStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 'border-green-500 bg-green-50';
      case 'standard':
        return 'border-blue-500 bg-blue-50';
      case 'premium':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
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
              طرح‌های بیمه تکمیلی
            </h1>
            <p className="text-gray-600">
              {plans.length > 0 ? 'یکی از طرح‌های بیمه را انتخاب کنید' : 'در حال حاضر طرح بیمه‌ای موجود نیست'}
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/admin/plans/create"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              افزودن طرح جدید
            </Link>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto mb-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              هیچ طرح بیمه‌ای یافت نشد
            </h3>
            <p className="text-gray-600 mb-6">
              در حال حاضر طرح بیمه‌ای برای انتخاب موجود نیست. لطفاً بعداً مراجعه کنید یا با پشتیبانی تماس بگیرید.
            </p>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <button
                onClick={() => fetchPlans()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                تلاش مجدد
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                بازگشت به داشبورد
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${getPlanColor(plan.plan_type)} p-6 hover:shadow-lg transition-all`}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name_fa}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {plan.description_fa}
                    </p>
                    <div className="text-3xl font-bold text-primary-600">
                      {formatCurrency(plan.monthly_premium)}
                      <span className="text-sm text-gray-600 font-normal"> / ماهانه</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="font-bold text-gray-900 text-sm mb-3">پوشش‌های بیمه:</h4>
                    {plan.coverages.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        پوشش بیمه‌ای تعریف نشده است
                      </p>
                    ) : (
                      plan.coverages.map((coverage) => (
                        <div key={coverage.id} className="flex items-start space-x-2 space-x-reverse">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{coverage.title_fa}</p>
                            <p className="text-xs text-gray-600">
                              {coverage.coverage_percentage}% تا سقف {formatCurrency(coverage.coverage_amount)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    href={`/dashboard/insurance/register?plan=${plan.id}`}
                    className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    انتخاب این طرح
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                بازگشت به داشبورد
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}