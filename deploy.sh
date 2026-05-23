#!/bin/bash
npx vercel build --prod
cp -r dist/server/* .vercel/output/functions/index.func/ 2>/dev/null || true
mkdir -p .vercel/output/functions/index.func
cp -r dist/server/* .vercel/output/functions/index.func/
cat > .vercel/output/functions/index.func/.vc-config.json << 'VCEOF'
{
  "runtime": "nodejs20.x",
  "handler": "middleware.js",
  "launcherType": "Nodejs"
}
VCEOF
cat > .vercel/output/functions/index.func/middleware.js << 'MEOF'
import worker from "./index.js";
export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const request = new Request(url, { method: req.method, headers: req.headers });
  const response = await worker.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = await response.text();
  res.end(body);
}
MEOF
rm -rf .vercel/output/functions/middleware.func
cat > .vercel/output/config.json << 'CEOF'
{
  "version": 3,
  "routes": [
    { "src": "^/assets/(.*)$", "dest": "/assets/$1" },
    { "src": "/(.*)", "dest": "/index" }
  ]
}
CEOF
npx vercel deploy --prebuilt --prod
