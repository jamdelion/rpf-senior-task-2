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

export const createFakeRandomNumSequence = (values: number[]) => {
  let index = 0;

  return (): number => {
    if (index >= values.length) {
      throw new Error("Ran out of fake random values");
    }

    const value = values[index];

    if (value === undefined) {
      throw new Error("Fake random sequence returned undefined");
    }

    index++;
    return value;
  };
};
