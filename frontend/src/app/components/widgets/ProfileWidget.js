'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function ProfileWidget() {
  const [author, setAuthor] = useState(null);
  

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const res = await fetch(api('author'));
        const data = await res.json();
        setAuthor(data);
      } catch (error) {
        console.error('Yazar bilgileri alınamadı:', error);
      }
    };

    fetchAuthor();
  }, []);
console.log("🧑 Gelen author:", author)
  if (!author) {
    return <p className="text-center text-gray-400">Yükleniyor...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center whitespace-pre-line">
      <Image
        src="/images/profile.jpg"
        alt={author.name}
        width={96}
        height={96}
        className="mx-auto rounded-full"
      />
      <h3 className="text-lg font-semibold mt-2">{author.name}</h3>
      <p className="text-sm text-gray-600">{author.bio}</p>

      <div className="flex justify-center mt-3 space-x-3 text-blue-600 text-sm">
        {author.github && (
          <Link href={author.github} target="_blank">GitHub</Link>
        )}
        {author.linkedin && (
          <Link href={author.linkedin} target="_blank">LinkedIn</Link>
        )}
        {author.scholar && (
          <Link href={author.scholar} target="_blank">Scholar</Link>
        )}
      </div>
    </div>
  );
}

