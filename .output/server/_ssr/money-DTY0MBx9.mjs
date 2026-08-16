const inr = (n) => {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  if (isNaN(v)) return "₹0";
  return `₹${v.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};
const currentMonth = () => {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = (m) => {
  const [y, mo] = m.split("-").map(Number);
  if (!y || !mo) return m;
  return new Date(y, mo - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });
};
const categoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes("light") || n.includes("electric") || n.includes("bill")) return "💡";
  if (n.includes("lift") || n.includes("elevator")) return "🛗";
  if (n.includes("clean") || n.includes("sweep")) return "🧹";
  if (n.includes("water")) return "💧";
  if (n.includes("security") || n.includes("guard")) return "🛡️";
  if (n.includes("garden") || n.includes("park")) return "🌿";
  return "🏷️";
};
export {
  categoryIcon as a,
  currentMonth as c,
  inr as i,
  monthLabel as m
};
