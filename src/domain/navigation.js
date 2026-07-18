export const RESTORABLE_PAGES = new Set([
  "dashboard", "legalEditor", "editor", "templates", "profile", "preview", "checkout",
]);

export const PUBLIC_PAGES = new Set(["landing", "login", "authCallback"]);

export const PAGE_TO_PATH = Object.freeze({
  landing: "/", login: "/login", authCallback: "/auth/callback",
  completeProfile: "/complete-profile", welcome: "/welcome", dashboard: "/dashboard",
  templates: "/templates", editor: "/editor", preview: "/preview", checkout: "/checkout",
  profile: "/profile", legalEditor: "/legal-editor", admin: "/admin",
});

export const PATH_TO_PAGE = Object.freeze(Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page]),
));

export function hasAuthenticationResponse(hash = "") {
  return ["access_token", "refresh_token", "type=recovery", "error_description"]
    .some((marker) => hash.includes(marker));
}

export function resolveInitialPage(pathname = "/", hash = "") {
  if (hasAuthenticationResponse(hash) || pathname === "/auth/callback") return "authCallback";
  if (pathname === "/" || pathname === "") return "landing";
  return PATH_TO_PAGE[pathname] || "landing";
}

export function resolveHistoryIndex(state) {
  return Number.isInteger(state?.appIndex) && state.appIndex >= 0 ? state.appIndex : 0;
}

export function resolvePopstatePage(state, pathname = "/") {
  return state?.page || PATH_TO_PAGE[pathname] || "landing";
}
