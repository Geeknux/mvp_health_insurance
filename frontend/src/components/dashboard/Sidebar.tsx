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
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { title: 'مدارک من', href: '/dashboard/documents', icon: '📄', userOnly: true },
    { title: 'مدیریت کاربران', href: '/admin/users', icon: '👤', adminOnly: true },
    { title: 'مدیریت ثبت‌نام‌ها', href: '/admin/registrations', icon: '✅', adminOnly: true },
    { title: 'مدیریت افراد', href: '/admin/persons', icon: '👥', adminOnly: true },
    { title: 'مدیریت مدارک', href: '/admin/documents', icon: '📎', adminOnly: true },
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
      <aside className="hidden lg:block w-64 bg-white min-h-screen shadow-sm border-l">
        <nav className="p-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-40
          bg-white shadow-xl lg:shadow-sm border-l
          transform transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-80 lg:min-h-screen
        `}
      >
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block absolute -left-3 top-20 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Profile Section */}
        {user && (
          <div className="p-4 border-b bg-gradient-to-br from-primary-50 to-white">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 space-x-reverse'} mb-3`}>
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user.national_id}</p>
                </div>
              )}
            </div>
            {isAdmin && !isCollapsed && (
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  👑 مدیر سیستم
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2 space-x-reverse'}`}
              title="خروج"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span>خروج</span>}
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
                onClick={() => setIsOpen(false)}
                className={`
                  w-full text-right px-4 py-3 rounded-lg font-medium flex items-center
                  transition-all duration-200
                  ${isCollapsed ? 'justify-center' : 'justify-between'}
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
                title={isCollapsed ? item.title : ''}
              >
                <span className={`flex items-center ${isCollapsed ? '' : 'space-x-3 space-x-reverse'}`}>
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && <span>{item.title}</span>}
                </span>
                {!isCollapsed && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Link at Bottom */}
        <div className="p-4 border-t">
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className={`
              w-full px-4 py-3 rounded-lg font-medium flex items-center
              transition-all duration-200 hover:bg-gray-50 text-gray-700
              ${isCollapsed ? 'justify-center' : 'space-x-3 space-x-reverse'}
            `}
            title={isCollapsed ? 'پروفایل' : ''}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            {!isCollapsed && <span>پروفایل</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}