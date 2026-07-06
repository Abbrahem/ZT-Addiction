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
  const id = product._id || product.id;
  return `/products/${id}`;
};

export const parseProductIdFromParam = (param) => {
  return param;
};
