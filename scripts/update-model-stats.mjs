/* ========================================
   Refresh Printables stats in js/models.js
   Run by .github/workflows/refresh-model-stats.yml (weekly) or locally:
     node scripts/update-model-stats.mjs
   Finds every printables.com/model/<id> URL in js/models.js, asks the
   public Printables GraphQL API for current numbers, and rewrites each
   model's single-line `stats: { ... }` literal in place.
   ======================================== */

import { readFileSync, writeFileSync } from 'node:fs';

const MODELS_FILE = new URL('../js/models.js', import.meta.url);
const API = 'https://api.printables.com/graphql/'; // trailing slash matters: the bare path 301s and drops the POST body

const QUERY = `query ($id: ID!) {
  print(id: $id) { id likesCount downloadCount collectionsCount }
}`;

async function fetchStats(id) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'petr.junak.eu model-stats refresh (github.com/pjunak/petr.junak.eu)',
    },
    body: JSON.stringify({ query: QUERY, variables: { id } }),
  });
  if (!res.ok) throw new Error(`Printables API HTTP ${res.status} for model ${id}`);
  const { data, errors } = await res.json();
  if (errors || !data || !data.print) {
    throw new Error(`Printables API error for model ${id}: ${JSON.stringify(errors)}`);
  }
  return data.print;
}

let src = readFileSync(MODELS_FILE, 'utf8');
const ids = [...new Set([...src.matchAll(/printables\.com\/model\/(\d+)/g)].map((m) => m[1]))];

if (!ids.length) {
  console.error('No printables.com/model/<id> URLs found in js/models.js — nothing to do.');
  process.exit(1);
}

let changed = 0;
let missing = 0;
for (const id of ids) {
  const { likesCount, downloadCount, collectionsCount } = await fetchStats(id);
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

writeFileSync(MODELS_FILE, src);
console.log(`Done — ${changed} updated, ${ids.length - changed - missing} already current, ${missing} not matched.`);
if (missing > 0) process.exit(1); // make CI surface format drift instead of silently skipping
