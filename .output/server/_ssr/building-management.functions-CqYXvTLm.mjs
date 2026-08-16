import { r as reactExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { I as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { a as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-CRlammpZ.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-1oyI6D-P.mjs";
import { o as objectType, s as stringType, n as numberType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const uuidSchema = stringType().uuid();
const buildingInput = objectType({
  buildingId: uuidSchema
});
const getManageRoomsData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(createSsrRpc("4bf63817df43462698cda6cb45bbd50a26439e98dd14ebabe1fbb514624fb939"));
const addRoomToBuilding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomNumber: stringType().trim().min(1).max(30)
})).handler(createSsrRpc("75f0595a241e754104ebb0db779a530ac7e7c9eaa7cac383689621bd6f0574d6"));
const toggleRoomActive = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomId: uuidSchema,
  isActive: booleanType()
})).handler(createSsrRpc("d7cf4490e1777851c8fbf0ceca1fe453c08d1fdc182e38bfda45de4096562e68"));
const removeRoomUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomId: uuidSchema
})).handler(createSsrRpc("c63b6c11a436ec6e411e2bc617277d67b7c964d25c83ebe9e6be88216df8f85a"));
const searchAssignableUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  email: stringType().trim().email().max(254)
})).handler(createSsrRpc("7fccd54ef6e1c7e5c57b9aa4455bb70c1d066bedc807c0bb6a5e8632376af94e"));
const assignUserToRoom = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomId: uuidSchema,
  userId: uuidSchema
})).handler(createSsrRpc("a73865b71405be02da73230b8e9801dd311b78e93a55964f469f31601669ba43"));
const getMaintenanceData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(createSsrRpc("546294f48d6e172122bbf2ebda5fc415d6c6e5058e0f780f98130510a89d0ec5"));
const saveMaintenanceCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  categoryId: uuidSchema.optional(),
  name: stringType().trim().min(1).max(80),
  totalAmount: numberType().min(0),
  penaltyAmount: numberType().min(0),
  upiId: stringType().trim().max(120).nullable(),
  qrCodeImage: stringType().trim().max(500).nullable()
})).handler(createSsrRpc("6899e72a7fae3265ccefb4d4abe6e7a5751e25b5bf80eae5426b3a8a2468f42f"));
const toggleMaintenanceCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  categoryId: uuidSchema,
  isActive: booleanType()
})).handler(createSsrRpc("c39042831883f4bc613b360e93f6f27848ebdf60b94874672a83544c67c08a39"));
const applyCurrentMonthPenalties = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  month: stringType().trim().min(4).max(30)
})).handler(createSsrRpc("aa660a8c63240a80eb62e0036f156e31984240fefb85ef41de86e8a6b62841b2"));
const getManageHostsData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(createSsrRpc("93c42ef5e2f6278adb23e3bbbc3072fad7bf01a8c73373479bdc80fe614b2f71"));
const requestAddBuildingHost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  email: stringType().trim().email().max(254),
  mobile: stringType().trim().min(5).max(20),
  google: stringType().trim().email().max(254)
})).handler(createSsrRpc("aa595e694a95db546b70ff8eeaeefffa56ef5f4e62e0a8b0ee696becb7c8d4ce"));
const requestHostLimitChange = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  limit: numberType().int().min(1).max(5)
})).handler(createSsrRpc("3c91e3d0c9dfe900910ddfa22fe58f21c64f079a853a92878bc8cc684611e031"));
const voteOnHostRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  requestId: uuidSchema,
  vote: enumType(["agree", "disagree"])
})).handler(createSsrRpc("a40a7368d68b36646e9430f06c506b201fda35925c88905906fe0f8436530518"));
const transferHostPosition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  hostId: uuidSchema,
  email: stringType().trim().email().max(254),
  mobile: stringType().trim().min(5).max(20),
  google: stringType().trim().email().max(254)
})).handler(createSsrRpc("c5cbc529e76c21d244ad94ca46053ac6e50d4e8b47c087af5a7f63a548881dd2"));
const ensureMyBills = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  month: stringType().trim().min(6).max(10)
})).handler(createSsrRpc("b3548dcb376c68d3cf6ec8db3af704a6a98a188a604d94efe29add149e77fd3d"));
const monthInput = objectType({
  buildingId: uuidSchema,
  month: stringType().trim().min(6).max(10)
});
const getMonthlyBillingData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(monthInput).handler(createSsrRpc("41e02e35abed7f8b7826f51b44f07367e171d08634e9ab1bf9ad1f89ccec7a0f"));
const getBillingStats = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(monthInput).handler(createSsrRpc("6456e2a6401dbe8579ac28042b1660f43dc1d86dd4106f530bc13120249efd51"));
const decidePaymentVerification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  statusId: uuidSchema,
  approve: booleanType()
})).handler(createSsrRpc("b6bbaa9115f26649a6a4fa60d9b7c4f0f421977f11eabbcadcdb6728201d3d6d"));
const resetMonthlyBilling = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(monthInput).handler(createSsrRpc("a792a2d51b32592674b441cb5a90b6ee89a79fd105304119fae5ff2a178e96f3"));
const getBuildingDirectory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(createSsrRpc("4f59f7dd7924802a86f71bb965b54d905bf6c300c4c8bb274759c46e0d7bb741"));
const getBuildingResidents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(createSsrRpc("17206ed9eae4cb10ad8ee181ed08f96b94081eeb67e61994a2483f1b109c7d60"));
const promoteResidentToHost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  userId: uuidSchema
})).handler(createSsrRpc("da8d238557e4f0e257e2258e38fd163f4e224dc5fa2d7835afdb43418fa8b484"));
const registerNewBuilding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  name: stringType().trim().min(1).max(100),
  location: stringType().trim().min(1).max(200),
  hostCount: numberType().int().min(1).max(5).default(1),
  activeRole: enumType(["host", "resident"]).optional()
})).handler(createSsrRpc("794b172deab1f76249f214617b48a3fcf4127abb3111cd250c8be8d832711817"));
export {
  getManageHostsData as a,
  requestAddBuildingHost as b,
  requestHostLimitChange as c,
  transferHostPosition as d,
  getBuildingDirectory as e,
  getMonthlyBillingData as f,
  getMaintenanceData as g,
  decidePaymentVerification as h,
  resetMonthlyBilling as i,
  ensureMyBills as j,
  getBuildingResidents as k,
  getBillingStats as l,
  applyCurrentMonthPenalties as m,
  addRoomToBuilding as n,
  toggleRoomActive as o,
  promoteResidentToHost as p,
  removeRoomUser as q,
  registerNewBuilding as r,
  saveMaintenanceCategory as s,
  toggleMaintenanceCategory as t,
  useServerFn as u,
  voteOnHostRequest as v,
  searchAssignableUser as w,
  assignUserToRoom as x,
  getManageRoomsData as y
};
