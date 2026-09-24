export const getProductImages = (product) => {
  const rawImages = product?.images ?? product?.image;

  if (Array.isArray(rawImages)) {
    return rawImages.filter(Boolean);
  }

  if (typeof rawImages !== 'string' || !rawImages.trim()) {
    return [];
  }

  const value = rawImages.trim();
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    if (typeof parsed === 'string' && parsed) return [parsed];
  } catch {
    // A plain URL is the normal admin input format.
  }

  return [value];
};

export const getProductImage = (product) =>
  getProductImages(product)[0] || '/placeholder-product.jpg';

export const getProductUnitPrice = (product) =>
  Math.max(0, Number(product?.price || 0) - Number(product?.discount || 0));
