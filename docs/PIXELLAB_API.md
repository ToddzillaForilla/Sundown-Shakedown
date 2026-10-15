# PixelLab access

MCP and the project's direct REST v2 client are configured separately and use the same `PIXELLAB_API_TOKEN` variable. Successful REST authentication does not by itself establish that PixelLab MCP tools are loaded in a chat.

## Direct REST client

Run with Node.js 22 or newer from the repository root:

```powershell
npm run pixellab -- balance
npm run pixellab -- get /characters
npm run pixellab -- get /background-jobs/JOB_ID
npm run pixellab -- post /create-image-pixen request.json
```

These are supported CLI forms; check current endpoint parameters before submitting a request. POST requests can consume generations or credits. Most generation requests return a job ID; poll the documented status endpoint rather than resubmitting. Use the [PixelLab-generation skill](../.agents/skills/pixellab-generation/SKILL.md) for batch limits, cost accounting, provenance, and review.

[The npm script](../package.json) loads `.env.local` when present. The token may also come from the shell environment. [scripts/pixellab.mjs](../scripts/pixellab.mjs) is Node-only; never import it into browser code. For custom Node scripts, import `pixelLabRequest` and call it with a relative endpoint and optional `{ method: 'POST', body: {...} }`.

## Credential handling

Keep the raw token in the environment or Git-ignored `.env.local`, without a `Bearer ` prefix; clients add the authentication prefix. Never print, commit, embed in browser code, place in a `VITE_` variable, or include tokens in logs/manifests. MCP configuration must name the environment variable rather than contain the token. If a token is exposed in chat or logs, have the user revoke/regenerate it without repeating it.

## Windows MCP setup

The setup recorded for Todd's host uses `C:\Users\Todd\.codex\config.toml`:

```toml
[mcp_servers.pixellab]
url = "https://api.pixellab.ai/mcp"
bearer_token_env_var = "PIXELLAB_API_TOKEN"
```

`bearer_token_env_var` is the literal variable name, never the token value. Keep one PixelLab server entry rather than adding the website's bridge configuration alongside direct HTTP.

A Windows user environment variable may exist without reaching the running Codex process. Fully quit and reopen Codex after changing it. Project `.env.local` loading configures the npm REST script, not the Codex MCP process. This documents the recorded setup; inspect current configuration without revealing secrets when troubleshooting.

## Read-only connection checks

- `npm run pixellab -- balance` verifies REST API authentication.
- MCP initialization verifies the server handshake.
- A successful balance call through the loaded PixelLab MCP tool verifies that the current chat can use the connection.

Configuration presence, initialization, and REST success are distinct checks. Never print credential values while diagnosing them. A trial account previously authenticated and exposed MCP tools despite older subscription-only claims; check actual access before recommending a paid upgrade. Balance checks do not generate assets; report balances as current only after a fresh check.

## Todd standalone preview

```powershell
node scripts/preview-todd-pixellab.mjs
```

[The script](../scripts/preview-todd-pixellab.mjs) rebuilds [animation-preview.html](../art-source/characters/todd/pixellab/photo-character/animation-preview.html) from the manifest and photo-character frames. It supports normal/slow playback and facing reversal. It generates an HTML file and does not start a server.

For a localhost preview, use a running server such as `npm run dev` and append `/art-source/characters/todd/pixellab/photo-character/animation-preview.html` to the actual URL Vite prints. Check the server before claiming the link is live. This is a source-art preview; the [Todd plan](TODD_PIXELLAB_ANIMATION_PLAN.md) records runtime integration status.

## API references

- [Official endpoint parameters](https://api.pixellab.ai/v2/docs)
- [Machine-readable API reference](https://api.pixellab.ai/v2/openapi.json)

Verify selected tool/version availability, limits, costs, and actual account access at execution time. Historical pilot observations are not current service guarantees.
