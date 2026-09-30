#!/usr/bin/env node
/*
 * Fetches frontend config from Vault (KV v2) into .env.local before start/build.
 * No-op if VAULT_ADDR/VAULT_TOKEN aren't set, so local dev keeps using src/api.ts defaults.
 * .env.local is gitignored - never commit fetched secrets.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const addr = process.env.VAULT_ADDR;
const token = process.env.VAULT_TOKEN;

if (!addr || !token) {
  process.exit(0);
}

const mount = process.env.VAULT_KV_MOUNT || 'kv';
const secretPath = process.env.VAULT_SECRET_PATH || 'media-drishti/frontend';
const url = new URL(`${addr.replace(/\/$/, '')}/v1/${mount}/data/${secretPath}`);
const client = url.protocol === 'https:' ? https : http;

const req = client.request(url, { headers: { 'X-Vault-Token': token } }, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.warn(`Vault fetch failed (${res.statusCode}); using existing env vars.`);
      return;
    }
    try {
      const parsed = JSON.parse(body);
      const secrets = parsed.data.data;
      const lines = Object.entries(secrets).map(([key, value]) => `${key}=${value}`);
      fs.writeFileSync(path.join(__dirname, '..', '.env.local'), lines.join('\n') + '\n');
      console.log(`Wrote ${lines.length} var(s) from Vault to .env.local`);
    } catch (err) {
      console.warn('Could not parse Vault response; using existing env vars.', err.message);
    }
  });
});

req.on('error', (err) => {
  console.warn('Could not reach Vault; using existing env vars.', err.message);
});

req.end();
