import { describe, expect, it } from "vitest";
import { Cart, CartLine, CheckUrl } from "./schemas";

const line = (productId: string, qty: number) => ({ productId, qty });

describe("Cart", () => {
  it("accepts a valid 2-line cart", () => {
    expect(Cart.safeParse([line("nf-005", 1), line("nf-026", 2)]).success).toBe(true);
  });

  it.each([
    ["an empty cart", []],
    ["quantity 0", [line("nf-005", 0)]],
    ["quantity 11", [line("nf-005", 11)]],
    ["quantity 1.5", [line("nf-005", 1.5)]],
    ["a 65-character product id", [line("x".repeat(65), 1)]],
    ["21 lines", Array.from({ length: 21 }, (_, i) => line(`nf-${i}`, 1))],
  ])("rejects %s", (_label, cart) => {
    expect(Cart.safeParse(cart).success).toBe(false);
  });
});

describe("CartLine", () => {
  it("rejects a missing product id", () => {
    expect(CartLine.safeParse({ productId: "", qty: 1 }).success).toBe(false);
  });
});

describe("CheckUrl", () => {
  it("accepts a normal address and trims spaces", () => {
    expect(CheckUrl.parse("  https://example.com  ")).toBe("https://example.com");
  });

  it("rejects text that isn't a URL, and very long input", () => {
    expect(CheckUrl.safeParse("not a url").success).toBe(false);
    expect(CheckUrl.safeParse("https://example.com/" + "a".repeat(2048)).success).toBe(false);
  });
});
