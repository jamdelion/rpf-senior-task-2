import { beforeEach, describe, expect, it } from "vitest";
import {
  advanceBelt,
  createInitialState,
  generateRandomItem,
  processWorkerPair,
  tick,
  updateAssemblyForPair,
} from "../index.js";
import type { Item, SimulationState, WorkerPair } from "../index.types.js";
import { createWorker, createWorkerPair } from "./index.test.helpers.js";

export const DEFAULT_ASSEMBLY_TIME = 4;
const STANDARD_CONFIG = {
  steps: 10,
  beltLength: 3,
  // assumption: can only place the product into an empty slot?
  timeToAssemble: DEFAULT_ASSEMBLY_TIME,
};

const workersWithEmptyHands: WorkerPair = createWorkerPair();

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
          assemblyTimeLeft: 0,
        },
        rightWorker: {
          hands: [null, null],
          assemblyTimeLeft: 0,
        },
      },
      {
        stationIndex: 2,
        leftWorker: {
          hands: [null, null],
          assemblyTimeLeft: 0,
        },
        rightWorker: {
          hands: [null, null],
          assemblyTimeLeft: 0,
        },
      },
      {
        stationIndex: 3,
        leftWorker: {
          hands: [null, null],
          assemblyTimeLeft: 0,
        },
        rightWorker: {
          hands: [null, null],
          assemblyTimeLeft: 0,
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

describe("adding a new item", () => {
  it("advances the belt and puts a new item into the first slot", () => {
    const state = initializeStateWithBelt([null, "A", null]);

    const nextState = tick(state, () => 0.5);

    expect(nextState.belt).toEqual(["A", null, "A"]);
  });

  it("can put an empty slot into the first position", () => {
    const state = initializeStateWithBelt(["A", null, null]);

    const nextState = tick(state, () => 0.1);

    expect(nextState.belt).toEqual([null, "A", null]);
  });
});

describe("workers picking up items", () => {
  // assumption: left worker gets priority if can pick up item
  it("left worker picks up a component if both workers have empty hands", () => {
    const belt: Array<Item> = ["A", null, null];

    const result = processWorkerPair(workersWithEmptyHands, belt);

    expect(result.updatedPair).toEqual(
      createWorkerPair(createWorker(["A", null]), createWorker()),
    );

    expect(result.updatedBelt).toEqual([null, null, null]);
  });

  it("workers pick up nothing if the slot is empty", () => {
    const belt: Array<Item> = [null, null, null];

    const result = processWorkerPair(workersWithEmptyHands, belt);

    expect(result.updatedPair).toEqual(workersWithEmptyHands); // unchanged

    expect(result.updatedBelt).toEqual([null, null, null]);
  });

  it("right worker picks up component if left worker's hands are full", () => {
    const pair: WorkerPair = createWorkerPair(
      createWorker(["A", "B"]),
      createWorker(),
    );

    const belt: Array<Item> = ["A", null, null];

    const result = processWorkerPair(pair, belt);

    expect(result.updatedPair.leftWorker.hands).toEqual(["A", "B"]);
    expect(result.updatedPair.rightWorker.hands).toEqual(["A", null]);
    expect(result.updatedBelt).toEqual([null, null, null]);
  });

  it("worker does not pick up completed products ('C')", () => {
    const belt: Array<Item> = ["C", null, null];

    const result = processWorkerPair(workersWithEmptyHands, belt);

    expect(result.updatedPair).toEqual(workersWithEmptyHands); // unchanged

    expect(result.updatedBelt).toEqual(["C", null, null]);
  });

  it("other worker can pick up a component if the first worker already has that component", () => {
    const pair: WorkerPair = createWorkerPair(
      createWorker(["A", null]),
      createWorker(),
    );

    const belt: Array<Item> = ["A", null, null];

    const result = processWorkerPair(pair, belt);

    expect(result.updatedPair.leftWorker.hands).toEqual(["A", null]);
    expect(result.updatedPair.rightWorker.hands).toEqual(["A", null]);
    expect(result.updatedBelt).toEqual([null, null, null]);
  });

  it("worker does not pick up component if both workers have that component already", () => {
    const pair: WorkerPair = createWorkerPair(
      createWorker(["B", null]),
      createWorker(["B", null]),
    );

    const belt: Array<Item> = ["B", null, null];

    const result = processWorkerPair(pair, belt);

    expect(result.updatedPair.leftWorker.hands).toEqual(["B", null]);
    expect(result.updatedPair.rightWorker.hands).toEqual(["B", null]);
    expect(result.updatedBelt).toEqual(["B", null, null]);
  });
});

describe("assembling components into products", () => {
  it("worker starts assembling when they hold one of each component", () => {
    const pair: WorkerPair = createWorkerPair(
      createWorker(["A", null]),
      createWorker(),
    );

    const belt: Array<Item> = ["B", null, null];

    const result = processWorkerPair(pair, belt);

    expect(result.updatedPair).toEqual(
      createWorkerPair(createWorker(["A", "B"], 4), createWorker()),
    );

    expect(result.updatedBelt).toEqual([null, null, null]);
  });

  it("decrements the assembly time", () => {
    const pair = createWorkerPair(createWorker(["A", "B"], 4), createWorker());

    const updatedPair = updateAssemblyForPair(pair);

    expect(updatedPair).toEqual(
      createWorkerPair(createWorker(["A", "B"], 3), createWorker()),
    );
  });

  it("turns A and B into C and null when assembly finishes", () => {
    const pair = createWorkerPair(createWorker(["A", "B"], 1), createWorker());

    const updatedPair = updateAssemblyForPair(pair);

    expect(updatedPair).toEqual(
      createWorkerPair(createWorker(["C", null], 0), createWorker()),
    );
  });
});
