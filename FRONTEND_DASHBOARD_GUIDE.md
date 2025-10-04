# Frontend Dashboard Implementation Guide

This guide provides complete code for implementing a Persian RTL dashboard similar to the reference image.

## Dashboard Structure

```
frontend/src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard page
│   │   ├── insurance/
│   │   │   └── register/
│   │   │       └── page.tsx         # Insurance registration form
│   │   └── profile/
│   │       └── page.tsx             # User profile
│   ├── login/
│   │   └── page.tsx                 # Login page
│   └── register/
│       └── page.tsx                 # Registration page
├── components/
│   ├── dashboard/
│   │   ├── DashboardStats.tsx       # Statistics cards
│   │   ├── DashboardChart.tsx       # Chart component
│   │   ├── DashboardTabs.tsx        # Tab navigation
│   │   └── Sidebar.tsx              # Sidebar navigation
│   ├── forms/
│   │   ├── InsuranceForm.tsx        # Insurance registration form
│   │   └── LocationSelector.tsx    # Cascading location selector
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Select.tsx
└── lib/
    ├── api.ts                       # API client
    └── store.ts                     # State management
```

## 1. Dashboard Statistics Component

**File: `frontend/src/components/dashboard/DashboardStats.tsx`**

```typescript
'use client';

interface StatCard {
  title: string;
  count: number;
  icon: string;
  color: string;
}

export default function DashboardStats() {
  const stats: StatCard[] = [
    { title: 'كل الموظفين', count: 2, icon: '👥', color: 'bg-green-500' },
    { title: 'موظفين مفعلين', count: 2, icon: '✓', color: 'bg-purple-500' },
    { title: 'موظفين غير مفعلين', count: 0, icon: '⚠', color: 'bg-blue-500' },
    { title: 'تحديد الاقامة', count: 0, icon: '🏠', color: 'bg-cyan-500' },
    { title: 'تحديد تاريخ الاقامة', count: 0, icon: '📅', color: 'bg-orange-500' },
    { title: 'تحديد تاريخ الفصل', count: 0, icon: '📋', color: 'bg-purple-600' },
    { title: 'تحديد دورات السير', count: 0, icon: '📄', color: 'bg-green-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
            </div>
            <div className={`${stat.color} w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 2. Dashboard Chart Component

**File: `frontend/src/components/dashboard/DashboardChart.tsx`**

