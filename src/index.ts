import type {
  IncomingItem,
  Item,
  SimulationConfig,
  SimulationState,
  Worker,
  WorkerPair,
} from "./index.types.js";
import { DEFAULT_ASSEMBLY_TIME } from "./tests/index.test.js";

console.log("Hello Jo");

export const createInitialState = (
  config: SimulationConfig,
): SimulationState => {
  return {
    currentStep: 0,
    belt: Array(config.beltLength).fill(null),
    workers: Array.from({ length: config.beltLength }, (_, index) => ({
      stationIndex: index + 1,
      leftWorker: {
        hands: [null, null],
        assemblyTimeLeft: 0,
      },
      rightWorker: {
        hands: [null, null],
        assemblyTimeLeft: 0,
      },
    })),
    stats: {
      finishedProducts: 0,
      unpickedA: 0,
      unpickedB: 0,
    },
  };
};

export const advanceBelt = (state: SimulationState): SimulationState => {
  const exitingItem = state.belt[state.belt.length - 1];

  return {
    ...state,
    belt: [null, ...state.belt.slice(0, -1)],
    stats: {
      ...state.stats,
      unpickedA: state.stats.unpickedA + (exitingItem === "A" ? 1 : 0),
      unpickedB: state.stats.unpickedB + (exitingItem === "B" ? 1 : 0),
      finishedProducts:
        state.stats.finishedProducts + (exitingItem === "C" ? 1 : 0),
    },
  };
};

export const generateRandomItem = (
  randomNumberGenerator: () => number,
): IncomingItem => {
  const randomValue = randomNumberGenerator();

  if (randomValue < 1 / 3) {
    return null;
  }

  if (randomValue < 2 / 3) {
    return "A";
  }

  return "B";
};

export const addItemAtStart = (
  state: SimulationState,
  item: IncomingItem,
): SimulationState => {
  const nextBelt = [...state.belt];
  nextBelt[0] = item;

  return {
    ...state,
    belt: nextBelt,
  };
};

export const tick = (
  state: SimulationState,
  randomNumberGenerator: () => number,
): SimulationState => {
  const movedState = advanceBelt(state);
  const newItem = generateRandomItem(randomNumberGenerator);
  // return addItemAtStart(movedState, newItem);
  const stateWithNewItem = addItemAtStart(movedState, newItem);
  const stateAfterWorkers = processAllWorkerPairs(stateWithNewItem);
  const stateAfterAssembly = updateAssemblyForAllPairs(stateAfterWorkers);

  return {
    ...stateAfterAssembly,
    currentStep: state.currentStep + 1,
  };
};

const hasEmptyHand = (worker: Worker): Boolean => {
  return worker.hands.includes(null);
};

const canPickItem = (worker: Worker, item: Item): boolean => {
  if (worker.assemblyTimeLeft > 0) {
    return false;
  }

  if (item !== "A" && item !== "B") {
    return false;
  }

  return hasEmptyHand(worker) && !worker.hands.includes(item);
};

const addItemToHand = (worker: Worker, item: Exclude<Item, null>): Worker => {
  const nextHands = [...worker.hands] as [Item, Item];
  const emptyHandIndex = nextHands.findIndex((hand) => hand === null);

  const handsFull = emptyHandIndex === -1;

  if (handsFull) {
    return worker;
  }

  nextHands[emptyHandIndex] = item;

  return {
    ...worker,
    hands: nextHands,
  };
};

