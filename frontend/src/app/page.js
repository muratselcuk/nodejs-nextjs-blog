import PaginatedPage from './posts/page/[pageNumber]/page';

export default function Home() {
  return <PaginatedPage params={{ pageNumber: '1' }} />;
}
