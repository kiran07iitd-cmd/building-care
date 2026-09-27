export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

export function getImageFileError(file: File): string | null {
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
    return "Only JPG, PNG or WEBP images allowed";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image too large (max 4 MB)";
  }
  return null;
}