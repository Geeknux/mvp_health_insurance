'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface MenuItem {
  title: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
  userOnly?: boolean;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  national_id: string;
  is_admin: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
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
        setUser(userData);
        setIsAdmin(userData.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  const allMenuItems: MenuItem[] = [
    { title: 'داشبورد', href: '/dashboard', icon: '🏠' },
    { title: 'طرح‌های بیمه', href: '/dashboard/insurance/plans', icon: '📋', userOnly: true },
    { title: 'ثبت‌نام‌ها', href: '/dashboard/registrations', icon: '📝', userOnly: true },
    { title: 'افراد تحت پوشش', href: '/dashboard/persons', icon: '👥', userOnly: true },
    { title: 'مدیریت ثبت‌نام‌ها', href: '/admin/registrations', icon: '✅', adminOnly: true },
    { title: 'مدیریت افراد', href: '/admin/persons', icon: '👥', adminOnly: true },
    { title: 'مدیریت مدارس', href: '/admin/schools', icon: '🏫', adminOnly: true },
    { title: 'مدیریت مکان‌ها', href: '/admin/locations', icon: '🗺️', adminOnly: true },
    { title: 'مدیریت طرح‌ها', href: '/admin/plans', icon: '📄', adminOnly: true },
    { title: 'مدیریت پوشش‌ها', href: '/admin/coverages', icon: '📑', adminOnly: true },
  ];

  // Filter menu items based on admin status
  const menuItems = allMenuItems.filter(item => {
    if (item.adminOnly) return isAdmin;
    if (item.userOnly) return !isAdmin;
    return true;
  });

  if (loading) {
    return (
      <aside className="w-64 bg-white min-h-screen shadow-sm border-l">
        <nav className="p-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white min-h-screen shadow-sm border-l flex flex-col">
      {/* Profile Section */}
      {user && (
        <div className="p-4 border-b bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center space-x-3 space-x-reverse mb-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-600">{user.national_id}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                👑 مدیر سیستم
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center space-x-2 space-x-reverse"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>خروج</span>
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`
                w-full text-right px-4 py-3 rounded-lg font-medium flex items-center justify-between
                transition-all duration-200
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <span className="flex items-center space-x-3 space-x-reverse">
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}