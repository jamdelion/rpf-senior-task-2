import { beforeEach, describe, expect, it } from "vitest";
import { advanceBelt, createInitialState, generateRandomItem } from "../index.js";
import type { Item, SimulationState } from "../index.types.js";

const STANDARD_CONFIG = {
  steps: 10,
  beltLength: 3,
  // assumption: can only place the product into an empty slot?
  timeToAssemble: 4,
};

describe("setting up the initial state", () => {
  let state: ReturnType<typeof createInitialState>;

  beforeEach(() => {
    state = createInitialState(STANDARD_CONFIG);
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

  // assumption: number of workstations equals the number of slots
  it("creates a pair of workers per slot, with empty hands", () => {
    expect(state.workers).toEqual([
      {
        stationIndex: 1,
        leftWorker: {
          hands: [null, null],
        },
        rightWorker: {
          hands: [null, null],
        },
      },
      {
        stationIndex: 2,
        leftWorker: {
          hands: [null, null],
        },
        rightWorker: {
          hands: [null, null],
        },
      },
      {
        stationIndex: 3,
        leftWorker: {
          hands: [null, null],
        },
        rightWorker: {
          hands: [null, null],
        },
      },
    ]);
  });
});

const initializeStateWithBelt = (belt: Item[]): SimulationState => {
  return {
    ...createInitialState(STANDARD_CONFIG),
    belt,
  };
};

describe("conveyor belt movement", () => {
  it("moves all items forward by one slot", () => {
    const stateWithItems = initializeStateWithBelt(["A", null, "B"]);

    const nextState = advanceBelt(stateWithItems);

    // We don't test slot 1 (index 0) because the new item will be random
    expect(nextState.belt[1]).toBe("A"); // A has moved to slot 2
    expect(nextState.belt[2]).toBe(null);
  });

  it("counts unpicked components", () => {
    const stateWithItems = initializeStateWithBelt([null, "A", "B"]);

    const nextState = advanceBelt(stateWithItems);

    expect(nextState.belt[1]).toBe(null);
    expect(nextState.belt[2]).toBe("A");
    expect(nextState.belt.length).toBe(3);

    expect(nextState.stats).toEqual({
      finishedProducts: 0,
      unpickedA: 0,
      unpickedB: 1,
    });
  });
});

describe("generating random items", () => {
  it("returns null when the random value is in the first third", () => {
    expect(generateRandomItem(() => 0.1)).toBe(null);
  });

  it("returns A when the random value is in the second third", () => {
    expect(generateRandomItem(() => 0.5)).toBe("A");
  });

  it("returns B when the random value is in the final third", () => {
    expect(generateRandomItem(() => 0.9)).toBe("B");
  });
});
