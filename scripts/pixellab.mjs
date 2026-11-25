import { readFile } from 'node:fs/promises';

// Node-only asset tooling. Never import this client into the browser game.
export async function pixelLabRequest(path, { method = 'GET', body } = {}) {
  const token = process.env.PIXELLAB_API_TOKEN;
  if (!token) throw new Error('Set PIXELLAB_API_TOKEN in your environment or .env.local.');
  if (!/^\/[a-zA-Z0-9_/?=&.%+-]+$/.test(path) || path.includes('..')) {
    throw new Error('Provide a relative PixelLab v2 endpoint, such as /balance.');
  }
  const response = await fetch(`https://api.pixellab.ai/v2${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`PixelLab returned HTTP ${response.status}.`);
  return response.json();
}

import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [command = 'balance', path, file] = process.argv.slice(2);
    let result;
    if (command === 'balance') result = await pixelLabRequest('/balance');
    else if (command === 'get' && path) result = await pixelLabRequest(path);
    else if (command === 'post' && path && file) {
      result = await pixelLabRequest(path, {
        method: 'POST', body: JSON.parse(await readFile(file, 'utf8')),
      });
    } else throw new Error('Usage: npm run pixellab -- balance | get /endpoint | post /endpoint request.json');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message.replaceAll(process.env.PIXELLAB_API_TOKEN || '\0', '[redacted]'));
    process.exitCode = 1;
  }
}
