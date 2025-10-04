'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InsuranceRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');

  const [formData, setFormData] = useState({
    planId: planId || '',
    stateId: '',
    cityId: '',
    countyId: '',
    regionId: '',
    districtId: '',
    schoolId: '',
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [counties, setCounties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/states`);
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/cities?state_id=${stateId}`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCounties = async (cityId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/counties?city_id=${cityId}`);
      const data = await response.json();
      setCounties(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRegions = async (countyId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/regions?county_id=${countyId}`);
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDistricts = async (regionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/districts?region_id=${regionId}`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSchools = async (districtId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/schools?district_id=${districtId}`);
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/insurance/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ثبت‌نام بیمه تکمیلی
            </h1>
            <p className="text-gray-600">
              لطفاً اطلاعات مدرسه خود را وارد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                استان <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stateId}
                onChange={(e) => {
                  setFormData({ ...formData, stateId: e.target.value, cityId: '', countyId: '', regionId: '', districtId: '', schoolId: '' });
                  setCities([]);
                  setCounties([]);
                  setRegions([]);
                  setDistricts([]);
                  setSchools([]);
                  if (e.target.value) fetchCities(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  شهر <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => {
                    setFormData({ ...formData, cityId: e.target.value, countyId: '', regionId: '', districtId: '', schoolId: '' });
                    setCounties([]);
                    setRegions([]);
                    setDistricts([]);
                    setSchools([]);
                    if (e.target.value) fetchCounties(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  شهرستان <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.countyId}
                  onChange={(e) => {
                    setFormData({ ...formData, countyId: e.target.value, regionId: '', districtId: '', schoolId: '' });
                    setRegions([]);
                    setDistricts([]);
                    setSchools([]);
                    if (e.target.value) fetchRegions(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  منطقه <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.regionId}
                  onChange={(e) => {
                    setFormData({ ...formData, regionId: e.target.value, districtId: '', schoolId: '' });
                    setDistricts([]);
                    setSchools([]);
                    if (e.target.value) fetchDistricts(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  ناحیه <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.districtId}
                  onChange={(e) => {
                    setFormData({ ...formData, districtId: e.target.value, schoolId: '' });
                    setSchools([]);
                    if (e.target.value) fetchSchools(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  مدرسه <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">انتخاب مدرسه</option>
                  {schools.map((school: any) => (
                    <option key={school.id} value={school.id}>{school.name_fa}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading || !formData.schoolId}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
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