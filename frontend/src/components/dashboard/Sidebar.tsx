'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  href: string;
  icon: string;
}

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { title: 'داشبورد', href: '/dashboard', icon: '🏠' },
    { title: 'طرح‌های بیمه', href: '/dashboard/insurance/plans', icon: '📋' },
    { title: 'ثبت‌نام بیمه', href: '/dashboard/insurance/register', icon: '✍️' },
    { title: 'ثبت‌نام‌های من', href: '/dashboard/registrations', icon: '📝' },
    { title: 'مدارس', href: '/dashboard/schools', icon: '🏫' },
    { title: 'لیست طرح‌ها', href: '/admin/plans', icon: '📄' },
    { title: 'لیست پوشش‌ها', href: '/admin/coverages', icon: '📑' },
    { title: 'ایجاد طرح', href: '/admin/plans/create', icon: '➕' },
    { title: 'ایجاد پوشش', href: '/admin/coverages/create', icon: '🔧' },
  ];

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