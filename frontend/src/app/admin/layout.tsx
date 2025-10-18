'use client';

import Sidebar from '@/components/dashboard/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      <main className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="pt-16 lg:pt-0 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
