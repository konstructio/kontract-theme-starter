# KONTRACT
version: v2
theme: starter
capabilities: [apps, zones]
vocabulary:
  zone: { singular: zone, plural: zones, verb: create }
  app: { singular: app, plural: apps, verb: ship }
  deploy: { verb: ship }

## The contract (v2 — postMessage transport)

Your theme never receives a credential. Keep `kontract.js` and call its
methods (`kontract.zones(org)`, `kontract.apps(org)`, …); everything below is
what it does for you.

- Konstruct launches your theme in a sandboxed iframe at
  `https://<your-theme-host>/?org=<namespace>`. Read the org from the query
  string. There is no token, no fragment, nothing in sessionStorage.
- Each operation is sent to the platform window as
  `{ type: "kontract-rpc", id, op, args }` via
  `window.parent.postMessage(…, "*")`. The request carries no secrets.
- Konstruct validates the sender, allows only kontract operations, pins every
  org-scoped operation to the org you were launched for (an org you pass is
  ignored), performs the API call with the signed-in user's session on its own
  origin, and replies `{ type: "kontract-rpc-result", id, ok, data | error, status }`
  with `targetOrigin` pinned to your theme's origin.
- `kontract.isLaunched()` is false when your theme is opened directly (no
  parent window). Render a welcome or sample-data mode — the popout link from
  Konstruct is deliberately unauthenticated.

Allowed ops: `discover`, `zones`, `createZone`, `apps`, `appRepos`,
`shipApp`, `updateApp`, `deleteApp`, `redeploy`, `buildLogs`, `character`,
`saveCharacter`.

v1 themes (token-in-fragment + direct API fetch) stop working once the
platform removes theme-origin CORS: replace your copy of `kontract.js` with
this repo's version — the method signatures are unchanged.
