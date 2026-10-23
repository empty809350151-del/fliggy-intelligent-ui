import { describe, expect, it } from "vitest";
import { space } from "./style";

describe("Fliggy nearest spacing from original 4px arguments", () => {
  it("preserves original usage tiers instead of multiplying them by six", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(space))
      .toEqual(["0px", "6px", "6px", "12px", "18px", "18px", "24px", "30px", "30px", "36px", "42px", "42px", "48px"]);
  });
  it("keeps exact supplied tokens, rounds ties down and retains oversized legacy gaps", () => {
    expect([1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12].map(space))
      .toEqual(["6px", "12px", "18px", "24px", "30px", "36px", "42px", "48px"]);
    expect(space(2.25)).toBe("6px");
    expect(space(16)).toBe("64px");
    expect(space(-1)).toBe("0px");
    expect(space(Number.NaN)).toBeUndefined();
    expect(space(null)).toBeUndefined();
  });
});
