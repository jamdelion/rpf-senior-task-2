import { describe, it, expect } from "vitest";

describe("can run a test", () => {
  it("adds numbers", () => {
    expect(1 + 1).toBe(2);
  });
});