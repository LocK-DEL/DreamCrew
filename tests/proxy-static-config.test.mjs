import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const proxySource = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");

test("keeps the Next.js proxy matcher as an inline static string", () => {
  assert.match(
    proxySource,
    /matcher:\s*\[\s*"\/\(\(\?!_next\/static\|_next\/image/,
  );
  assert.doesNotMatch(proxySource, /matcher:\s*\[SUPABASE_PROXY_MATCHER\]/);
});
