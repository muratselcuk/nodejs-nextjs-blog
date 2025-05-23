import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

async function getContent(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/post/slug/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) return undefined;

  return res.json();
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await getContent(slug);

  if (!post) {
    return <h1 className="text-red-600 p-6">İçerik bulunamadı</h1>;
  }

  const imageUrl = post.image || '/images/default-post.jpg';

  return (
    <main className="max-w-3xl mx-auto">
      <article className="bg-white rounded-xl shadow-md p-6">

        {/* Başlık */}
        <h1 className="text-3xl font-bold text-blue-700 mb-4">{post.title}</h1>

        {/* Post tipi ise: görsel + meta alanları */}
        {post.type === 'post' && (
          <>
            <Image
              src={imageUrl}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 object-cover mb-4"
            />
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
          </>
        )}

        {/* İçerik */}
        <article className="prose prose-blue max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </article>
    </main>
  );
}
