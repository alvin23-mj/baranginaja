export const PRODUCT_PHOTOS_BUCKET = "product-photos";
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS_PER_PRODUCT = 5;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isValidPhotoFile(file: File): boolean {
  return (
    ALLOWED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_SIZE_BYTES
  );
}

export function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${PRODUCT_PHOTOS_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

export const BUKTI_PEMBAYARAN_BUCKET = "bukti-pembayaran";
export const MAX_BUKTI_BAYAR_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_BUKTI_BAYAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isValidBuktiBayarFile(file: File): boolean {
  return (
    ALLOWED_BUKTI_BAYAR_TYPES.includes(file.type) &&
    file.size <= MAX_BUKTI_BAYAR_SIZE_BYTES
  );
}
