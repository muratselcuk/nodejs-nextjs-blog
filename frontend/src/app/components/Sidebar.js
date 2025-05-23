import Image from 'next/image';
import Link from 'next/link';
import CategoryWidget from './widgets/CategoryWidget';
import ProfileWidget from './widgets/ProfileWidget';


export default async function Sidebar() {

  return (
    <aside className="space-y-6">
      <ProfileWidget />
      <CategoryWidget />
    </aside>
  );
}
