'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [pages, setPages] = useState([]);
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [pagesRes, authorRes] = await Promise.all([
        fetch(`/api/pages?place=header`),
        fetch(`/api/author`),
      ]);

      const pageData = await pagesRes.json();
      const authorData = await authorRes.json();

      setPages(pageData);
      setAuthor(authorData);
    }

    fetchData();
  }, []);

  return (
    <header className="mt-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-700 hover:underline">
          {author?.name || '...'}
        </Link>

        <nav className="space-x-4 text-base font-medium text-gray-700">
          {pages.map((page) => (
            <Link key={page.slug} href={`/${page.slug}`} className="hover:underline hover:text-blue-600">
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
