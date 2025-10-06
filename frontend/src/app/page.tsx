import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
      <div className="flex justify-center mb-6">
        <Image
          src="/ministry_logo.jpg"
          alt="لوگوی وزارت آموزش و پرورش"
          width={200}
          height={200}
          className="object-contain"
          priority
        />
      </div>
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          سامانه بیمه تکمیلی سلامت
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          وزارت آموزش و پرورش جمهوری اسلامی ایران
        </p>
        <div className="space-x-4 space-x-reverse">
          <a
            href="/login"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            ورود
          </a>
          <a
            href="/register"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ثبت‌نام
          </a>
        </div>
      </div>
    </main>
  )
}