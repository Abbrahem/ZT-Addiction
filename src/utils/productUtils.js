export const slugifyProductName = (name) => {
  if (!name) return '';
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getProductPath = (product) => {
  if (!product) return '/products';
  const slug = slugifyProductName(product.name || 'product');
  return `/products/${encodeURIComponent(slug)}`;
};

export const parseProductIdFromParam = (param) => {
  // This function is no longer needed for slug-based routing
  // Kept for backward compatibility
  return param;
};
