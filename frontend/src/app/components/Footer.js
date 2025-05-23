'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [pages, setPages] = useState([]);
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [pagesRes, authorRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pages?place=footer`),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/author`),
      ]);

      const pageData = await pagesRes.json();
      const authorData = await authorRes.json();

      setPages(pageData);
      setAuthor(authorData);
    }

    fetchData();
  }, []);

  return (
    <footer className="mt-12 mb-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div className="mb-2 md:mb-0">
          {author?.name || '...'} Copyright © {new Date().getFullYear()}
        </div>
        <nav className="space-x-4 text-right">
          {pages.map((page) => (
            <Link key={page.slug} href={`/${page.slug}`} className="hover:underline hover:text-blue-600">
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
