console.log("Hello Jo");

type SimulationConfig = {
  steps: number;
  beltLength: number;
  timeToAssemble: number;
};

type Item = "A" | "B" | "C" | null;

type WorkerPair = {
  stationIndex: number;
  leftWorker: Worker;
  rightWorker: Worker;
};

type Worker = {
  hands: [Item, Item];
};

type SimulationState = {
  currentStep: number;
  belt: Array<Item>;
  stats: SimulationStats;
  workers: Array<WorkerPair>;
};

type SimulationStats = {
  finishedProducts: number;
  unpickedA: number;
  unpickedB: number;
};

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
