import { supabase } from "@/integrations/supabase/client";

export const BUILDING_PHOTOS_BUCKET = "building-photos";

export function buildingPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  // Bucket is private — fall through to signed URL. Kept for legacy callers.
  const { data } = supabase.storage.from(BUILDING_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function buildingPhotoSignedUrl(
  path: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage
    .from(BUILDING_PHOTOS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function uploadBuildingPhoto(
  file: File,
  buildingId: string,
): Promise<{ path: string; url: string }> {
  if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
    throw new Error("Only JPG, PNG or WEBP images allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image too large (max 5MB)");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${buildingId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUILDING_PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  return { path, url: buildingPhotoUrl(path)! };
}
