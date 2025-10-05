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
  district_id: string;
}

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

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

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

  const fetchSchools = async (districtId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/schools?district_id=${districtId}`);
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      elementary: 'ابتدایی',
      middle: 'متوسطه اول',
      high: 'متوسطه دوم',
      combined: 'ترکیبی',
    };
    return types[type] || type;
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setSelectedCounty('');
    setSelectedRegion('');
    setSelectedDistrict('');
    setCities([]);
    setCounties([]);
    setRegions([]);
    setDistricts([]);
    setSchools([]);
    if (stateId) fetchCities(stateId);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedCounty('');
    setSelectedRegion('');
    setSelectedDistrict('');
    setCounties([]);
    setRegions([]);
    setDistricts([]);
    setSchools([]);
    if (cityId) fetchCounties(cityId);
  };

  const handleCountyChange = (countyId: string) => {
    setSelectedCounty(countyId);
    setSelectedRegion('');
    setSelectedDistrict('');
    setRegions([]);
    setDistricts([]);
    setSchools([]);
    if (countyId) fetchRegions(countyId);
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedDistrict('');
    setDistricts([]);
    setSchools([]);
    if (regionId) fetchDistricts(regionId);
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSchools([]);
    if (districtId) fetchSchools(districtId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              لیست مدارس
            </h1>
            <p className="text-gray-600">
              مشاهده اطلاعات مدارس ثبت شده در سامانه
            </p>
          </div>
          <Link
            href="/admin/schools/add"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            افزودن مدرسه جدید
          </Link>
        </div>

        {/* Location Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            انتخاب موقعیت مکانی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                استان
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            {selectedState && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شهر
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name_fa}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* County */}
            {selectedCity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شهرستان
                </label>
                <select
                  value={selectedCounty}
                  onChange={(e) => handleCountyChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">انتخاب شهرستان</option>
                  {counties.map((county) => (
                    <option key={county.id} value={county.id}>
                      {county.name_fa}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Region */}
            {selectedCounty && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  منطقه
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">انتخاب منطقه</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name_fa}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* District */}
            {selectedRegion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ناحیه
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">انتخاب ناحیه</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name_fa}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Schools List */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری مدارس...</p>
          </div>
        )}

        {!loading && schools.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                مدارس یافت شده ({schools.length} مدرسه)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نام مدرسه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      کد مدرسه
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      آدرس
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تلفن
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {school.name_fa}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{school.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getSchoolTypeLabel(school.school_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {school.address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600" dir="ltr">
                          {school.phone || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && selectedDistrict && schools.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-gray-500">هیچ مدرسه‌ای در این ناحیه یافت نشد</p>
          </div>
        )}

        {!loading && !selectedDistrict && schools.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500">
              لطفاً موقعیت مکانی را انتخاب کنید تا لیست مدارس نمایش داده شود
            </p>
          </div>
        )}

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