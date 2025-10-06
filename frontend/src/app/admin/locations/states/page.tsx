'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface State {
  id: string;
  name_fa: string;
  code: string;
  created_at: string;
}

export default function StatesManagementPage() {
  const router = useRouter();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [formData, setFormData] = useState({ name_fa: '', code: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        if (!userData.is_admin) {
          router.push('/dashboard');
          return;
        }
        fetchStates();
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchStates = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/states`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStates(data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem('access_token');
    const url = editingState
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/states/${editingState.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/states`;

    try {
      const response = await fetch(url, {
        method: editingState ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: editingState ? 'استان با موفقیت ویرایش شد' : 'استان با موفقیت ایجاد شد' });
        setFormData({ name_fa: '', code: '' });
        setShowForm(false);
        setEditingState(null);
        fetchStates();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'خطا در ذخیره اطلاعات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ارتباط با سرور' });
    }
  };

  const handleEdit = (state: State) => {
    setEditingState(state);
    setFormData({ name_fa: state.name_fa, code: state.code });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این استان اطمینان دارید؟')) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/states/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'استان با موفقیت حذف شد' });
        fetchStates();
      } else {
        setMessage({ type: 'error', text: 'خطا در حذف استان' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطا در ارتباط با سرور' });
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت استان‌ها</h1>
            <p className="text-gray-600">ایجاد، ویرایش و حذف استان‌ها</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingState(null);
                setFormData({ name_fa: '', code: '' });
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {showForm ? 'لغو' : '+ استان جدید'}
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              بازگشت
            </Link>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingState ? 'ویرایش استان' : 'افزودن استان جدید'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام استان</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">کد استان</label>
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
                  onClick={() => {
                    setShowForm(false);
                    setEditingState(null);
                    setFormData({ name_fa: '', code: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingState ? 'ویرایش' : 'ایجاد'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام استان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ ایجاد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {states.map((state) => (
                <tr key={state.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{state.name_fa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{state.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(state.created_at).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEdit(state)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(state.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
