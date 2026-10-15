# PixelLab access

Codex uses the existing PixelLab MCP connection. Project asset scripts can also use the REST v2 API with the same `PIXELLAB_API_TOKEN` environment variable.

Run with Node.js 22 or newer:

```powershell
npm run pixellab -- balance
npm run pixellab -- get /characters
npm run pixellab -- get /background-jobs/JOB_ID
npm run pixellab -- post /create-image-pixen request.json
```

POST requests can consume generations or credits. Check the balance and review the request before generating. Most generation requests return a job ID; poll the documented status endpoint to retrieve the result.

The token can come from your shell environment or a local `.env.local` file containing `PIXELLAB_API_TOKEN=your-key`. That file is ignored by Git. Never use a `VITE_` variable for the token, put it in source code, or import this Node-only client into the browser game.

For custom Node scripts, import `pixelLabRequest` from `scripts/pixellab.mjs` and call it with a relative endpoint and optional `{ method: 'POST', body: {...} }`.

Official endpoint parameters: https://api.pixellab.ai/v2/docs

Machine-readable API reference: https://api.pixellab.ai/v2/openapi.json
