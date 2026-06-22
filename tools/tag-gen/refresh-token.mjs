#!/usr/bin/env node
// Run: node tools/tag-gen/refresh-token.js
// Fetches a fresh service account token and writes it to config.json

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));
const configPath = join(dir, 'config.json');

const config = JSON.parse(readFileSync(configPath, 'utf8'));

const resp = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: '9d14e19963fb4f7b96cbf6c26aea9139',
    client_secret: config.clientSecret,
    scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,target_sdk',
  }),
});

const { access_token: accessToken, expires_in: expiresIn } = await resp.json();
const expiresAt = Date.now() + expiresIn * 1000;

writeFileSync(configPath, JSON.stringify({ ...config, accessToken, expiresAt }, null, 2));
console.log(`Token refreshed. Expires in ${Math.round(expiresIn / 3600)}h.`);
