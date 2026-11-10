import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { copyPhotos } from "./copy-photos.mjs";

describe("copyPhotos", () => {
  it("copies every .jpg into the app's public folder as real files", async () => {
    const src = mkdtempSync(join(tmpdir(), "photos-"));
    writeFileSync(join(src, "a.jpg"), "a");
    writeFileSync(join(src, "b.jpg"), "b");
    writeFileSync(join(src, "manifest.json"), "{}");
    const dest = join(mkdtempSync(join(tmpdir(), "public-")), "products");
    expect(await copyPhotos(src, dest)).toBe(2);
    expect(readdirSync(dest).sort()).toEqual(["a.jpg", "b.jpg"]);
    expect(lstatSync(join(dest, "a.jpg")).isSymbolicLink()).toBe(false);
  });

  it("replaces an old symlink at the destination with a real folder", async () => {
    const src = mkdtempSync(join(tmpdir(), "photos-"));
    writeFileSync(join(src, "a.jpg"), "a");
    const pub = mkdtempSync(join(tmpdir(), "public-"));
    const other = mkdtempSync(join(tmpdir(), "elsewhere-"));
    mkdirSync(join(other, "x"));
    symlinkSync(other, join(pub, "products"));
    await copyPhotos(src, join(pub, "products"));
    expect(lstatSync(join(pub, "products")).isSymbolicLink()).toBe(false);
    expect(existsSync(join(other, "a.jpg"))).toBe(false);
  });
});
