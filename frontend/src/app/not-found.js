// src/app/not-found.js

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-2">404 - Sayfa Bulunamadı</h1>
      <p className="text-gray-500 mb-4">
        Aradığınız sayfa bulunamadı. Lütfen adresi kontrol edin veya ana sayfaya dönün.
      </p>
      <a href="/" className="text-blue-600 hover:underline">Ana Sayfaya Dön</a>
    </main>
  );
}
