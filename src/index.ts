import type { SimulationConfig, SimulationState } from "./index.types.js";

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
