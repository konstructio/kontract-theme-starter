/*
 * kontract.js — the whole client contract in one small file. Copy it, keep it.
 *
 * 1. Auth handshake: the platform launcher opens your theme with the signed-in
 *    user's bearer token in the URL fragment. Read it, scrub the address bar,
 *    keep it in sessionStorage, send it on every call.
 * 2. Discovery first: /kontract/discovery/{org} tells you capabilities, the
 *    band catalog, and rates. Never hardcode any of that.
 */

const kontract = (() => {
  function takeFromFragment() {
    const t = location.hash.match(/[#&]token=([^&]+)/);
    const a = location.hash.match(/[#&]api=([^&]+)/);
    if (t) sessionStorage.setItem("kontract.token", decodeURIComponent(t[1]));
    if (a) sessionStorage.setItem("kontract.api", decodeURIComponent(a[1]));
    if (t || a) history.replaceState(null, "", location.pathname + location.search);
  }

  takeFromFragment();
  const token = sessionStorage.getItem("kontract.token");
  // The launcher passes the platform origin alongside the token; fall back to
  // same-origin for themes served behind a proxy.
  const API = sessionStorage.getItem("kontract.api") || "";

  async function call(method, path, body) {
    const res = await fetch(`${API}/api/v1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      document.body.innerHTML =
        "<p style='font-family:monospace;padding:2rem'>Session expired — relaunch from Konstruct.</p>";
      throw new Error("unauthorized");
    }
    if (!res.ok) {
      const text = await res.text();
      throw Object.assign(new Error(text || res.statusText), { status: res.status });
    }
    return res.status === 204 ? null : res.json();
  }

  return {
    hasToken: () => Boolean(token),
    discover: (org) => call("GET", `/kontract/discovery/${org}`),
    zones: (org) => call("GET", `/kontract/zones/${org}`),
    createZone: (org, zone) => call("POST", `/kontract/zones/${org}`, zone),
    apps: (org) => call("GET", `/kontract/apps/${org}`),
    appRepos: (org) => call("GET", `/konstruct-application/${org}`),
    shipApp: (app) => call("POST", `/kontract/app`, app),
    updateApp: (org, name, body) => call("PATCH", `/kontract/app/${org}/${name}`, body),
    deleteApp: (org, name) => call("DELETE", `/kontract/app/${org}/${name}`),
    redeploy: (org, name) => call("POST", `/kontract/app/${org}/${name}/redeploy`),
    buildLogs: (org, name) => call("GET", `/kontract/app/${org}/${name}/build-logs`),
    character: (org) => call("GET", `/kontract/character/${org}`),
    saveCharacter: (org, spec) => call("PUT", `/kontract/character/${org}`, spec),
  };
})();
