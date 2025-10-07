'use client';

import { useEffect, useState } from 'react';

// Helper function to convert Gregorian month to Jalali
const getJalaliMonthName = (gregorianDate: string) => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  const [year, month] = gregorianDate.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  
  // Simple Gregorian to Jalali conversion (approximate)
  // For accurate conversion, you'd use a library like moment-jalaali
  const jalaliYear = year - 621;
  let jalaliMonth = month - 3;
  
  if (jalaliMonth <= 0) {
    jalaliMonth += 12;
  }
  
  return `${months[jalaliMonth - 1]} ${jalaliYear}`;
};

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
                    {getJalaliMonthName(item.month)}
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

      {/* Age Distribution Chart - Pie Chart */}
      {personStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">توزیع سنی افراد</h3>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Pie Chart */}
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {(() => {
                  const total = Object.values(personStats.age_distribution).reduce((sum: number, val) => sum + (val as number), 0);
                  let currentAngle = 0;
                  const colors = [
                    '#6366F1', // Indigo
                    '#8B5CF6', // Purple
                    '#EC4899', // Pink
                    '#F59E0B', // Amber
                    '#10B981', // Green
                    '#3B82F6'  // Blue
                  ];
                  
                  return Object.entries(personStats.age_distribution).map(([ageGroup, count], index) => {
                    const percentage = (count as number) / total;
                    const angle = percentage * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    
                    // Calculate path for pie slice
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + 90 * Math.cos(startRad);
                    const y1 = 100 + 90 * Math.sin(startRad);
                    const x2 = 100 + 90 * Math.cos(endRad);
                    const y2 = 100 + 90 * Math.sin(endRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M 100 100`,
                      `L ${x1} ${y1}`,
                      `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');
                    
                    currentAngle = endAngle;
                    
                    return (
                      <g key={ageGroup}>
                        <path
                          d={pathData}
                          fill={colors[index % colors.length]}
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ transformOrigin: 'center' }}
                        />
                      </g>
                    );
                  });
                })()}
              </svg>
              {/* Center circle for donut effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{personStats.total}</div>
                    <div className="text-xs text-gray-600">نفر</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex-1 space-y-3">
              {(() => {
                const total = Object.values(personStats.age_distribution).reduce((sum: number, val) => sum + (val as number), 0);
                const colors = [
                  '#6366F1', // Indigo
                  '#8B5CF6', // Purple
                  '#EC4899', // Pink
                  '#F59E0B', // Amber
                  '#10B981', // Green
                  '#3B82F6'  // Blue
                ];
                
                return Object.entries(personStats.age_distribution).map(([ageGroup, count], index) => {
                  const percentage = ((count as number) / total * 100).toFixed(1);
                  
                  return (
                    <div key={ageGroup} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{ageGroup} سال</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{count} نفر</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
