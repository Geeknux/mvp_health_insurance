'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  document_type: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_size_mb: number;
  mime_type?: string;
  is_verified: boolean;
  created_at: string;
  registration_id?: string;
  person_id?: string;
  user_id: string;
  user_name: string;
  user_email: string;
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const documentTypes = [
    { value: 'all', label: 'همه' },
    { value: 'national_id', label: 'کارت ملی' },
    { value: 'birth_certificate', label: 'شناسنامه' },
    { value: 'marriage_certificate', label: 'سند ازدواج' },
    { value: 'employment_letter', label: 'حکم کارگزینی' },
    { value: 'insurance_request', label: 'فرم درخواست بیمه' },
    { value: 'medical_records', label: 'مدارک پزشکی' },
    { value: 'other', label: 'سایر' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${documentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error verifying document:', error);
    }
  };

  const handleUnverify = async (documentId: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${documentId}/unverify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error unverifying document:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('آیا از حذف این مدرک اطمینان دارید؟')) {
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/admin/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/admin/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/admin/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Clean up after a delay to ensure the new tab has loaded
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && doc.is_verified) ||
      (filterVerified === 'unverified' && !doc.is_verified);
    
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesVerified && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            مدیریت مدارک
          </h1>
          <p className="text-gray-600">
            مشاهده و مدیریت مدارک آپلود شده توسط کاربران
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="جستجو بر اساس عنوان، نام کاربر یا ایمیل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Verification Status */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت تایید
              </label>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setFilterVerified('all')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterVerified === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  همه ({documents.length})
                </button>
                <button
                  onClick={() => setFilterVerified('verified')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterVerified === 'verified'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  تایید شده ({documents.filter(d => d.is_verified).length})
                </button>
                <button
                  onClick={() => setFilterVerified('unverified')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterVerified === 'unverified'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  در انتظار ({documents.filter(d => !d.is_verified).length})
                </button>
              </div>
            </div>

            {/* Document Type */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع مدرک
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">کل مدارک</div>
            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">تایید شده</div>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.is_verified).length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">در انتظار تایید</div>
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => !d.is_verified).length}
            </div>
          </div>
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              مدرکی یافت نشد
            </h3>
            <p className="text-gray-600">
              با فیلترهای انتخاب شده، مدرکی برای نمایش وجود ندارد
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      کاربر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      عنوان مدرک
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      نام فایل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      حجم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      وضعیت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تاریخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.user_name}</div>
                        <div className="text-sm text-gray-500">{doc.user_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        {doc.description && (
                          <div className="text-sm text-gray-500">{doc.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getDocumentTypeLabel(doc.document_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.file_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.file_size_mb} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.is_verified ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                            تایید شده
                          </span>
                        ) : (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            در انتظار
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDocument(doc.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="مشاهده"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownload(doc.id, doc.file_name)}
                            className="text-primary-600 hover:text-primary-900"
                            title="دانلود"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          {doc.is_verified ? (
                            <button
                              onClick={() => handleUnverify(doc.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="لغو تایید"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerify(doc.id)}
                              className="text-green-600 hover:text-green-900"
                              title="تایید"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-900"
                            title="حذف"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-3 border-b">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.user_name} • {doc.user_email}
                      </p>
                    </div>
                    {doc.is_verified ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        تایید شده
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        در انتظار
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">نام فایل:</span>
                      <span className="text-gray-900 font-medium truncate max-w-[200px]">
                        {doc.file_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">حجم:</span>
                      <span className="text-gray-900 font-medium">{doc.file_size_mb} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاریخ:</span>
                      <span className="text-gray-900 font-medium">{formatDate(doc.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleViewDocument(doc.id)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      مشاهده
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id, doc.file_name)}
                      className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      دانلود
                    </button>
                    {doc.is_verified ? (
                      <button
                        onClick={() => handleUnverify(doc.id)}
                        className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                        title="لغو تایید"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(doc.id)}
                        className="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="تایید"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="حذف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
