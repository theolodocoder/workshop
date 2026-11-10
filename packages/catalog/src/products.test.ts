import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getProduct, products } from "./index";

const assetsDir = fileURLToPath(new URL("../../../assets/northfold/", import.meta.url));

describe("Northfold catalog", () => {
  it("has 40 products", () => {
    expect(products).toHaveLength(40);
  });

  it("has unique ids and slugs", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(40);
    expect(new Set(products.map((p) => p.slug)).size).toBe(40);
  });

  it("prices every product in whole cents between $5 and $900", () => {
    for (const p of products) {
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(p.priceCents).toBeGreaterThanOrEqual(500);
      expect(p.priceCents).toBeLessThanOrEqual(90000);
    }
  });

  it("has a downloaded photo with size for every product", () => {
    for (const p of products) {
      expect(existsSync(assetsDir + p.image.file), p.image.file).toBe(true);
      expect(p.image.width).toBeGreaterThan(0);
      expect(p.image.height).toBeGreaterThan(0);
    }
  });

  it("credits every photo to its Unsplash photographer", () => {
    for (const p of products) {
      expect(p.image.credit.name.length).toBeGreaterThan(0);
      expect(p.image.credit.url).toMatch(/^https:\/\/unsplash\.com\//);
    }
  });

  it("finds a product by slug", () => {
    expect(getProduct("ridge-2-dome-tent")?.category).toBe("tents");
    expect(getProduct("no-such-thing")).toBeUndefined();
  });
});
