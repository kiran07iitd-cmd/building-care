import process from "node:process";
import { T as TSS_SERVER_FUNCTION, a as createServerFn } from "./server-CRlammpZ.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-1oyI6D-P.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { g as generateBuildingCode } from "./building-code-BRTuCI6i.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { s as stringType, o as objectType, b as booleanType, n as numberType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL"] : [],
      ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
const uuidSchema = stringType().uuid();
const buildingInput = objectType({
  buildingId: uuidSchema
});
async function requireActiveHost(buildingId, userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("hosts").select("id,user_id,is_primary,status").eq("building_id", buildingId).eq("user_id", userId).eq("status", "active").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Only active hosts can manage this building");
  return data;
}
async function requireRoomInBuilding(roomId, buildingId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("rooms").select("id,room_number,is_active,building_id").eq("id", roomId).eq("building_id", buildingId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Room not found in this building");
  return data;
}
async function getProfileByEmail(email) {
  const {
    data,
    error
  } = await supabaseAdmin.from("profiles").select("id,email,name,mobile,google_account").ilike("email", email.trim().toLowerCase()).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
async function evaluateHostRequest(requestId) {
  const {
    data: request,
    error: requestError
  } = await supabaseAdmin.from("host_requests").select("*").eq("id", requestId).maybeSingle();
  if (requestError) throw new Error(requestError.message);
  if (!request || request.status !== "pending") return;
  const {
    data: latestVotes,
    error: votesError
  } = await supabaseAdmin.from("host_request_votes").select("vote,host_id").eq("request_id", request.id);
  if (votesError) throw new Error(votesError.message);
  const votes = latestVotes || [];
  if (votes.some((v) => v.vote === "disagree")) {
    const {
      error: error2
    } = await supabaseAdmin.from("host_requests").update({
      status: "rejected"
    }).eq("id", request.id);
    if (error2) throw new Error(error2.message);
    return;
  }
  const {
    data: activeHosts,
    error: hostsError
  } = await supabaseAdmin.from("hosts").select("id").eq("building_id", request.building_id).eq("status", "active");
  if (hostsError) throw new Error(hostsError.message);
  const activeIds = new Set((activeHosts || []).map((host) => host.id));
  const agreedIds = new Set(votes.filter((vote) => vote.vote === "agree").map((vote) => vote.host_id));
  const allAgreed = activeIds.size > 0 && [...activeIds].every((hostId) => agreedIds.has(hostId));
  if (!allAgreed) return;
  if (request.request_type === "add_host") {
    const profile = await getProfileByEmail(request.new_user_email || "");
    if (!profile) {
      const {
        error: error2
      } = await supabaseAdmin.from("host_requests").update({
        status: "rejected"
      }).eq("id", request.id);
      if (error2) throw new Error(error2.message);
      throw new Error("New host must register before approval can complete");
    }
    const {
      count,
      error: countError
    } = await supabaseAdmin.from("hosts").select("id", {
      count: "exact",
      head: true
    }).eq("building_id", request.building_id).eq("status", "active");
    if (countError) throw new Error(countError.message);
    const {
      data: building,
      error: buildingError
    } = await supabaseAdmin.from("buildings").select("host_count").eq("id", request.building_id).maybeSingle();
    if (buildingError) throw new Error(buildingError.message);
    if ((count || 0) >= (building?.host_count || 1)) {
      throw new Error("Host limit reached. Increase the host limit first.");
    }
    const {
      data: existing,
      error: existingError
    } = await supabaseAdmin.from("hosts").select("id,status").eq("building_id", request.building_id).eq("user_id", profile.id).maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (existing) {
      const {
        error: error2
      } = await supabaseAdmin.from("hosts").update({
        status: "active",
        is_primary: false
      }).eq("id", existing.id);
      if (error2) throw new Error(error2.message);
    } else {
      const {
        error: error2
      } = await supabaseAdmin.from("hosts").insert({
        building_id: request.building_id,
        user_id: profile.id,
        is_primary: false,
        status: "active"
      });
      if (error2) throw new Error(error2.message);
    }
  }
  if (request.request_type === "change_host_count") {
    const limit = Number.parseInt(request.new_user_email || "", 10);
    if (!Number.isInteger(limit) || limit < 1 || limit > 5) {
      throw new Error("Host limit must be between 1 and 5");
    }
    const {
      error: error2
    } = await supabaseAdmin.from("buildings").update({
      host_count: limit
    }).eq("id", request.building_id);
    if (error2) throw new Error(error2.message);
  }
  const {
    error
  } = await supabaseAdmin.from("host_requests").update({
    status: "approved"
  }).eq("id", request.id);
  if (error) throw new Error(error.message);
}
const getManageRoomsData_createServerFn_handler = createServerRpc({
  id: "4bf63817df43462698cda6cb45bbd50a26439e98dd14ebabe1fbb514624fb939",
  name: "getManageRoomsData",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getManageRoomsData.__executeServer(opts));
const getManageRoomsData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(getManageRoomsData_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const [{
    data: building,
    error: buildingError
  }, {
    data: rooms,
    error: roomsError
  }] = await Promise.all([supabaseAdmin.from("buildings").select("name").eq("id", data.buildingId).maybeSingle(), supabaseAdmin.from("rooms").select("id,room_number,is_active").eq("building_id", data.buildingId).order("room_number")]);
  if (buildingError) throw new Error(buildingError.message);
  if (roomsError) throw new Error(roomsError.message);
  const roomList = rooms || [];
  const roomIds = roomList.map((room) => room.id);
  const assignments = {};
  if (roomIds.length) {
    const {
      data: roomUsers,
      error: roomUsersError
    } = await supabaseAdmin.from("room_users").select("room_id,user_id").eq("status", "active").in("room_id", roomIds);
    if (roomUsersError) throw new Error(roomUsersError.message);
    const userIds = [...new Set((roomUsers || []).map((row) => row.user_id))];
    let profileMap = {};
    if (userIds.length) {
      const {
        data: profiles,
        error: profilesError
      } = await supabaseAdmin.from("profiles").select("id,email,name,mobile").in("id", userIds);
      if (profilesError) throw new Error(profilesError.message);
      profileMap = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
    }
    (roomUsers || []).forEach((row) => {
      assignments[row.room_id] = {
        room_id: row.room_id,
        user_id: row.user_id,
        email: profileMap[row.user_id]?.email ?? null,
        name: profileMap[row.user_id]?.name ?? null,
        mobile: profileMap[row.user_id]?.mobile ?? null
      };
    });
  }
  return {
    buildingName: building?.name ?? "",
    rooms: roomList,
    assignments
  };
});
const addRoomToBuilding_createServerFn_handler = createServerRpc({
  id: "75f0595a241e754104ebb0db779a530ac7e7c9eaa7cac383689621bd6f0574d6",
  name: "addRoomToBuilding",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => addRoomToBuilding.__executeServer(opts));
const addRoomToBuilding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomNumber: stringType().trim().min(1).max(30)
})).handler(addRoomToBuilding_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const roomNumber = data.roomNumber.trim();
  const {
    data: existing,
    error: existingError
  } = await supabaseAdmin.from("rooms").select("id,room_number").eq("building_id", data.buildingId);
  if (existingError) throw new Error(existingError.message);
  if ((existing || []).some((room) => room.room_number.toLowerCase() === roomNumber.toLowerCase())) {
    throw new Error("Room number already exists in this building");
  }
  const {
    error
  } = await supabaseAdmin.from("rooms").insert({
    building_id: data.buildingId,
    room_number: roomNumber,
    is_active: true
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const toggleRoomActive_createServerFn_handler = createServerRpc({
  id: "d7cf4490e1777851c8fbf0ceca1fe453c08d1fdc182e38bfda45de4096562e68",
  name: "toggleRoomActive",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => toggleRoomActive.__executeServer(opts));
const toggleRoomActive = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomId: uuidSchema,
  isActive: booleanType()
})).handler(toggleRoomActive_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  await requireRoomInBuilding(data.roomId, data.buildingId);
  if (!data.isActive) {
    const {
      count,
      error: countError
    } = await supabaseAdmin.from("rooms").select("id", {
      count: "exact",
      head: true
    }).eq("building_id", data.buildingId).eq("is_active", true);
    if (countError) throw new Error(countError.message);
    if ((count || 0) <= 1) {
      throw new Error("Cannot deactivate. At least 1 room must remain active.");
    }
  }
  const {
    error
  } = await supabaseAdmin.from("rooms").update({
    is_active: data.isActive
  }).eq("id", data.roomId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeRoomUser_createServerFn_handler = createServerRpc({
  id: "c63b6c11a436ec6e411e2bc617277d67b7c964d25c83ebe9e6be88216df8f85a",
  name: "removeRoomUser",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => removeRoomUser.__executeServer(opts));
const removeRoomUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomId: uuidSchema
})).handler(removeRoomUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  await requireRoomInBuilding(data.roomId, data.buildingId);
  const {
    error
  } = await supabaseAdmin.from("room_users").update({
    status: "removed"
  }).eq("room_id", data.roomId).eq("status", "active");
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const searchAssignableUser_createServerFn_handler = createServerRpc({
  id: "7fccd54ef6e1c7e5c57b9aa4455bb70c1d066bedc807c0bb6a5e8632376af94e",
  name: "searchAssignableUser",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => searchAssignableUser.__executeServer(opts));
const searchAssignableUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  email: stringType().trim().email().max(254)
})).handler(searchAssignableUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const profile = await getProfileByEmail(data.email);
  if (!profile) throw new Error("No registered user found with that email");
  return {
    id: profile.id,
    email: profile.email ?? data.email,
    name: profile.name
  };
});
const assignUserToRoom_createServerFn_handler = createServerRpc({
  id: "a73865b71405be02da73230b8e9801dd311b78e93a55964f469f31601669ba43",
  name: "assignUserToRoom",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => assignUserToRoom.__executeServer(opts));
const assignUserToRoom = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  roomId: uuidSchema,
  userId: uuidSchema
})).handler(assignUserToRoom_createServerFn_handler, async ({
  data,
  context
}) => {
  const host = await requireActiveHost(data.buildingId, context.userId);
  await requireRoomInBuilding(data.roomId, data.buildingId);
  const {
    data: profile,
    error: profileError
  } = await supabaseAdmin.from("profiles").select("id").eq("id", data.userId).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error("Selected user is no longer available");
  const {
    data: buildingRooms,
    error: brErr
  } = await supabaseAdmin.from("rooms").select("id,room_number").eq("building_id", data.buildingId);
  if (brErr) throw new Error(brErr.message);
  const buildingRoomIds = (buildingRooms || []).map((r) => r.id);
  if (buildingRoomIds.length) {
    const {
      data: existing,
      error: exErr
    } = await supabaseAdmin.from("room_users").select("room_id").eq("user_id", data.userId).eq("status", "active").in("room_id", buildingRoomIds);
    if (exErr) throw new Error(exErr.message);
    const conflict = (existing || []).find((row) => row.room_id !== data.roomId);
    if (conflict) {
      const roomNumber = buildingRooms?.find((r) => r.id === conflict.room_id)?.room_number;
      throw new Error(`This user is already assigned to Room ${roomNumber} in this building.`);
    }
  }
  const {
    error: removeError
  } = await supabaseAdmin.from("room_users").update({
    status: "removed"
  }).eq("room_id", data.roomId).eq("status", "active");
  if (removeError) throw new Error(removeError.message);
  const {
    error
  } = await supabaseAdmin.from("room_users").insert({
    room_id: data.roomId,
    user_id: data.userId,
    assigned_by: host.id,
    status: "active"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMaintenanceData_createServerFn_handler = createServerRpc({
  id: "546294f48d6e172122bbf2ebda5fc415d6c6e5058e0f780f98130510a89d0ec5",
  name: "getMaintenanceData",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getMaintenanceData.__executeServer(opts));
const getMaintenanceData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(getMaintenanceData_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const [buildingResult, roomCountResult, categoriesResult] = await Promise.all([supabaseAdmin.from("buildings").select("name").eq("id", data.buildingId).maybeSingle(), supabaseAdmin.from("rooms").select("id", {
    count: "exact",
    head: true
  }).eq("building_id", data.buildingId).eq("is_active", true), supabaseAdmin.from("maintenance_categories").select("*").eq("building_id", data.buildingId).order("created_at")]);
  if (buildingResult.error) throw new Error(buildingResult.error.message);
  if (roomCountResult.error) throw new Error(roomCountResult.error.message);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  const categories = (categoriesResult.data || []).map((category) => ({
    ...category,
    total_amount: Number(category.total_amount),
    per_room_amount: Number(category.per_room_amount),
    penalty_amount: Number(category.penalty_amount)
  }));
  const qrUrls = {};
  for (const category of categories) {
    if (!category.qr_code_image) continue;
    const {
      data: signed
    } = await supabaseAdmin.storage.from("maintenance-qr").createSignedUrl(category.qr_code_image, 3600);
    if (signed?.signedUrl) qrUrls[category.id] = signed.signedUrl;
  }
  return {
    buildingName: buildingResult.data?.name ?? "",
    activeRoomCount: roomCountResult.count || 0,
    categories,
    qrUrls
  };
});
const saveMaintenanceCategory_createServerFn_handler = createServerRpc({
  id: "6899e72a7fae3265ccefb4d4abe6e7a5751e25b5bf80eae5426b3a8a2468f42f",
  name: "saveMaintenanceCategory",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => saveMaintenanceCategory.__executeServer(opts));
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
})).handler(saveMaintenanceCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    count,
    error: countError
  } = await supabaseAdmin.from("rooms").select("id", {
    count: "exact",
    head: true
  }).eq("building_id", data.buildingId).eq("is_active", true);
  if (countError) throw new Error(countError.message);
  const activeRoomCount = count || 0;
  const perRoomAmount = activeRoomCount > 0 ? Math.round(data.totalAmount / activeRoomCount * 100) / 100 : 0;
  const payload = {
    name: data.name.trim(),
    total_amount: data.totalAmount,
    per_room_amount: perRoomAmount,
    penalty_amount: data.penaltyAmount,
    upi_id: data.upiId?.trim() || null,
    qr_code_image: data.qrCodeImage
  };
  if (data.categoryId) {
    const {
      error: error2
    } = await supabaseAdmin.from("maintenance_categories").update(payload).eq("id", data.categoryId).eq("building_id", data.buildingId);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      perRoomAmount
    };
  }
  const {
    data: inserted,
    error
  } = await supabaseAdmin.from("maintenance_categories").insert({
    ...payload,
    building_id: data.buildingId,
    is_active: true
  }).select("id").single();
  if (error) throw new Error(error.message);
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const {
    data: activeRooms
  } = await supabaseAdmin.from("rooms").select("id").eq("building_id", data.buildingId).eq("is_active", true);
  if (activeRooms && activeRooms.length && inserted) {
    const {
      data: mm,
      error: mmErr
    } = await supabaseAdmin.from("monthly_maintenance").upsert({
      building_id: data.buildingId,
      category_id: inserted.id,
      month,
      total_amount: data.totalAmount,
      per_room_amount: perRoomAmount,
      penalty_amount: data.penaltyAmount,
      is_published: true,
      published_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "category_id,month"
    }).select("id").single();
    if (!mmErr && mm) {
      const rows = activeRooms.map((r) => ({
        building_id: data.buildingId,
        room_id: r.id,
        category_id: inserted.id,
        monthly_maintenance_id: mm.id,
        month,
        amount_due: perRoomAmount,
        penalty_amount: 0,
        total_due: perRoomAmount,
        payment_status: "not_paid"
      }));
      await supabaseAdmin.from("room_maintenance_status").upsert(rows, {
        onConflict: "monthly_maintenance_id,room_id",
        ignoreDuplicates: true
      });
    }
  }
  return {
    ok: true,
    perRoomAmount
  };
});
const toggleMaintenanceCategory_createServerFn_handler = createServerRpc({
  id: "c39042831883f4bc613b360e93f6f27848ebdf60b94874672a83544c67c08a39",
  name: "toggleMaintenanceCategory",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => toggleMaintenanceCategory.__executeServer(opts));
const toggleMaintenanceCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  categoryId: uuidSchema,
  isActive: booleanType()
})).handler(toggleMaintenanceCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    error
  } = await supabaseAdmin.from("maintenance_categories").update({
    is_active: data.isActive
  }).eq("id", data.categoryId).eq("building_id", data.buildingId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const applyCurrentMonthPenalties_createServerFn_handler = createServerRpc({
  id: "aa660a8c63240a80eb62e0036f156e31984240fefb85ef41de86e8a6b62841b2",
  name: "applyCurrentMonthPenalties",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => applyCurrentMonthPenalties.__executeServer(opts));
const applyCurrentMonthPenalties = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  month: stringType().trim().min(4).max(30)
})).handler(applyCurrentMonthPenalties_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("room_maintenance_status").select("id,amount_due,category_id,penalty_applied").eq("building_id", data.buildingId).eq("month", data.month).eq("payment_status", "not_paid");
  if (error) throw new Error(error.message);
  if (!rows?.length) return {
    updated: 0
  };
  const categoryIds = [...new Set(rows.map((row) => row.category_id))];
  const {
    data: categories,
    error: categoriesError
  } = await supabaseAdmin.from("maintenance_categories").select("id,penalty_amount").in("id", categoryIds);
  if (categoriesError) throw new Error(categoriesError.message);
  const penaltyMap = Object.fromEntries((categories || []).map((category) => [category.id, Number(category.penalty_amount)]));
  let updated = 0;
  for (const row of rows) {
    if (row.penalty_applied) continue;
    const penalty = penaltyMap[row.category_id] || 0;
    const {
      error: updateError
    } = await supabaseAdmin.from("room_maintenance_status").update({
      penalty_applied: true,
      penalty_amount: penalty,
      total_due: Number(row.amount_due) + penalty
    }).eq("id", row.id);
    if (updateError) throw new Error(updateError.message);
    updated += 1;
  }
  return {
    updated
  };
});
const getManageHostsData_createServerFn_handler = createServerRpc({
  id: "93c42ef5e2f6278adb23e3bbbc3072fad7bf01a8c73373479bdc80fe614b2f71",
  name: "getManageHostsData",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getManageHostsData.__executeServer(opts));
const getManageHostsData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(getManageHostsData_createServerFn_handler, async ({
  data,
  context
}) => {
  const myHost = await requireActiveHost(data.buildingId, context.userId);
  const [{
    data: building,
    error: buildingError
  }, {
    data: hostRows,
    error: hostsError
  }] = await Promise.all([supabaseAdmin.from("buildings").select("name,host_count").eq("id", data.buildingId).maybeSingle(), supabaseAdmin.from("hosts").select("id,user_id,is_primary,status").eq("building_id", data.buildingId)]);
  if (buildingError) throw new Error(buildingError.message);
  if (hostsError) throw new Error(hostsError.message);
  const activeHosts = (hostRows || []).filter((host) => host.status === "active");
  const userIds = activeHosts.map((host) => host.user_id);
  let profileMap = {};
  if (userIds.length) {
    const {
      data: profiles,
      error: profilesError
    } = await supabaseAdmin.from("profiles").select("id,email,name,mobile").in("id", userIds);
    if (profilesError) throw new Error(profilesError.message);
    profileMap = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
  }
  const hosts = activeHosts.map((host) => ({
    ...host,
    email: profileMap[host.user_id]?.email ?? null,
    name: profileMap[host.user_id]?.name ?? null,
    mobile: profileMap[host.user_id]?.mobile ?? null
  }));
  const {
    data: requests,
    error: requestsError
  } = await supabaseAdmin.from("host_requests").select("*").eq("building_id", data.buildingId).eq("status", "pending").order("created_at", {
    ascending: false
  });
  if (requestsError) throw new Error(requestsError.message);
  let votes = [];
  if (requests?.length) {
    const {
      data: voteRows,
      error: votesError
    } = await supabaseAdmin.from("host_request_votes").select("id,request_id,host_id,vote").in("request_id", requests.map((request) => request.id));
    if (votesError) throw new Error(votesError.message);
    votes = voteRows || [];
  }
  return {
    buildingName: building?.name ?? "",
    hostCount: building?.host_count ?? 1,
    myUserId: context.userId,
    myHostId: myHost.id,
    hosts,
    requests: requests || [],
    votes
  };
});
const requestAddBuildingHost_createServerFn_handler = createServerRpc({
  id: "aa595e694a95db546b70ff8eeaeefffa56ef5f4e62e0a8b0ee696becb7c8d4ce",
  name: "requestAddBuildingHost",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => requestAddBuildingHost.__executeServer(opts));
const requestAddBuildingHost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  email: stringType().trim().email().max(254),
  mobile: stringType().trim().min(5).max(20),
  google: stringType().trim().email().max(254)
})).handler(requestAddBuildingHost_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const profile = await getProfileByEmail(data.email);
  if (!profile) throw new Error("This person must register on BuildingCare first");
  if ((profile.mobile || "").trim() !== data.mobile.trim()) throw new Error("Mobile number does not match this user");
  const googleAccount = (profile.google_account || profile.email || "").trim().toLowerCase();
  if (googleAccount !== data.google.trim().toLowerCase()) throw new Error("Google account email does not match this user");
  const {
    data: existingHost,
    error: existingHostError
  } = await supabaseAdmin.from("hosts").select("id,status").eq("building_id", data.buildingId).eq("user_id", profile.id).maybeSingle();
  if (existingHostError) throw new Error(existingHostError.message);
  if (existingHost?.status === "active") throw new Error("This user is already an active host");
  const {
    data: existingRequest,
    error: existingRequestError
  } = await supabaseAdmin.from("host_requests").select("id").eq("building_id", data.buildingId).eq("request_type", "add_host").eq("status", "pending").ilike("new_user_email", data.email.trim().toLowerCase()).maybeSingle();
  if (existingRequestError) throw new Error(existingRequestError.message);
  if (existingRequest) throw new Error("A pending request already exists for this host");
  const {
    error
  } = await supabaseAdmin.from("host_requests").insert({
    building_id: data.buildingId,
    request_type: "add_host",
    requested_by: context.userId,
    new_user_email: data.email.trim().toLowerCase(),
    new_user_mobile: data.mobile.trim(),
    status: "pending"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const requestHostLimitChange_createServerFn_handler = createServerRpc({
  id: "3c91e3d0c9dfe900910ddfa22fe58f21c64f079a853a92878bc8cc684611e031",
  name: "requestHostLimitChange",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => requestHostLimitChange.__executeServer(opts));
const requestHostLimitChange = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  limit: numberType().int().min(1).max(5)
})).handler(requestHostLimitChange_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    error
  } = await supabaseAdmin.from("host_requests").insert({
    building_id: data.buildingId,
    request_type: "change_host_count",
    requested_by: context.userId,
    new_user_email: String(data.limit),
    status: "pending"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const voteOnHostRequest_createServerFn_handler = createServerRpc({
  id: "a40a7368d68b36646e9430f06c506b201fda35925c88905906fe0f8436530518",
  name: "voteOnHostRequest",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => voteOnHostRequest.__executeServer(opts));
const voteOnHostRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  requestId: uuidSchema,
  vote: enumType(["agree", "disagree"])
})).handler(voteOnHostRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const host = await requireActiveHost(data.buildingId, context.userId);
  const {
    data: request,
    error: requestError
  } = await supabaseAdmin.from("host_requests").select("id,building_id,status").eq("id", data.requestId).eq("building_id", data.buildingId).maybeSingle();
  if (requestError) throw new Error(requestError.message);
  if (!request || request.status !== "pending") throw new Error("This request is no longer pending");
  const {
    data: existingVote,
    error: existingVoteError
  } = await supabaseAdmin.from("host_request_votes").select("id").eq("request_id", data.requestId).eq("host_id", host.id).maybeSingle();
  if (existingVoteError) throw new Error(existingVoteError.message);
  if (existingVote) throw new Error("You already voted on this request");
  const {
    error
  } = await supabaseAdmin.from("host_request_votes").insert({
    request_id: data.requestId,
    host_id: host.id,
    vote: data.vote
  });
  if (error) throw new Error(error.message);
  await evaluateHostRequest(data.requestId);
  return {
    ok: true
  };
});
const transferHostPosition_createServerFn_handler = createServerRpc({
  id: "c5cbc529e76c21d244ad94ca46053ac6e50d4e8b47c087af5a7f63a548881dd2",
  name: "transferHostPosition",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => transferHostPosition.__executeServer(opts));
const transferHostPosition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  hostId: uuidSchema,
  email: stringType().trim().email().max(254),
  mobile: stringType().trim().min(5).max(20),
  google: stringType().trim().email().max(254)
})).handler(transferHostPosition_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    data: hostToTransfer,
    error: hostError
  } = await supabaseAdmin.from("hosts").select("id,user_id,is_primary,status").eq("id", data.hostId).eq("building_id", data.buildingId).eq("user_id", context.userId).eq("status", "active").maybeSingle();
  if (hostError) throw new Error(hostError.message);
  if (!hostToTransfer) throw new Error("You can only transfer your own active host position");
  const profile = await getProfileByEmail(data.email);
  if (!profile) throw new Error("This person must register on BuildingCare first");
  if ((profile.mobile || "").trim() !== data.mobile.trim()) throw new Error("Mobile number does not match this user");
  const googleAccount = (profile.google_account || profile.email || "").trim().toLowerCase();
  if (googleAccount !== data.google.trim().toLowerCase()) throw new Error("Google account email does not match this user");
  const {
    error: removeError
  } = await supabaseAdmin.from("hosts").update({
    status: "removed",
    is_primary: false
  }).eq("id", hostToTransfer.id);
  if (removeError) throw new Error(removeError.message);
  const {
    data: existing,
    error: existingError
  } = await supabaseAdmin.from("hosts").select("id").eq("building_id", data.buildingId).eq("user_id", profile.id).maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) {
    const {
      error
    } = await supabaseAdmin.from("hosts").update({
      status: "active",
      is_primary: hostToTransfer.is_primary
    }).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabaseAdmin.from("hosts").insert({
      building_id: data.buildingId,
      user_id: profile.id,
      is_primary: hostToTransfer.is_primary,
      status: "active"
    });
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const ensureMyBills_createServerFn_handler = createServerRpc({
  id: "b3548dcb376c68d3cf6ec8db3af704a6a98a188a604d94efe29add149e77fd3d",
  name: "ensureMyBills",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => ensureMyBills.__executeServer(opts));
const ensureMyBills = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  month: stringType().trim().min(6).max(10)
})).handler(ensureMyBills_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: assignments,
    error: assignmentError
  } = await supabaseAdmin.from("room_users").select("room_id").eq("user_id", context.userId).eq("status", "active");
  if (assignmentError) throw new Error(assignmentError.message);
  const assignedRoomIds = (assignments || []).map((assignment) => assignment.room_id);
  if (!assignedRoomIds.length) return {
    created: 0
  };
  const {
    data: rooms,
    error: roomError
  } = await supabaseAdmin.from("rooms").select("id").in("id", assignedRoomIds).eq("building_id", data.buildingId).eq("is_active", true).limit(1);
  if (roomError) throw new Error(roomError.message);
  const room = rooms?.[0];
  if (!room) return {
    created: 0
  };
  const {
    data: cats
  } = await supabaseAdmin.from("maintenance_categories").select("id,per_room_amount,total_amount,penalty_amount").eq("building_id", data.buildingId).eq("is_active", true);
  if (!cats?.length) return {
    created: 0
  };
  let created = 0;
  for (const cat of cats) {
    let {
      data: mm
    } = await supabaseAdmin.from("monthly_maintenance").select("id").eq("category_id", cat.id).eq("month", data.month).maybeSingle();
    if (!mm) {
      const {
        data: ins,
        error: monthlyError
      } = await supabaseAdmin.from("monthly_maintenance").insert({
        building_id: data.buildingId,
        category_id: cat.id,
        month: data.month,
        total_amount: cat.total_amount,
        per_room_amount: cat.per_room_amount,
        penalty_amount: cat.penalty_amount,
        is_published: true,
        published_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id").maybeSingle();
      if (monthlyError) throw new Error(monthlyError.message);
      mm = ins ?? null;
    }
    if (!mm) continue;
    const {
      data: existing
    } = await supabaseAdmin.from("room_maintenance_status").select("id").eq("monthly_maintenance_id", mm.id).eq("room_id", room.id).maybeSingle();
    if (existing) continue;
    const amount = Number(cat.per_room_amount) || 0;
    const {
      error
    } = await supabaseAdmin.from("room_maintenance_status").insert({
      building_id: data.buildingId,
      room_id: room.id,
      category_id: cat.id,
      monthly_maintenance_id: mm.id,
      month: data.month,
      amount_due: amount,
      penalty_amount: 0,
      total_due: amount,
      payment_status: "not_paid"
    });
    if (error) throw new Error(error.message);
    created += 1;
  }
  return {
    created
  };
});
const monthInput = objectType({
  buildingId: uuidSchema,
  month: stringType().trim().min(6).max(10)
});
async function syncBillingForMonth(buildingId, month) {
  const [{
    data: cats
  }, {
    data: rooms
  }] = await Promise.all([supabaseAdmin.from("maintenance_categories").select("id,name,total_amount,per_room_amount,penalty_amount").eq("building_id", buildingId).eq("is_active", true), supabaseAdmin.from("rooms").select("id").eq("building_id", buildingId).eq("is_active", true)]);
  const activeRooms = rooms || [];
  let created = 0;
  for (const cat of cats || []) {
    const perRoom = activeRooms.length > 0 ? Math.round(Number(cat.total_amount) / activeRooms.length * 100) / 100 : Number(cat.per_room_amount) || 0;
    let {
      data: mm
    } = await supabaseAdmin.from("monthly_maintenance").select("id").eq("category_id", cat.id).eq("month", month).maybeSingle();
    if (!mm) {
      const {
        data: ins,
        error
      } = await supabaseAdmin.from("monthly_maintenance").insert({
        building_id: buildingId,
        category_id: cat.id,
        month,
        total_amount: Number(cat.total_amount),
        per_room_amount: perRoom,
        penalty_amount: Number(cat.penalty_amount),
        is_published: true,
        published_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id").maybeSingle();
      if (error) throw new Error(error.message);
      mm = ins ?? null;
    }
    if (!mm) continue;
    const {
      data: existing
    } = await supabaseAdmin.from("room_maintenance_status").select("room_id").eq("monthly_maintenance_id", mm.id);
    const have = new Set((existing || []).map((r) => r.room_id));
    const missing = activeRooms.filter((r) => !have.has(r.id));
    if (missing.length) {
      const {
        error
      } = await supabaseAdmin.from("room_maintenance_status").insert(missing.map((r) => ({
        building_id: buildingId,
        room_id: r.id,
        category_id: cat.id,
        monthly_maintenance_id: mm.id,
        month,
        amount_due: perRoom,
        penalty_amount: 0,
        total_due: perRoom,
        payment_status: "not_paid"
      })));
      if (error) throw new Error(error.message);
      created += missing.length;
    }
  }
  return created;
}
const getMonthlyBillingData_createServerFn_handler = createServerRpc({
  id: "41e02e35abed7f8b7826f51b44f07367e171d08634e9ab1bf9ad1f89ccec7a0f",
  name: "getMonthlyBillingData",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getMonthlyBillingData.__executeServer(opts));
const getMonthlyBillingData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(monthInput).handler(getMonthlyBillingData_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  await syncBillingForMonth(data.buildingId, data.month);
  const [{
    data: cats
  }, {
    data: rooms
  }, {
    data: statuses
  }] = await Promise.all([supabaseAdmin.from("maintenance_categories").select("id,name,total_amount,per_room_amount,penalty_amount").eq("building_id", data.buildingId).eq("is_active", true).order("created_at"), supabaseAdmin.from("rooms").select("id,room_number").eq("building_id", data.buildingId).eq("is_active", true), supabaseAdmin.from("room_maintenance_status").select("id,room_id,category_id,amount_due,penalty_amount,total_due,payment_status,payment_requested_at,verified_at").eq("building_id", data.buildingId).eq("month", data.month)]);
  const roomMap = Object.fromEntries((rooms || []).map((r) => [r.id, r.room_number]));
  const catMap = Object.fromEntries((cats || []).map((c) => [c.id, c.name]));
  return {
    activeRoomCount: (rooms || []).length,
    categories: (cats || []).map((c) => ({
      id: c.id,
      name: c.name,
      total_amount: Number(c.total_amount),
      per_room_amount: Number(c.per_room_amount),
      penalty_amount: Number(c.penalty_amount)
    })),
    rows: (statuses || []).map((s) => ({
      id: s.id,
      room_number: roomMap[s.room_id] || "?",
      category_id: s.category_id,
      category_name: catMap[s.category_id] || "?",
      amount_due: Number(s.amount_due),
      penalty_amount: Number(s.penalty_amount),
      total_due: Number(s.total_due),
      payment_status: s.payment_status,
      payment_requested_at: s.payment_requested_at,
      verified_at: s.verified_at
    }))
  };
});
const getBillingStats_createServerFn_handler = createServerRpc({
  id: "6456e2a6401dbe8579ac28042b1660f43dc1d86dd4106f530bc13120249efd51",
  name: "getBillingStats",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getBillingStats.__executeServer(opts));
const getBillingStats = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(monthInput).handler(getBillingStats_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("room_maintenance_status").select("payment_status,total_due").eq("building_id", data.buildingId).eq("month", data.month);
  if (error) throw new Error(error.message);
  const list = rows || [];
  return {
    pending: list.filter((r) => r.payment_status === "pending_verification").length,
    verified: list.filter((r) => r.payment_status === "paid").length,
    unpaid: list.filter((r) => r.payment_status === "not_paid").length,
    collected: list.filter((r) => r.payment_status === "paid").reduce((sum, r) => sum + Number(r.total_due), 0),
    expected: list.reduce((sum, r) => sum + Number(r.total_due), 0)
  };
});
const decidePaymentVerification_createServerFn_handler = createServerRpc({
  id: "b6bbaa9115f26649a6a4fa60d9b7c4f0f421977f11eabbcadcdb6728201d3d6d",
  name: "decidePaymentVerification",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => decidePaymentVerification.__executeServer(opts));
const decidePaymentVerification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  statusId: uuidSchema,
  approve: booleanType()
})).handler(decidePaymentVerification_createServerFn_handler, async ({
  data,
  context
}) => {
  const host = await requireActiveHost(data.buildingId, context.userId);
  const payload = data.approve ? {
    payment_status: "paid",
    verified_at: (/* @__PURE__ */ new Date()).toISOString(),
    verified_by: host.id
  } : {
    payment_status: "not_paid",
    payment_requested_at: null,
    verified_at: null
  };
  const {
    error
  } = await supabaseAdmin.from("room_maintenance_status").update(payload).eq("id", data.statusId).eq("building_id", data.buildingId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const resetMonthlyBilling_createServerFn_handler = createServerRpc({
  id: "a792a2d51b32592674b441cb5a90b6ee89a79fd105304119fae5ff2a178e96f3",
  name: "resetMonthlyBilling",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => resetMonthlyBilling.__executeServer(opts));
const resetMonthlyBilling = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(monthInput).handler(resetMonthlyBilling_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    error: statusError
  } = await supabaseAdmin.from("room_maintenance_status").delete().eq("building_id", data.buildingId).eq("month", data.month);
  if (statusError) throw new Error(statusError.message);
  const {
    error: monthlyError
  } = await supabaseAdmin.from("monthly_maintenance").delete().eq("building_id", data.buildingId).eq("month", data.month);
  if (monthlyError) throw new Error(monthlyError.message);
  const created = await syncBillingForMonth(data.buildingId, data.month);
  return {
    created
  };
});
const getBuildingDirectory_createServerFn_handler = createServerRpc({
  id: "4f59f7dd7924802a86f71bb965b54d905bf6c300c4c8bb274759c46e0d7bb741",
  name: "getBuildingDirectory",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getBuildingDirectory.__executeServer(opts));
const getBuildingDirectory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(getBuildingDirectory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: hostRows,
    error: hostError
  } = await supabaseAdmin.from("hosts").select("user_id,is_primary,status").eq("building_id", data.buildingId).eq("status", "active");
  if (hostError) throw new Error(hostError.message);
  const {
    data: rooms,
    error: roomsError
  } = await supabaseAdmin.from("rooms").select("id,room_number").eq("building_id", data.buildingId);
  if (roomsError) throw new Error(roomsError.message);
  const roomIds = (rooms || []).map((room) => room.id);
  let residentRows = [];
  if (roomIds.length) {
    const {
      data: ru,
      error: ruError
    } = await supabaseAdmin.from("room_users").select("user_id,room_id").eq("status", "active").in("room_id", roomIds);
    if (ruError) throw new Error(ruError.message);
    residentRows = ru || [];
  }
  const isMember = (hostRows || []).some((h) => h.user_id === context.userId) || residentRows.some((r) => r.user_id === context.userId);
  if (!isMember) throw new Error("You are not a member of this building");
  const userIds = [.../* @__PURE__ */ new Set([...(hostRows || []).map((h) => h.user_id), ...residentRows.map((r) => r.user_id)])];
  let profileMap = {};
  if (userIds.length) {
    const {
      data: profiles,
      error: profilesError
    } = await supabaseAdmin.from("profiles").select("id,name,email").in("id", userIds);
    if (profilesError) throw new Error(profilesError.message);
    profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, {
      name: p.name,
      email: p.email
    }]));
  }
  const roomNumberById = Object.fromEntries((rooms || []).map((r) => [r.id, r.room_number]));
  return {
    hosts: (hostRows || []).map((h) => ({
      user_id: h.user_id,
      is_primary: h.is_primary,
      name: profileMap[h.user_id]?.name ?? null,
      email: profileMap[h.user_id]?.email ?? null
    })),
    residents: residentRows.map((r) => ({
      user_id: r.user_id,
      room_number: roomNumberById[r.room_id] ?? null,
      name: profileMap[r.user_id]?.name ?? null,
      email: profileMap[r.user_id]?.email ?? null
    }))
  };
});
const getBuildingResidents_createServerFn_handler = createServerRpc({
  id: "17206ed9eae4cb10ad8ee181ed08f96b94081eeb67e61994a2483f1b109c7d60",
  name: "getBuildingResidents",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => getBuildingResidents.__executeServer(opts));
const getBuildingResidents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(buildingInput).handler(getBuildingResidents_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    data: rooms,
    error: roomsError
  } = await supabaseAdmin.from("rooms").select("id,room_number").eq("building_id", data.buildingId);
  if (roomsError) throw new Error(roomsError.message);
  const roomIds = (rooms || []).map((r) => r.id);
  if (!roomIds.length) return {
    residents: []
  };
  const {
    data: ru,
    error: ruError
  } = await supabaseAdmin.from("room_users").select("id,user_id,room_id").eq("status", "active").in("room_id", roomIds);
  if (ruError) throw new Error(ruError.message);
  const userIds = [...new Set((ru || []).map((r) => r.user_id))];
  let profileMap = {};
  if (userIds.length) {
    const {
      data: profiles,
      error: profilesError
    } = await supabaseAdmin.from("profiles").select("id,name,email,mobile").in("id", userIds);
    if (profilesError) throw new Error(profilesError.message);
    profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  }
  const {
    data: hostRows,
    error: hostRowsError
  } = await supabaseAdmin.from("hosts").select("user_id,status").eq("building_id", data.buildingId).eq("status", "active");
  if (hostRowsError) throw new Error(hostRowsError.message);
  const hostIds = new Set((hostRows || []).map((h) => h.user_id));
  const roomNumberById = Object.fromEntries((rooms || []).map((r) => [r.id, r.room_number]));
  return {
    residents: (ru || []).map((r) => ({
      ru_id: r.id,
      user_id: r.user_id,
      room_id: r.room_id,
      room_number: roomNumberById[r.room_id] ?? "?",
      name: profileMap[r.user_id]?.name ?? null,
      email: profileMap[r.user_id]?.email ?? null,
      mobile: profileMap[r.user_id]?.mobile ?? null,
      is_host: hostIds.has(r.user_id)
    }))
  };
});
const promoteResidentToHost_createServerFn_handler = createServerRpc({
  id: "da8d238557e4f0e257e2258e38fd163f4e224dc5fa2d7835afdb43418fa8b484",
  name: "promoteResidentToHost",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => promoteResidentToHost.__executeServer(opts));
const promoteResidentToHost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  buildingId: uuidSchema,
  userId: uuidSchema
})).handler(promoteResidentToHost_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireActiveHost(data.buildingId, context.userId);
  const {
    data: rooms,
    error: roomsError
  } = await supabaseAdmin.from("rooms").select("id").eq("building_id", data.buildingId);
  if (roomsError) throw new Error(roomsError.message);
  const roomIds = (rooms || []).map((r) => r.id);
  const {
    data: membership,
    error: membershipError
  } = await supabaseAdmin.from("room_users").select("id").eq("user_id", data.userId).eq("status", "active").in("room_id", roomIds.length ? roomIds : ["00000000-0000-0000-0000-000000000000"]).maybeSingle();
  if (membershipError) throw new Error(membershipError.message);
  if (!membership) throw new Error("This person is not an active resident of this building");
  const {
    data: existing,
    error: existingError
  } = await supabaseAdmin.from("hosts").select("id,status").eq("building_id", data.buildingId).eq("user_id", data.userId).maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing?.status === "active") throw new Error("This person is already a host");
  const {
    count,
    error: countError
  } = await supabaseAdmin.from("hosts").select("id", {
    count: "exact",
    head: true
  }).eq("building_id", data.buildingId).eq("status", "active");
  if (countError) throw new Error(countError.message);
  const {
    data: building,
    error: buildingError
  } = await supabaseAdmin.from("buildings").select("host_count,name").eq("id", data.buildingId).maybeSingle();
  if (buildingError) throw new Error(buildingError.message);
  const nextCount = (count || 0) + 1;
  if (nextCount > (building?.host_count || 1)) {
    if (nextCount > 5) throw new Error("A building can have at most 5 hosts");
    const {
      error
    } = await supabaseAdmin.from("buildings").update({
      host_count: nextCount
    }).eq("id", data.buildingId);
    if (error) throw new Error(error.message);
  }
  if (existing) {
    const {
      error
    } = await supabaseAdmin.from("hosts").update({
      status: "active",
      is_primary: false
    }).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabaseAdmin.from("hosts").insert({
      building_id: data.buildingId,
      user_id: data.userId,
      is_primary: false,
      status: "active"
    });
    if (error) throw new Error(error.message);
  }
  const {
    error: notifError
  } = await supabaseAdmin.from("notifications").insert({
    building_id: data.buildingId,
    receiver_id: data.userId,
    type: "host_request",
    title: "You are now a host",
    message: `You've been made a host of ${building?.name ?? "this building"}. You can manage rooms, maintenance and payments.`
  });
  if (notifError) throw new Error(notifError.message);
  return {
    ok: true
  };
});
const registerNewBuilding_createServerFn_handler = createServerRpc({
  id: "794b172deab1f76249f214617b48a3fcf4127abb3111cd250c8be8d832711817",
  name: "registerNewBuilding",
  filename: "src/lib/building-management.functions.ts"
}, (opts) => registerNewBuilding.__executeServer(opts));
const registerNewBuilding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(objectType({
  name: stringType().trim().min(1).max(100),
  location: stringType().trim().min(1).max(200),
  hostCount: numberType().int().min(1).max(5).default(1),
  activeRole: enumType(["host", "resident"]).optional()
})).handler(registerNewBuilding_createServerFn_handler, async ({
  data,
  context
}) => {
  let userRole = data.activeRole || context.claims?.user_metadata?.role;
  if (!userRole) {
    const {
      data: userRes
    } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    userRole = userRes?.user?.user_metadata?.role;
  }
  if (userRole === "resident" || userRole && userRole !== "host") {
    throw new Response(JSON.stringify({
      error: "Forbidden: Only users with an active Host role are authorized to register buildings",
      statusCode: 403
    }), {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  let createdBuilding = null;
  let lastError = null;
  for (let i = 0; i < 10; i++) {
    const code = generateBuildingCode();
    const {
      data: b,
      error
    } = await supabaseAdmin.from("buildings").insert({
      name: data.name.trim(),
      location: data.location.trim(),
      unique_code: code,
      host_count: data.hostCount,
      created_by: context.userId
    }).select("id, name, unique_code").single();
    if (error) {
      lastError = error.message;
      if (error.code !== "23505") break;
      continue;
    }
    const {
      error: hostErr
    } = await supabaseAdmin.from("hosts").insert({
      building_id: b.id,
      user_id: context.userId,
      is_primary: true,
      status: "active"
    });
    if (hostErr) {
      throw new Error(hostErr.message);
    }
    createdBuilding = b;
    break;
  }
  if (!createdBuilding) {
    throw new Error(lastError || "Could not create building");
  }
  return {
    ok: true,
    building: createdBuilding
  };
});
export {
  addRoomToBuilding_createServerFn_handler,
  applyCurrentMonthPenalties_createServerFn_handler,
  assignUserToRoom_createServerFn_handler,
  decidePaymentVerification_createServerFn_handler,
  ensureMyBills_createServerFn_handler,
  getBillingStats_createServerFn_handler,
  getBuildingDirectory_createServerFn_handler,
  getBuildingResidents_createServerFn_handler,
  getMaintenanceData_createServerFn_handler,
  getManageHostsData_createServerFn_handler,
  getManageRoomsData_createServerFn_handler,
  getMonthlyBillingData_createServerFn_handler,
  promoteResidentToHost_createServerFn_handler,
  registerNewBuilding_createServerFn_handler,
  removeRoomUser_createServerFn_handler,
  requestAddBuildingHost_createServerFn_handler,
  requestHostLimitChange_createServerFn_handler,
  resetMonthlyBilling_createServerFn_handler,
  saveMaintenanceCategory_createServerFn_handler,
  searchAssignableUser_createServerFn_handler,
  toggleMaintenanceCategory_createServerFn_handler,
  toggleRoomActive_createServerFn_handler,
  transferHostPosition_createServerFn_handler,
  voteOnHostRequest_createServerFn_handler
};
