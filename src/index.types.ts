export type SimulationConfig = {
  steps: number;
  beltLength: number;
  timeToAssemble: number;
};

export type Item = "A" | "B" | "C" | null;

export type IncomingItem = Exclude<Item, "C">

export type WorkerPair = {
  stationIndex: number;
  leftWorker: Worker;
  rightWorker: Worker;
};

export type Worker = {
  hands: [Item, Item];
  assemblyTimeLeft: number
};

export type SimulationState = {
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
