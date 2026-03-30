import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../index.js";

describe("setting up the initial state", () => {
  let state: ReturnType<typeof createInitialState>;

  beforeEach(() => {
    const config = {
      steps: 10,
      beltLength: 3,
      // assumption: can only place the product into an empty slot?
      timeToAssemble: 4,
    };

    state = createInitialState(config);
  });
  // assumption: the belt starts empty
  it("creates an empty belt and zeroed stats", () => {
    expect(state.currentStep).toBe(0);
    expect(state.belt).toEqual([null, null, null]);
    expect(state.stats).toEqual({
      finishedProducts: 0,
      unpickedA: 0,
      unpickedB: 0,
    });
  });
});
