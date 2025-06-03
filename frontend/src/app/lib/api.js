export const api = (path) =>
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${path.replace(/^\/+/, '')}`;