export const processWorkerPair = (
  pair: WorkerPair,
  belt: Array<Item>,
  timeToAssemble: number = DEFAULT_ASSEMBLY_TIME,
): { updatedPair: WorkerPair; updatedBelt: Array<Item> } => {
  const beltIndex = pair.stationIndex - 1;
  const itemAtStation = belt[beltIndex] as Item;

  if (itemAtStation === null) {
    if (isHoldingFinishedProduct(pair.leftWorker)) {
      const updatedBelt = [...belt];
      updatedBelt[beltIndex] = "C";

      return {
        updatedPair: {
          ...pair,
          leftWorker: removeFinishedProductFromHand(pair.leftWorker),
        },
        updatedBelt,
      };
    }

    if (isHoldingFinishedProduct(pair.rightWorker)) {
      const updatedBelt = [...belt];
      updatedBelt[beltIndex] = "C";

      return {
        updatedPair: {
          ...pair,
          rightWorker: removeFinishedProductFromHand(pair.rightWorker),
        },
        updatedBelt,
      };
    }

    return {
      updatedPair: pair,
      updatedBelt: belt,
    };
  }

    if (itemAtStation === "C") {
    return {
      updatedPair: pair,
      updatedBelt: belt,
    };
  }

  // left worker gets priority
  if (canPickItem(pair.leftWorker, itemAtStation)) {
    const updatedBelt = [...belt];
    updatedBelt[beltIndex] = null;

    const leftWorkerWithItem = addItemToHand(pair.leftWorker, itemAtStation);
    const updatedLeftWorker = maybeStartAssembling(
      leftWorkerWithItem,
      timeToAssemble,
    );

    return {
      updatedPair: {
        ...pair,
        leftWorker: updatedLeftWorker,
      },
      updatedBelt,
    };
  }

  if (canPickItem(pair.rightWorker, itemAtStation)) {
    const updatedBelt = [...belt];
    updatedBelt[beltIndex] = null;

    const rightWorkerWithItem = addItemToHand(pair.rightWorker, itemAtStation);
    const updatedRightWorker = maybeStartAssembling(
      rightWorkerWithItem,
      timeToAssemble,
    );

    return {
      updatedPair: {
        ...pair,
        rightWorker: updatedRightWorker,
      },
      updatedBelt,
    };
  }

  return {
    updatedPair: pair,
    updatedBelt: belt,
  };
};

const hasRequiredComponents = (worker: Worker): boolean => {
  return worker.hands.includes("A") && worker.hands.includes("B");
};

const maybeStartAssembling = (
  worker: Worker,
  timeToAssemble: number,
): Worker => {
  if (worker.assemblyTimeLeft > 0) {
    return worker;
  }

  if (!hasRequiredComponents(worker)) {
    return worker;
  }

  return {
    ...worker,
    assemblyTimeLeft: timeToAssemble,
  };
};

const finishProductAssembly = (worker: Worker): Worker => {
  return {
    ...worker,
    hands: ["C", null],
    assemblyTimeLeft: 0,
  };
};

const updateWorkerAssembly = (worker: Worker): Worker => {
  if (worker.assemblyTimeLeft === 0) {
    return worker;
  }

  const nextTicksRemaining = worker.assemblyTimeLeft - 1;

  if (nextTicksRemaining === 0) {
    return finishProductAssembly(worker);
  }

  return {
    ...worker,
    assemblyTimeLeft: nextTicksRemaining,
  };
};

export const updateAssemblyForPair = (pair: WorkerPair): WorkerPair => {
  return {
    ...pair,
    leftWorker: updateWorkerAssembly(pair.leftWorker),
    rightWorker: updateWorkerAssembly(pair.rightWorker),
  };
};

const isHoldingFinishedProduct = (worker: Worker): boolean => {
  return worker.hands.includes("C");
};

const removeFinishedProductFromHand = (worker: Worker): Worker => {
  const nextHands = [...worker.hands] as [Item, Item];
  const cIndex = nextHands.findIndex((item) => item === "C");

  if (cIndex === -1) {
    return worker;
  }

  nextHands[cIndex] = null;

  return {
    ...worker,
    hands: nextHands,
  };
};

export const processAllWorkerPairs = (
  state: SimulationState,
): SimulationState => {
  let nextBelt = [...state.belt];

  const nextWorkers = state.workers.map((pair) => {
    const result = processWorkerPair(pair, nextBelt);
    nextBelt = result.updatedBelt;
    return result.updatedPair;
  });

  return {
    ...state,
    workers: nextWorkers,
    belt: nextBelt,
  };
};

export const updateAssemblyForAllPairs = (
  state: SimulationState,
): SimulationState => {
  return {
    ...state,
    workers: state.workers.map(updateAssemblyForPair),
  };
};

export const runSimulation = ( config: SimulationConfig,
  randomNumberGenerator: () => number,
): SimulationState => {
  let state = createInitialState(config);

  for (let i = 0; i < config.steps; i++) {
    state = tick(state, randomNumberGenerator);
  }

  return state;
}