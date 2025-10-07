'use client';

import { useEffect, useState } from 'react';

interface RegistrationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  expired: number;
  by_plan: Array<{ plan_name: string; count: number }>;
  by_month: Array<{ month_name: string; count: number }>;
}

interface PersonStats {
  total: number;
  by_relation: { [key: string]: number };
  age_distribution: { [key: string]: number };
}

interface PlanStats {
  total: number;
  popularity: Array<{ plan_name: string; registration_count: number; monthly_premium: number }>;
}

export default function AdminCharts() {
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats | null>(null);
  const [personStats, setPersonStats] = useState<PersonStats | null>(null);
  const [planStats, setPlanStats] = useState<PlanStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const token = localStorage.getItem('access_token');
    
    try {
      const [regRes, personRes, planRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/statistics/admin/registrations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/statistics/admin/persons`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/statistics/admin/plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (regRes.ok) setRegistrationStats(await regRes.json());
      if (personRes.ok) setPersonStats(await personRes.json());
      if (planRes.ok) setPlanStats(await planRes.json());
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری آمار...</p>
        </div>
      </div>
    );
  }

  const getMaxValue = (data: number[]) => Math.max(...data, 1);

  return (
    <div className="mt-8 space-y-6">
      {/* Registration Status Chart */}
      {registrationStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">وضعیت ثبت‌نام‌ها</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">در انتظار تایید</span>
                <span className="text-sm font-bold text-gray-900">{registrationStats.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(registrationStats.pending / registrationStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">تایید شده</span>
                <span className="text-sm font-bold text-gray-900">{registrationStats.approved}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(registrationStats.approved / registrationStats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">فعال</span>
                <span className="text-sm font-bold text-gray-900">{registrationStats.active}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(registrationStats.active / registrationStats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">رد شده</span>
                <span className="text-sm font-bold text-gray-900">{registrationStats.rejected}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(registrationStats.rejected / registrationStats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">منقضی شده</span>
                <span className="text-sm font-bold text-gray-900">{registrationStats.expired}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(registrationStats.expired / registrationStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend Chart */}
      {registrationStats && registrationStats.by_month.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">روند ثبت‌نام‌ها (6 ماه اخیر)</h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {registrationStats.by_month.map((item, index) => {
              const maxCount = getMaxValue(registrationStats.by_month.map(m => m.count));
              const heightPercent = (item.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center h-48">
                    <div 
                      className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600 relative group"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} ثبت‌نام
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    {item.month_name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Popularity Chart */}
        {planStats && planStats.popularity.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">محبوبیت طرح‌ها</h3>
            <div className="space-y-4">
              {planStats.popularity.map((plan, index) => {
                const maxCount = getMaxValue(planStats.popularity.map(p => p.registration_count));
                const widthPercent = (plan.registration_count / maxCount) * 100;
                
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{plan.plan_name}</span>
                      <span className="text-sm font-bold text-gray-900">{plan.registration_count} ثبت‌نام</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-primary-500' : 
                          index === 1 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {plan.monthly_premium.toLocaleString('fa-IR')} تومان/ماه
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Person Relations Chart */}
        {personStats && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">توزیع افراد تحت پوشش</h3>
            <div className="space-y-4">
              {Object.entries(personStats.by_relation).map(([relation, count], index) => {
                const relationLabels: { [key: string]: string } = {
                  spouse: 'همسر',
                  child: 'فرزند',
                  parent: 'والدین',
                  sibling: 'خواهر/برادر',
                  other: 'سایر'
                };
                
                const colors = [
                  'bg-pink-500',
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-gray-500'
                ];
                
                const widthPercent = (count / personStats.total) * 100;
                
                return (
                  <div key={relation}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{relationLabels[relation]}</span>
                      <span className="text-sm font-bold text-gray-900">{count} نفر</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Age Distribution Chart */}
      {personStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">توزیع سنی افراد</h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {Object.entries(personStats.age_distribution).map(([ageGroup, count], index) => {
              const maxCount = getMaxValue(Object.values(personStats.age_distribution));
              const heightPercent = (count / maxCount) * 100;
              
              return (
                <div key={ageGroup} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center h-32">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 relative group"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {count} نفر
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    {ageGroup} سال
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
