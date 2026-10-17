import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("shortcut icon uses official logo and white padded square without PWA installation", () => {
  const helper = read("../lib/shortcutIcon.js");
  const icon = read("../app/icon.js");
  const apple = read("../app/apple-icon.js");
  const layout = read("../app/w/[slug]/layout.js");
  assert.match(helper, /public.*images.*logo\.png/);
  assert.match(helper, /backgroundColor: "#ffffff"/);
  assert.match(helper, /objectFit: "contain"/);
  assert.match(helper, /pixelSize \* 0\.88/);
  assert.ok(icon.includes("width: 512") && icon.includes("image/png"));
  assert.ok(apple.includes("width: 180") && apple.includes("image/png"));
  assert.match(layout, /getWorkerBySlug\(slug\)/);
  assert.match(layout, /name\.slice\(0, 55\) \+ " \| INFIXO"/);
  assert.ok(!helper.includes("serviceWorker"));
  assert.ok(!layout.includes("manifest:"));
});

test("original official logo is tagline-free landscape PNG", () => {
  const logo = readFileSync(fileURLToPath(new URL("../public/images/logo.png", import.meta.url)));
  assert.equal(logo.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(logo.readUInt32BE(16), 1193);
  assert.equal(logo.readUInt32BE(20), 364);
});
