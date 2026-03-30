import { beforeEach, describe, expect, it } from "vitest";
import { advanceBelt, createInitialState } from "../index.js";
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

describe("conveyor belt movement", () => {
  let nextState: SimulationState;
  beforeEach(() => {
    const state = createInitialState(STANDARD_CONFIG);

    const stateWithItems = {
      ...state,
      belt: ["A", null, "B", null] as Array<Item>,
    };

    nextState = advanceBelt(stateWithItems);
  });
  it("moves all items forward by one slot", () => {
    // We don't test slot 1 (index 0) because the new item will be random
    expect(nextState.belt[1]).toBe("A"); // A has moved to slot 2
    expect(nextState.belt[2]).toBe(null);
    expect(nextState.belt[3]).toBe("B");
  });
});
