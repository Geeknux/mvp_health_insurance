'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
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
        setIsAdmin(userData.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const allMenuItems: MenuItem[] = [
    { title: 'داشبورد', href: '/dashboard', icon: '🏠' },
    { title: 'طرح‌های بیمه', href: '/dashboard/insurance/plans', icon: '📋' },
    { title: 'ثبت‌نام‌ها', href: '/dashboard/registrations', icon: '📝' },
    { title: 'مدارس', href: '/dashboard/schools', icon: '🏫' },
    { title: 'مدیریت ثبت‌نام‌ها', href: '/admin/registrations', icon: '✅', adminOnly: true },
    { title: 'مدیریت مکان‌ها', href: '/admin/locations', icon: '🗺️', adminOnly: true },
    { title: 'لیست طرح‌ها', href: '/admin/plans', icon: '📄', adminOnly: true },
    { title: 'لیست پوشش‌ها', href: '/admin/coverages', icon: '📑', adminOnly: true },
    { title: 'ایجاد طرح', href: '/admin/plans/create', icon: '➕', adminOnly: true },
    { title: 'ایجاد پوشش', href: '/admin/coverages/create', icon: '🔧', adminOnly: true },
  ];

  // Filter menu items based on admin status
  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

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
    <aside className="w-64 bg-white min-h-screen shadow-sm border-l">
      <nav className="p-4 space-y-2">
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
                  ? 'bg-cyan-400 text-white shadow-md' 
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