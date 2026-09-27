import { supabase } from "@/integrations/supabase/client";
import { getImageFileError } from "@/lib/image-file";

export const BUILDING_PHOTOS_BUCKET = "building-photos";

function getBuildingPhotoObjectPath(value: string): string | null {
  if (!/^https?:\/\//i.test(value)) return value;

  const supabaseUrl =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    const url = new URL(value);
    const projectUrl = new URL(supabaseUrl);
    const publicObjectPrefix = `/storage/v1/object/public/${BUILDING_PHOTOS_BUCKET}/`;
    if (url.origin !== projectUrl.origin || !url.pathname.startsWith(publicObjectPrefix)) {
      return null;
    }
    return decodeURIComponent(url.pathname.slice(publicObjectPrefix.length));
  } catch {
    return null;
  }
}

export function buildingPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const objectPath = getBuildingPhotoObjectPath(path);
  if (!objectPath) return null;
  // Retained for callers that need the bucket's public URL.
  const { data } = supabase.storage.from(BUILDING_PHOTOS_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function buildingPhotoSignedUrl(
  path: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null;
  const objectPath = getBuildingPhotoObjectPath(path);
  if (!objectPath) return null;
  const { data, error } = await supabase.storage
    .from(BUILDING_PHOTOS_BUCKET)
    .createSignedUrl(objectPath, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function uploadBuildingPhoto(
  file: File,
  buildingId: string,
): Promise<{ path: string; url: string }> {
  const validationError = getImageFileError(file);
  if (validationError) throw new Error(validationError);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${buildingId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUILDING_PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  return { path, url: buildingPhotoUrl(path)! };
}
