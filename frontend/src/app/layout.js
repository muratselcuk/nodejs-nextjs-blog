import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

export async function generateMetadata() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/author`, {
      next: { revalidate: 60 }, // cache opsiyonu
    });

    if (!res.ok) throw new Error('Author metadata fetch failed');
    const author = await res.json();

    return {
      title: author.title || 'Blog Sayfası',
      description: author.description || 'Yazılar, teknoloji, yazılım ve daha fazlası...',
    };
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return {
      title: 'Blog',
      description: 'Yazılar ve içerikler',
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="font-sans bg-gray-100 text-gray-700 min-h-screen px-6">
        <Header />
        <main className="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
          <div className="lg:col-span-2">{children}</div>
          <Sidebar />
        </main>
        <Footer />
      </body>
    </html>
  );
}
