/*
 * kontract.js — the whole client contract in one small file. Copy it, keep it.
 *
 * 1. Auth handshake: the platform launcher opens your theme with the signed-in
 *    user's bearer token in the URL fragment. Read it, scrub the address bar,
 *    keep it in sessionStorage, send it on every call.
 * 2. Discovery first: /foreman/kontract/{org} tells you capabilities, the band
 *    catalog, and rates. Never hardcode any of that.
 */

const kontract = (() => {
  const API = ""; // same-origin proxy or set your platform origin, e.g. "https://konstruct.example.com"

  function takeTokenFromFragment() {
    const m = location.hash.match(/[#&]token=([^&]+)/);
    if (m) {
      sessionStorage.setItem("kontract.token", decodeURIComponent(m[1]));
      history.replaceState(null, "", location.pathname + location.search);
    }
    return sessionStorage.getItem("kontract.token");
  }

  const token = takeTokenFromFragment();

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
    discover: (org) => call("GET", `/foreman/kontract/${org}`),
    zones: (org) => call("GET", `/foreman/zones/${org}`),
    createZone: (org, zone) => call("POST", `/foreman/zones/${org}`, zone),
    apps: (org) => call("GET", `/foreman/apps/${org}`),
    shipApp: (app) => call("POST", `/foreman/app`, app),
    deleteApp: (org, name) => call("DELETE", `/foreman/app/${org}/${name}`),
    redeploy: (org, name) => call("POST", `/foreman/app/${org}/${name}/redeploy`),
    buildLogs: (org, name) => call("GET", `/foreman/app/${org}/${name}/build-logs`),
    character: (org) => call("GET", `/foreman/character/${org}`),
    saveCharacter: (org, spec) => call("PUT", `/foreman/character/${org}`, spec),
  };
})();
