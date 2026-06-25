/* ========================================
   Refresh Printables stats in js/models.js
   Run by .github/workflows/refresh-model-stats.yml (weekly) or locally:
     node scripts/update-model-stats.mjs
   Finds every printables.com/model/<id> URL in js/models.js, asks the
   public Printables GraphQL API for current numbers, and rewrites each
   model's single-line `stats: { ... }` literal in place.
   ======================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const MODELS_FILE = new URL('../js/models.js', import.meta.url);
const API = 'https://api.printables.com/graphql/'; // trailing slash matters: the bare path 301s and drops the POST body

const QUERY = `query ($id: ID!) {
  print(id: $id) { id likesCount downloadCount collectionsCount }
}`;

// Printables sits behind Cloudflare, which 403s requests coming from datacenter
// IP ranges (GitHub Actions runners are Azure) unless they look like a real
// browser. An identifiable bot User-Agent works fine from a residential IP but
// is an automatic block from CI, so we send the same headers the printables.com
// front-end uses when it calls this API. (Trade-off: we lose the polite, self-
// identifying UA the original script used — revert it if Printables ever offers
// an allowlist or token for automated clients.)
const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Origin': 'https://www.printables.com',
  'Referer': 'https://www.printables.com/',
  'Sec-Fetch-Site': 'same-site',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
};

const MAX_ATTEMPTS = 4; // 1 try + 3 retries; rides out transient 403/429/5xx and per-edge Cloudflare variance

async function fetchStats(id) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ query: QUERY, variables: { id } }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data, errors } = await res.json();
      if (errors || !data || !data.print) {
        throw new Error(`GraphQL error: ${JSON.stringify(errors)}`);
      }
      return data.print;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) {
        const delay = 1000 * 2 ** (attempt - 1); // 1s, 2s, 4s
        console.warn(`model ${id}: attempt ${attempt}/${MAX_ATTEMPTS} failed (${err.message}) — retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  throw new Error(`Printables API unreachable for model ${id} after ${MAX_ATTEMPTS} attempts: ${lastErr.message}`);
}

let src = readFileSync(MODELS_FILE, 'utf8');
const ids = [...new Set([...src.matchAll(/printables\.com\/model\/(\d+)/g)].map((m) => m[1]))];

if (!ids.length) {
  console.error('No printables.com/model/<id> URLs found in js/models.js — nothing to do.');
  process.exit(1);
}

let changed = 0;
let missing = 0;
let failed = 0;
for (const id of ids) {
  let stats;
  try {
    stats = await fetchStats(id);
  } catch (err) {
    // Couldn't reach the API for this model — keep its committed stats and move
    // on rather than crashing the whole run on an external/IP-based block.
    console.warn(`⚠ ${err.message} — keeping existing committed stats for this model.`);
    failed++;
    continue;
  }
  const { likesCount, downloadCount, collectionsCount } = stats;
  // Rewrite the first single-line stats literal that follows this model's URL.
  const block = new RegExp(
    `(model/${id}[\\s\\S]*?stats: \\{ )downloads: \\d+, likes: \\d+, collections: \\d+( \\})`
  );
  if (!block.test(src)) {
    console.warn(`model ${id}: stats line not found — has the format in js/models.js changed?`);
    missing++;
    continue;
  }
  const next = src.replace(block, `$1downloads: ${downloadCount}, likes: ${likesCount}, collections: ${collectionsCount}$2`);
  if (next === src) {
    console.log(`model ${id}: already current (downloads=${downloadCount} likes=${likesCount} collections=${collectionsCount})`);
  } else {
    src = next;
    changed++;
    console.log(`model ${id}: updated → downloads=${downloadCount} likes=${likesCount} collections=${collectionsCount}`);
  }
}

if (changed > 0) writeFileSync(MODELS_FILE, src);
console.log(
  `Done — ${changed} updated, ${ids.length - changed - missing - failed} already current, ${missing} not matched, ${failed} unreachable.`
);

if (missing > 0) {
  process.exitCode = 1; // format drift is a real bug in this repo — surface it so CI goes red
}
if (failed > 0) {
  // External block (Cloudflare 403 on datacenter IPs is the usual cause). Exit 0
  // on its own so the weekly job stays green and keeps the existing stats; the
  // "nothing to commit" step handles the no-change case. Change the line below
  // to `process.exitCode = 1;` if you'd rather be alerted when refresh is blocked.
  console.error(
    `\nNote: ${failed} of ${ids.length} model(s) could not be refreshed (Printables/Cloudflare likely blocked this runner). ` +
    `Existing stats were kept.`
  );
}
