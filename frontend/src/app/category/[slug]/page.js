import CategoryPaginatedPage from './page/[pageNumber]/page';

export default async function CategoryRoot(props) {
  const { slug } = await props.params;
  return <CategoryPaginatedPage params={{ slug, pageNumber: '1' }} />;
}
