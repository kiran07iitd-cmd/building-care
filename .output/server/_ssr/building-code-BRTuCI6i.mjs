const BUILDING_CODE_PREFIX = "B-";
const BUILDING_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BUILDING_CODE_LENGTH = 6;
function generateBuildingCode() {
  let code = BUILDING_CODE_PREFIX;
  for (let i = 0; i < BUILDING_CODE_LENGTH; i += 1) {
    code += BUILDING_CODE_ALPHABET[Math.floor(Math.random() * BUILDING_CODE_ALPHABET.length)];
  }
  return code;
}
function normalizeBuildingCode(value) {
  const trimmed = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith(BUILDING_CODE_PREFIX)) return trimmed;
  return `${BUILDING_CODE_PREFIX}${trimmed.replace(/^B-?/, "")}`;
}
function looksLikeBuildingCode(value) {
  const trimmed = value.trim().toUpperCase();
  return trimmed.startsWith(BUILDING_CODE_PREFIX) || trimmed.startsWith("B") && !trimmed.includes(" ");
}
export {
  generateBuildingCode as g,
  looksLikeBuildingCode as l,
  normalizeBuildingCode as n
};
