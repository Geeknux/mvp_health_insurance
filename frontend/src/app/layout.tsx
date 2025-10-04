import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'سامانه بیمه تکمیلی سلامت',
  description: 'سامانه مدیریت بیمه تکمیلی سلامت - وزارت آموزش و پرورش',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans antialiased bg-gray-50">
        {children}
      </body>
    </html>
  )
}