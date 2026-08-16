globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HookableCore } from "./_libs/hookable.mjs";
import { d as defineLazyEventHandler, H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { a as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/icon-512.png": {
    "type": "image/png",
    "etag": '"309e-eLUTqV4Cfm2l9COek6MMbLzVYOw"',
    "mtime": "2026-08-08T20:46:02.280Z",
    "size": 12446,
    "path": "../public/icon-512.png"
  },
  "/assets/alert-dialog-tA7jVXHy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13a4-EgWqZcp7L0l7JnMYwlNaIu0kIus"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 5028,
    "path": "../public/assets/alert-dialog-tA7jVXHy.js"
  },
  "/assets/arrow-left-CbUIvhLh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a7-lHoEuk8auG78eDsikc0TAFvracY"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 167,
    "path": "../public/assets/arrow-left-CbUIvhLh.js"
  },
  "/assets/badge-Ds8Gwev2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f3-yheiu1t3cSqTtFw6M0I4bbIRkPw"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 755,
    "path": "../public/assets/badge-Ds8Gwev2.js"
  },
  "/assets/auth-BX5caHFj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"40f7-DbOm8EoF4Hq3NaXctD9FjbcpNPc"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 16631,
    "path": "../public/assets/auth-BX5caHFj.js"
  },
  "/assets/building-management.functions-CefTTVfH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1dcd-vPpWEtIh8aou+KlUQvAFt4UQ3FY"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 7629,
    "path": "../public/assets/building-management.functions-CefTTVfH.js"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": '"202-ZBCuTyrV16e0gYfM2Ld0vbSKJI8"',
    "mtime": "2026-08-08T20:46:02.280Z",
    "size": 514,
    "path": "../public/manifest.webmanifest"
  },
  "/assets/building-2-BPjSA7D6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17c-+eUCGolo+Cw+kIT1q2VQApJQU5w"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 380,
    "path": "../public/assets/building-2-BPjSA7D6.js"
  },
  "/icon-192.png": {
    "type": "image/png",
    "etag": '"309b-Mk5Xt7wBnK0LLQhuVguMgTlfhpg"',
    "mtime": "2026-08-08T20:46:02.296Z",
    "size": 12443,
    "path": "../public/icon-192.png"
  },
  "/assets/building-photo-DNFKpA5X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"317-p5nJfKpMuReK/AF37im8ilqQIsY"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 791,
    "path": "../public/assets/building-photo-DNFKpA5X.js"
  },
  "/assets/building._id_.chat-TSXF1ENt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"195f-ZGrEid9ooDqZNAVMYq2W7WDudpM"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 6495,
    "path": "../public/assets/building._id_.chat-TSXF1ENt.js"
  },
  "/assets/building._id_.hosts-CKVVkjJr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2464-o68A85p35Fhe26Qr87fGjoqwtAU"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 9316,
    "path": "../public/assets/building._id_.hosts-CKVVkjJr.js"
  },
  "/assets/building._id_.notifications-EgljAqtf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2300-P3CvvP2drKxFgYMiR6IcbjGDQg4"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 8960,
    "path": "../public/assets/building._id_.notifications-EgljAqtf.js"
  },
  "/assets/BuildingPhoto-DmZln_L1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"72f-aXif+DfOdUJepoNzH+5+ntGifyw"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 1839,
    "path": "../public/assets/BuildingPhoto-DmZln_L1.js"
  },
  "/assets/card-Dw048Sa5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3fb-U2s/9G2QnJyort8rb4qc17aUKbQ"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 1019,
    "path": "../public/assets/card-Dw048Sa5.js"
  },
  "/assets/building._id_.maintenance-CdIDCWei.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fcc-2SMkLemf7ZDHhCGmLeJwaAPecQI"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 8140,
    "path": "../public/assets/building._id_.maintenance-CdIDCWei.js"
  },
  "/assets/building._id_.rooms-B8CWLiro.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"49fb-wcP7MIVKfQEklkRaO7GpQjBDR94"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 18939,
    "path": "../public/assets/building._id_.rooms-B8CWLiro.js"
  },
  "/assets/building._id-Bymgugkq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"170a1-YOMyqUUAicV/R6d2C0PrD17wrCg"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 94369,
    "path": "../public/assets/building._id-Bymgugkq.js"
  },
  "/assets/button-DAh3yLko.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7fce-rvfu47azET8bpuZzY0sr7LVM++Q"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 32718,
    "path": "../public/assets/button-DAh3yLko.js"
  },
  "/assets/chevron-right-CdR4joxr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"84-ZeXuCEm+XbK4Xs1l0Nau29B/A+U"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 132,
    "path": "../public/assets/chevron-right-CdR4joxr.js"
  },
  "/assets/crown-k6-67lP2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"167-hcmaplm8eOY9eShHqvEo7Lycras"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 359,
    "path": "../public/assets/crown-k6-67lP2.js"
  },
  "/assets/dashboard-CGovzvRD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1188-IAfPkWsXfNV5DNc3zn3r12+PQxc"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 4488,
    "path": "../public/assets/dashboard-CGovzvRD.js"
  },
  "/assets/dialog-CxcRy0tM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"211a-V5yD1aamqh4lfx1FX1a/b/uNxqI"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 8474,
    "path": "../public/assets/dialog-CxcRy0tM.js"
  },
  "/assets/house-DwCMUZAe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"116-GqQZcpzFJ2pMdwbj5vRxg+W1i+E"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 278,
    "path": "../public/assets/house-DwCMUZAe.js"
  },
  "/assets/index-Bd_6MEkU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d7a-V+urazqi3GJ7eB2vQrtBqUZkbmE"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 19834,
    "path": "../public/assets/index-Bd_6MEkU.js"
  },
  "/assets/index-BzC3QfFL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a81-jTxSxLM/R/JvUCl33k+oLkEU2no"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 2689,
    "path": "../public/assets/index-BzC3QfFL.js"
  },
  "/assets/index-D4GbsHd_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5a4-TqL7jnDtg24pnS8HIKKE/8s4qE4"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 1444,
    "path": "../public/assets/index-D4GbsHd_.js"
  },
  "/assets/input-Lis8lbqm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24f-6iIjN0c5YExb0ZTUbcjhuOsPFEY"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 591,
    "path": "../public/assets/input-Lis8lbqm.js"
  },
  "/assets/label-CpLp262J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"38f-jMSnjID+I+8cYdbPS7pYCGKG6Fs"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 911,
    "path": "../public/assets/label-CpLp262J.js"
  },
  "/assets/index-DLa5yOvd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11ce-1kccHfgwu3BGszwznMtHTsIMKv8"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 4558,
    "path": "../public/assets/index-DLa5yOvd.js"
  },
  "/assets/index-noPYalxw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"832-yTI6RlwlugT3UMm5Zyz0u+8sjYk"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 2098,
    "path": "../public/assets/index-noPYalxw.js"
  },
  "/assets/loader-circle-cYaPjWdz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92-MWwiTt/LXTbuHxw1b+HH1gqsW1w"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 146,
    "path": "../public/assets/loader-circle-cYaPjWdz.js"
  },
  "/assets/log-out-BudJzbpp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e8-NQSBbTud/BGRROJ/4Hc54ny6Rds"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 232,
    "path": "../public/assets/log-out-BudJzbpp.js"
  },
  "/assets/money-CMvmIr9m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"305-nt7J155dTbOH8uKecFfIVEqm7Ko"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 773,
    "path": "../public/assets/money-CMvmIr9m.js"
  },
  "/assets/map-pin-Cv70xeds.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"105-FJqKh8z8MZAFYSnBxMRBFA6uHew"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 261,
    "path": "../public/assets/map-pin-Cv70xeds.js"
  },
  "/assets/notifications-B6idMg_4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3e7-zGPxVB/ukh6OiJ0U6hHiwj2VwJY"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 999,
    "path": "../public/assets/notifications-B6idMg_4.js"
  },
  "/assets/pencil-DU-zCpol.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ee-MbJvyXM5t+5ZMHeEKOmJwiO1WaM"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 494,
    "path": "../public/assets/pencil-DU-zCpol.js"
  },
  "/assets/plus-DfO50YS3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9b-+oaHzoEigT15s9sdsGl6K1lswI8"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 155,
    "path": "../public/assets/plus-DfO50YS3.js"
  },
  "/assets/profile-CGRVM7Oj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2914-70iA0OizVHjt+t9n7b8xKN8RgEY"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 10516,
    "path": "../public/assets/profile-CGRVM7Oj.js"
  },
  "/assets/register-building-BF_z6wtR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17ec-aOCJMrvDufNJkQWahv1F/kbJ7eQ"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 6124,
    "path": "../public/assets/register-building-BF_z6wtR.js"
  },
  "/assets/reset-password-0bMnUxyC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81c-D4ggMsQsVQ9nlqQPN/xQdmQSnpA"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 2076,
    "path": "../public/assets/reset-password-0bMnUxyC.js"
  },
  "/assets/route-Dpyf7MFP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"899-fppILtJ3fdzu+dci/gezK/Tjx4Q"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 2201,
    "path": "../public/assets/route-Dpyf7MFP.js"
  },
  "/assets/search-7HO8hlvp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e8d-XCJUYoei2po4T2rBiqY3SkRAT3U"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 3725,
    "path": "../public/assets/search-7HO8hlvp.js"
  },
  "/assets/send-C5LtgbBb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f-ToWZJgP9I944G8sG2yJZq1NADaQ"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 287,
    "path": "../public/assets/send-C5LtgbBb.js"
  },
  "/assets/select-BV-M-mZZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c40e-ILHazt9QLJN6YthXsERN4k8JMXY"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 50190,
    "path": "../public/assets/select-BV-M-mZZ.js"
  },
  "/assets/search-BHDDlweF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-AvUa0IpNPbU2dljE6kzNFGqyVlA"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 176,
    "path": "../public/assets/search-BHDDlweF.js"
  },
  "/assets/trash-2-DvPVNChI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"145-G2MSp9UNUp8pJkKxlW+/WvYvYp8"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 325,
    "path": "../public/assets/trash-2-DvPVNChI.js"
  },
  "/assets/use-require-host-CWRmcmWv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"252-b4+Ml3IgttympELwDGyl8sRdn64"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 594,
    "path": "../public/assets/use-require-host-CWRmcmWv.js"
  },
  "/assets/styles-DdBhnPn9.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"14b3d-DO/GXl5ZAsF0GCF7UIAa9ilRMqo"',
    "mtime": "2026-08-16T07:25:24.093Z",
    "size": 84797,
    "path": "../public/assets/styles-DdBhnPn9.css"
  },
  "/assets/index-Ch2-DtcY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94034-k2BY5pXwzXbYzPMjUL4GXFWDsdk"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 606260,
    "path": "../public/assets/index-Ch2-DtcY.js"
  },
  "/assets/user-CSiu1Ygf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c6-pvbwhdZPTcG9v6OwmdRsqYLGbn0"',
    "mtime": "2026-08-16T07:25:24.099Z",
    "size": 198,
    "path": "../public/assets/user-CSiu1Ygf.js"
  },
  "/assets/users-round-ZGn-gtRa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c7-jInW3C702hUz1zCGUvx5HTNTcX0"',
    "mtime": "2026-08-16T07:25:24.100Z",
    "size": 455,
    "path": "../public/assets/users-round-ZGn-gtRa.js"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_FfqPep = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_FfqPep };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
