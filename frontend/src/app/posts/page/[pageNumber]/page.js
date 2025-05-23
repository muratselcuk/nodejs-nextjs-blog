import Link from 'next/link';
import Image from 'next/image';


const POSTS_PER_PAGE = 5;

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts`, {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function PaginatedPage({ params }) {
  const { pageNumber } = await params;
  const page = parseInt(pageNumber) || 1;

  const posts = await getPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  if (page < 1 || page > totalPages) {
    return <h1 className="text-center text-red-600 mt-10">Bu sayfa bulunamadı.</h1>;
  }

  const start = (page - 1) * POSTS_PER_PAGE;
  const currentPosts = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(start, start + POSTS_PER_PAGE);

  return (
    <main className="max-w-3xl mx-auto">

      <ul className="space-y-8">
        {currentPosts.map((post) => 
          {
    const imageUrl = post.image || '/images/default-post.jpg';

    return (
          <li key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg hover:border-blue-500 border border-transparent transition p-5">
             <Image
          src={imageUrl}
          alt={post.title}
          width={800}
          height={400}
          className="w-full h-48 object-cover"
        />
            <h2 className="text-2xl font-bold text-blue-700 hover:underline">
              <Link href={`/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {post.categories?.map((cat, i) => (
                <span key={cat.slug}>
                  <a href={`/category/${cat.slug}`} className="text-blue-600 hover:underline">
                    {cat.name}
                  </a>
                  {i < post.categories.length - 1 && ', '}
                </span>
              ))}{' — '}
              {new Date(post.published_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}{' — '}
              {post.author?.name}
            </p>

            <p className="text-gray-700">
              {post.content.slice(0, 250)}{post.content.length > 250 ? '...' : ''}
            </p>

            <Link
              href={`/${post.slug}`}
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              Devamını oku →
            </Link>
          </li>
          );
        }
        )}
      </ul>

      {/* Sayfalama kontrolleri */}
      <div className="flex justify-between items-center mt-10 text-sm">
        {page > 1 ? (
          <Link href={`/posts/page/${page - 1}`} className="text-blue-600 hover:underline">
            ← Önceki
          </Link>
        ) : <div />}
        {page < totalPages ? (
          <Link href={`/posts/page/${page + 1}`} className="text-blue-600 hover:underline ml-auto">
            Sonraki →
          </Link>
        ) : <div />}
      </div>
      <div className="text-xs text-gray-400 text-center">
        {page} / {totalPages}
      </div>

    </main>
  );
}
