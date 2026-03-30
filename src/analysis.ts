import { STANDARD_CONFIG } from "./constants.js";
import { runSimulation } from "./index.js";
import type { SimulationConfig } from "./index.types.js";

export const runMultipleSimulations = (
  config: SimulationConfig,
  runs: number,
  rngFactory: () => () => number = () => Math.random,
) => {
  let totalFinished = 0;
  let totalUnpickedA = 0;
  let totalUnpickedB = 0;

  for (let i = 0; i < runs; i++) {
    const finalState = runSimulation(config, Math.random);

    totalFinished += finalState.stats.finishedProducts;
    totalUnpickedA += finalState.stats.unpickedA;
    totalUnpickedB += finalState.stats.unpickedB;
  }

  return {
    averageFinished: totalFinished / runs,
    averageUnpickedA: totalUnpickedA / runs,
    averageUnpickedB: totalUnpickedB / runs,
  };
};

const averages = runMultipleSimulations(STANDARD_CONFIG, 1000);

console.log("\nAverages over 1000 runs:");
console.log(`Finished products: ${averages.averageFinished.toFixed(2)}`);
console.log(`Unpicked A: ${averages.averageUnpickedA.toFixed(2)}`);
console.log(`Unpicked B: ${averages.averageUnpickedB.toFixed(2)}`);