'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface State {
  id: string;
  name_fa: string;
  code: string;
}

interface City {
  id: string;
  name_fa: string;
  code: string;
  state_id: string;
}

interface County {
  id: string;
  name_fa: string;
  code: string;
  city_id: string;
}

interface Region {
  id: string;
  name_fa: string;
  code: string;
  county_id: string;
}

interface District {
  id: string;
  name_fa: string;
  code: string;
  region_id: string;
}

export default function AddSchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name_fa: '',
    code: '',
    school_type: 'elementary',
    address: '',
    phone: '',
    stateId: '',
    cityId: '',
    countyId: '',
    regionId: '',
    districtId: '',
  });

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    checkAuth();
    fetchStates();
  }, []);

  const checkAuth = async () => {
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
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/cities?state_id=${stateId}`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCounties = async (cityId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/counties?city_id=${cityId}`);
      const data = await response.json();
      setCounties(data);
    } catch (error) {
      console.error('Error fetching counties:', error);
    }
  };

  const fetchRegions = async (countyId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/regions?county_id=${countyId}`);
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchDistricts = async (regionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/districts?region_id=${regionId}`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/schools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          district_id: formData.districtId,
          name_fa: formData.name_fa,
          code: formData.code,
          school_type: formData.school_type,
          address: formData.address || null,
          phone: formData.phone || null,
        }),
      });

      if (response.ok) {
        setSuccess('مدرسه با موفقیت ثبت شد');
        setTimeout(() => {
          router.push('/dashboard/schools');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'خطا در ثبت مدرسه');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (stateId: string) => {
    setFormData({
      ...formData,
      stateId,
      cityId: '',
      countyId: '',
      regionId: '',
      districtId: '',
    });
    setCities([]);
    setCounties([]);
    setRegions([]);
    setDistricts([]);
    if (stateId) fetchCities(stateId);
  };

  const handleCityChange = (cityId: string) => {
    setFormData({
      ...formData,
      cityId,
      countyId: '',
      regionId: '',
      districtId: '',
    });
    setCounties([]);
    setRegions([]);
    setDistricts([]);
    if (cityId) fetchCounties(cityId);
  };

  const handleCountyChange = (countyId: string) => {
    setFormData({
      ...formData,
      countyId,
      regionId: '',
      districtId: '',
    });
    setRegions([]);
    setDistricts([]);
    if (countyId) fetchRegions(countyId);
  };

  const handleRegionChange = (regionId: string) => {
    setFormData({
      ...formData,
      regionId,
      districtId: '',
    });
    setDistricts([]);
    if (regionId) fetchDistricts(regionId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/dashboard/schools"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            بازگشت به لیست مدارس
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              افزودن مدرسه جدید
            </h1>
            <p className="text-gray-600">
              لطفاً اطلاعات مدرسه را وارد کنید
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Selection */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">موقعیت مکانی</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    استان <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.stateId}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">انتخاب استان</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name_fa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                {formData.stateId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شهر <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      disabled={cities.length === 0}
                    >
                      <option value="">{cities.length === 0 ? 'شهری یافت نشد' : 'انتخاب شهر'}</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name_fa}
                        </option>
                      ))}
                    </select>
                    {cities.length === 0 && (
                      <p className="mt-1 text-sm text-amber-600">هیچ شهری برای این استان ثبت نشده است</p>
                    )}
                  </div>
                )}

                {/* County */}
                {formData.cityId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شهرستان <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.countyId}
                      onChange={(e) => handleCountyChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      disabled={counties.length === 0}
                    >
                      <option value="">{counties.length === 0 ? 'شهرستانی یافت نشد' : 'انتخاب شهرستان'}</option>
                      {counties.map((county) => (
                        <option key={county.id} value={county.id}>
                          {county.name_fa}
                        </option>
                      ))}
                    </select>
                    {counties.length === 0 && (
                      <p className="mt-1 text-sm text-amber-600">هیچ شهرستانی برای این شهر ثبت نشده است</p>
                    )}
                  </div>
                )}

                {/* Region */}
                {formData.countyId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      منطقه <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.regionId}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      disabled={regions.length === 0}
                    >
                      <option value="">{regions.length === 0 ? 'منطقه‌ای یافت نشد' : 'انتخاب منطقه'}</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name_fa}
                        </option>
                      ))}
                    </select>
                    {regions.length === 0 && (
                      <p className="mt-1 text-sm text-amber-600">هیچ منطقه‌ای برای این شهرستان ثبت نشده است</p>
                    )}
                  </div>
                )}

                {/* District */}
                {formData.regionId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ناحیه <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.districtId}
                      onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      disabled={districts.length === 0}
                    >
                      <option value="">{districts.length === 0 ? 'ناحیه‌ای یافت نشد' : 'انتخاب ناحیه'}</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name_fa}
                        </option>
                      ))}
                    </select>
                    {districts.length === 0 && (
                      <p className="mt-1 text-sm text-amber-600">هیچ ناحیه‌ای برای این منطقه ثبت نشده است</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* School Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">اطلاعات مدرسه</h2>

              {/* School Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام مدرسه <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_fa}
                  onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="مثال: دبستان شهید بهشتی"
                  required
                  minLength={2}
                  maxLength={200}
                />
              </div>

              {/* School Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد مدرسه <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="مثال: SCH001"
                  required
                  maxLength={20}
                />
              </div>

              {/* School Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع مدرسه <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.school_type}
                  onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="elementary">ابتدایی</option>
                  <option value="middle">متوسطه اول</option>
                  <option value="high">متوسطه دوم</option>
                  <option value="combined">ترکیبی</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  آدرس
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="آدرس کامل مدرسه"
                  rows={3}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تلفن تماس
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="02112345678"
                  maxLength={11}
                  pattern="[0-9]{11}"
                />
                <p className="mt-1 text-sm text-gray-500">
                  شماره تلفن باید 11 رقم باشد (با کد شهر)
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t">
              <Link
                href="/dashboard/schools"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                انصراف
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.districtId}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'در حال ثبت...' : 'ثبت مدرسه'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
