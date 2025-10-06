'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type LocationType = 'state' | 'city' | 'county' | 'region' | 'district';

interface Location {
  id: string;
  name_fa: string;
  code: string;
  created_at: string;
  state_id?: string;
  city_id?: string;
  county_id?: string;
  region_id?: string;
}

export default function LocationsManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LocationType>('state');
  const [locations, setLocations] = useState<Location[]>([]);
  const [states, setStates] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [counties, setCounties] = useState<Location[]>([]);
  const [regions, setRegions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Location | null>(null);
  const [formData, setFormData] = useState<any>({ name_fa: '', code: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchLocations();
      // Reset form when tab changes
      setFormData({ name_fa: '', code: '' });
      setShowForm(false);
      setEditingItem(null);
      setMessage(null);
    }
  }, [activeTab, loading]);

  const checkAdminAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        if (!userData.is_admin) {
          router.push('/dashboard');
          return;
        }
        await fetchAllParents();
        setLoading(false);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchAllParents = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const [statesRes, citiesRes, countiesRes, regionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/states`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/cities`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/counties`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/regions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (statesRes.ok) setStates(await statesRes.json());
      if (citiesRes.ok) setCities(await citiesRes.json());
      if (countiesRes.ok) setCounties(await countiesRes.json());
      if (regionsRes.ok) setRegions(await regionsRes.json());
    } catch (error) {
      console.error('Error fetching parent locations:', error);
    }
  };

  const fetchLocations = async () => {
    const token = localStorage.getItem('access_token');
    const endpoints: Record<LocationType, string> = {
      state: 'states',
      city: 'cities',
      county: 'counties',
      region: 'regions',
      district: 'districts',
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${endpoints[activeTab]}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        setLocations(await response.json());
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem('access_token');
    const endpoints: Record<LocationType, string> = {
      state: 'states',
      city: 'cities',
      county: 'counties',
      region: 'regions',
      district: 'districts',
    };

    const url = editingItem
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${endpoints[activeTab]}/${editingItem.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${endpoints[activeTab]}`;

    try {
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingItem ? 'اطلاعات با موفقیت ویرایش شد' : 'مورد جدید با موفقیت ایجاد شد' 
        });
        resetForm();
        fetchLocations();
        await fetchAllParents();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'خطا در ذخیره اطلاعات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ارتباط با سرور' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این مورد اطمینان دارید؟')) return;

    const token = localStorage.getItem('access_token');
    const endpoints: Record<LocationType, string> = {
      state: 'states',
      city: 'cities',
      county: 'counties',
      region: 'regions',
      district: 'districts',
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/${endpoints[activeTab]}/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setMessage({ type: 'success', text: 'مورد با موفقیت حذف شد' });
        fetchLocations();
        await fetchAllParents();
      } else {
        setMessage({ type: 'error', text: 'خطا در حذف مورد' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ارتباط با سرور' });
    }
  };

  const resetForm = () => {
    setFormData({ name_fa: '', code: '' });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: Location) => {
    setEditingItem(item);
    const data: any = { name_fa: item.name_fa, code: item.code };
    
    if (activeTab === 'city') data.state_id = item.state_id;
    if (activeTab === 'county') data.city_id = item.city_id;
    if (activeTab === 'region') data.county_id = item.county_id;
    if (activeTab === 'district') data.region_id = item.region_id;
    
    setFormData(data);
    setShowForm(true);
  };

  const getTabLabel = (type: LocationType): string => {
    const labels: Record<LocationType, string> = {
      state: 'استان',
      city: 'شهر',
      county: 'شهرستان',
      region: 'بخش',
      district: 'ناحیه',
    };
    return labels[type];
  };

  const renderParentSelect = () => {
    if (activeTab === 'state') return null;

    const parentConfig: Record<Exclude<LocationType, 'state'>, { label: string; options: Location[]; key: string }> = {
      city: { label: 'استان', options: states, key: 'state_id' },
      county: { label: 'شهر', options: cities, key: 'city_id' },
      region: { label: 'شهرستان', options: counties, key: 'county_id' },
      district: { label: 'بخش', options: regions, key: 'region_id' },
    };

    const config = parentConfig[activeTab as Exclude<LocationType, 'state'>];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
        <select
          value={formData[config.key] || ''}
          onChange={(e) => setFormData({ ...formData, [config.key]: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        >
          <option value="">انتخاب کنید</option>
          {config.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name_fa} ({option.code})
            </option>
          ))}
        </select>
      </div>
    );
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت مکان‌ها</h1>
            <p className="text-gray-600">مدیریت استان، شهر، شهرستان، بخش و ناحیه</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            بازگشت به داشبورد
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-2 flex space-x-2 space-x-reverse overflow-x-auto">
          {(['state', 'city', 'county', 'region', 'district'] as LocationType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type);
                resetForm();
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === type
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getTabLabel(type)}
            </button>
          ))}
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showForm ? 'لغو' : `+ ${getTabLabel(activeTab)} جدید`}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? `ویرایش ${getTabLabel(activeTab)}` : `افزودن ${getTabLabel(activeTab)} جدید`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderParentSelect()}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                  <input
                    type="text"
                    value={formData.name_fa}
                    onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">کد</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    minLength={1}
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingItem ? 'ویرایش' : 'ایجاد'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ ایجاد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    موردی یافت نشد
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.name_fa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(location.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