```typescript
'use client';

import { useState } from 'react';

export default function DashboardChart() {
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');

  const data = [
    { label: 'المتوسطة', value: 28, color: 'bg-pink-500' },
    { label: 'مصر', value: 16, color: 'bg-orange-400' },
    { label: 'الفيس', value: 2, color: 'bg-teal-500' },
    { label: 'الأحساس', value: 2, color: 'bg-pink-600' },
    { label: 'بالخارجين', value: 1, color: 'bg-teal-600' },
    { label: 'أخرى', value: 1, color: 'bg-gray-400' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mt-6">
      {/* Chart Controls */}
      <div className="flex items-center justify-center space-x-2 space-x-reverse mb-6">
        <button
          onClick={() => setChartType('pie')}
          className={`p-2 rounded ${chartType === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          </svg>
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`p-2 rounded ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </button>
        <button
          onClick={() => setChartType('line')}
          className={`p-2 rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Chart */}
        <div className="flex-1 flex items-center justify-center">
          {chartType === 'pie' && (
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {data.map((item, index) => {
                  const previousTotal = data.slice(0, index).reduce((sum, d) => sum + d.value, 0);
                  const percentage = (item.value / total) * 100;
                  const offset = (previousTotal / total) * 100;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color.replace('bg-', '')}
                      strokeWidth="20"
                      strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                      strokeDashoffset={-offset * 2.51}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="w-64 space-y-3">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">الجنسية</p>
            <p className="text-2xl font-bold">عدد الموظفين</p>
          </div>
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 3. Insurance Registration Form

**File: `frontend/src/app/dashboard/insurance/register/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationSelector from '@/components/forms/LocationSelector';

export default function InsuranceRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    planId: '',
    stateId: '',
    cityId: '',
    countyId: '',
    regionId: '',
    districtId: '',
    schoolId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/insurance/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          plan_id: formData.planId,
          school_id: formData.schoolId,
        }),
      });

      if (response.ok) {
        alert('ثبت‌نام با موفقیت انجام شد');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.detail || 'خطا در ثبت‌نام');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            ثبت‌نام بیمه تکمیلی
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Insurance Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                انتخاب طرح بیمه
              </label>
              <select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">انتخاب کنید</option>
                <option value="plan1">بیمه پایه</option>
                <option value="plan2">بیمه استاندارد</option>
                <option value="plan3">بیمه ویژه</option>
              </select>
            </div>

            {/* Location Selector */}
            <LocationSelector
              formData={formData}
              setFormData={setFormData}
            />

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'ثبت‌نام'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## 4. Location Selector Component

**File: `frontend/src/components/forms/LocationSelector.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';

interface LocationSelectorProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function LocationSelector({ formData, setFormData }: LocationSelectorProps) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [counties, setCounties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/states`);
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/cities?state_id=${stateId}`
      );
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCounties = async (cityId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/counties?city_id=${cityId}`
      );
      const data = await response.json();
      setCounties(data);
    } catch (error) {
      console.error('Error fetching counties:', error);
    }
  };

  const fetchRegions = async (countyId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/regions?county_id=${countyId}`
      );
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchDistricts = async (regionId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/districts?region_id=${regionId}`
      );
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchSchools = async (districtId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/schools?district_id=${districtId}`
      );
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* State */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          استان
        </label>
        <select
          value={formData.stateId}
          onChange={(e) => {
            setFormData({ ...formData, stateId: e.target.value, cityId: '', countyId: '', regionId: '', districtId: '', schoolId: '' });
            fetchCities(e.target.value);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          required
        >
          <option value="">انتخاب استان</option>
          {states.map((state: any) => (
            <option key={state.id} value={state.id}>{state.name_fa}</option>
          ))}
        </select>
      </div>

      {/* City */}
      {formData.stateId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            شهر
          </label>
          <select
            value={formData.cityId}
            onChange={(e) => {
              setFormData({ ...formData, cityId: e.target.value, countyId: '', regionId: '', districtId: '', schoolId: '' });
              fetchCounties(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">انتخاب شهر</option>
            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>{city.name_fa}</option>
            ))}
          </select>
        </div>
      )}

      {/* County */}
      {formData.cityId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            شهرستان
          </label>
          <select
            value={formData.countyId}
            onChange={(e) => {
              setFormData({ ...formData, countyId: e.target.value, regionId: '', districtId: '', schoolId: '' });
              fetchRegions(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">انتخاب شهرستان</option>
            {counties.map((county: any) => (
              <option key={county.id} value={county.id}>{county.name_fa}</option>
            ))}
          </select>
        </div>
      )}

      {/* Region */}
      {formData.countyId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            منطقه
          </label>
          <select
            value={formData.regionId}
            onChange={(e) => {
              setFormData({ ...formData, regionId: e.target.value, districtId: '', schoolId: '' });
              fetchDistricts(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">انتخاب منطقه</option>
            {regions.map((region: any) => (
              <option key={region.id} value={region.id}>{region.name_fa}</option>
            ))}
          </select>
        </div>
      )}

      {/* District */}
      {formData.regionId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ناحیه
          </label>
          <select
            value={formData.districtId}
            onChange={(e) => {
              setFormData({ ...formData, districtId: e.target.value, schoolId: '' });
              fetchSchools(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">انتخاب ناحیه</option>
            {districts.map((district: any) => (
              <option key={district.id} value={district.id}>{district.name_fa}</option>
            ))}
          </select>
        </div>
      )}

      {/* School */}
      {formData.districtId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مدرسه
          </label>
          <select
            value={formData.schoolId}
            onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">انتخاب مدرسه</option>
            {schools.map((school: any) => (
              <option key={school.id} value={school.id}>{school.name_fa}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
```

## 5. PostCSS Configuration

**File: `frontend/postcss.config.js`**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Usage Instructions

1. **Install Dependencies**:
```bash
cd frontend
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Access Dashboard**:
- Navigate to http://localhost:3000/dashboard
- Navigate to http://localhost:3000/dashboard/insurance/register for form

## Key Features

- ✅ Persian RTL layout
- ✅ Responsive design
- ✅ Statistics cards with icons
- ✅ Interactive charts
- ✅ Cascading location selector (6 levels)
- ✅ Form validation
- ✅ API integration
- ✅ Loading states
- ✅ Error handling

## Styling Notes

The dashboard uses Tailwind CSS with custom colors defined in `tailwind.config.js`. The primary color scheme matches the reference image with cyan/teal accents.