console.log("Hello Jo");

type SimulationConfig = {
  steps: number;
  beltLength: number;
  timeToAssemble: number;
};

type Item = "A" | "B" | "C";

type SimulationState = {
  currentStep: number;
  belt: Array<null | Item>;
  stats: SimulationStats;
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
    stats: {
      finishedProducts: 0,
      unpickedA: 0,
      unpickedB: 0,
    },
  };
};
