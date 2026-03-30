import type { Item, WorkerPair, Worker } from "../index.types.js";

const createWorker = (hands: [Item, Item] = [null, null]): Worker => ({
  hands,
});

export const createWorkerPair = (
  leftHands: [Item, Item] = [null, null],
  rightHands: [Item, Item] = [null, null],
  stationIndex = 1,
): WorkerPair => ({
  stationIndex,
  leftWorker: createWorker(leftHands),
  rightWorker: createWorker(rightHands),
});