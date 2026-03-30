import type { Item, Worker, WorkerPair } from "../index.types.js";

export const createWorker = (
  hands: [Item, Item] = [null, null],
  assemblyTimeLeft = 0,
): Worker => ({
  hands,
  assemblyTimeLeft,
});

export const createWorkerPair = (
  leftWorker: Worker = createWorker(),
  rightWorker: Worker = createWorker(),
  stationIndex = 1,
): WorkerPair => ({
  stationIndex,
  leftWorker,
  rightWorker,
});
