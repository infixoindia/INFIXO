import test from "node:test";
import assert from "node:assert/strict";
import { readBilingualSection, writeBilingualSection } from "../lib/bilingualWorker.mjs";

test("legacy Hindi content remains unchanged before English is saved", () => {
  const old = ["मेरा नाम मोहन है", "मैं पेंटिंग करता हूँ"];
  assert.deepEqual(readBilingualSection(old), { hi: old, en: [] });
  assert.deepEqual(writeBilingualSection(old, []), old);
});

test("saving English after Hindi stores both languages without losing order", () => {
  const hi = ["सबसे बढ़िया काम", "समय पर काम पूरा"];
  const en = ["Excellent quality", "On-time completion"];
  const stored = writeBilingualSection(hi, en);
  assert.deepEqual(stored, { hi, en });
  assert.deepEqual(readBilingualSection(stored), { hi, en });
});

test("editing one language preserves the other", () => {
  const existing = readBilingualSection({ hi: ["हिंदी पुरानी"], en: ["English existing"] });
  assert.deepEqual(writeBilingualSection(["हिंदी नई"], existing.en), { hi: ["हिंदी नई"], en: ["English existing"] });
  assert.deepEqual(writeBilingualSection(existing.hi, ["English new"]), { hi: ["हिंदी पुरानी"], en: ["English new"] });
});

test("missing and invalid optional translation data remains safe", () => {
  assert.deepEqual(readBilingualSection(null), { hi: [], en: [] });
  assert.deepEqual(readBilingualSection({ hi: ["सही", 42], en: "wrong" }), { hi: ["सही"], en: [] });
});
