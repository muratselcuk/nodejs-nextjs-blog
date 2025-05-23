'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoryWidget() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    }

    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h4 className="text-lg font-semibold mb-3">Kategoriler</h4>
      <ul className="space-y-2 text-sm text-gray-700">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link href={`/category/${cat.slug}`} className="hover:text-blue-600">
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
