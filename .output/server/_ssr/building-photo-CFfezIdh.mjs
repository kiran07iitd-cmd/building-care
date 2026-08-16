import { s as supabase } from "./client-DjU25MuW.mjs";
const BUILDING_PHOTOS_BUCKET = "building-photos";
function buildingPhotoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from(BUILDING_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
async function buildingPhotoSignedUrl(path, expiresIn = 3600) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage.from(BUILDING_PHOTOS_BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
async function uploadBuildingPhoto(file, buildingId) {
  if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
    throw new Error("Only JPG, PNG or WEBP images allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image too large (max 5MB)");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${buildingId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUILDING_PHOTOS_BUCKET).upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  return { path, url: buildingPhotoUrl(path) };
}
export {
  buildingPhotoSignedUrl as b,
  uploadBuildingPhoto as u
};
