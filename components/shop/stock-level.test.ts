import { describe, expect, it } from "vitest";
import { formatLowStockHint } from "./stock-level";

describe("formatLowStockHint", () => {
  it("hints at the threshold (5)", () => {
    expect(formatLowStockHint(5)).toBe("Only 5 left");
  });

  it("hints at a single unit", () => {
    expect(formatLowStockHint(1)).toBe("Only 1 left");
  });

  it("returns null for untracked Stock Level", () => {
    expect(formatLowStockHint(null)).toBeNull();
  });

  it("returns null for zero stock (sold out, not low)", () => {
    expect(formatLowStockHint(0)).toBeNull();
  });

  it("returns null above the threshold", () => {
    expect(formatLowStockHint(6)).toBeNull();
  });

  it("returns null for nonsensical negative stock", () => {
    expect(formatLowStockHint(-3)).toBeNull();
  });
});
