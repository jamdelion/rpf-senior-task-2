import type {
  IncomingItem,
  Item,
  SimulationConfig,
  SimulationState,
  Worker,
  WorkerPair,
} from "./index.types.js";

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
      },
      rightWorker: {
        hands: [null, null],
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
  return addItemAtStart(movedState, newItem);
};

const hasEmptyHand = (worker: Worker): Boolean => {
  return worker.hands.includes(null);
};

const canPickItem = (worker: Worker, item: Item): boolean => {
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
): { updatedPair: WorkerPair; updatedBelt: Array<Item> } => {
  const beltIndex = pair.stationIndex - 1;
  const itemAtStation = belt[beltIndex] as Item;

  if (itemAtStation === null || itemAtStation === "C") {
    return {
      updatedPair: pair,
      updatedBelt: belt,
    };
  }

  // left worker gets priority
  if (canPickItem(pair.leftWorker, itemAtStation)) {
    const updatedBelt = [...belt];
    updatedBelt[beltIndex] = null;

    return {
      updatedPair: {
        ...pair,
        leftWorker: addItemToHand(pair.leftWorker, itemAtStation),
      },
      updatedBelt,
    };
  }

  if (canPickItem(pair.rightWorker, itemAtStation)) {
    const updatedBelt = [...belt];
    updatedBelt[beltIndex] = null;

    return {
      updatedPair: {
        ...pair,
        rightWorker: addItemToHand(pair.rightWorker, itemAtStation),
      },
      updatedBelt,
    };
  }

  return {
    updatedPair: pair,
    updatedBelt: belt,
  };
};
