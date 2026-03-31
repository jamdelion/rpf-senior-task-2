# Senior Engineer: Task 2

## Setup

Requires node and npm to be installed. 

Clone the repository and install the dependencies with:

```
npm install
```
 
 ## Running the simulation

 ### Single run

 ```
 npm run dev
 ```

 Sample output:

 ```
Final stats:
Finished products: 25
Unpicked A: 7
Unpicked B: 6
```

### Statistical analysis

To validate behaviour, multiple simulations can be run:

`npm run analysis`

Example output:

```
Averages over 1000 runs:
Finished products: 25.33
Unpicked A: 2.96
Unpicked B: 3.12
```

### Running tests

This project uses Vitest for testing. Run the test suite with:

```
npm run test
```

## Assumptions made

Aside from the requirements stipulated in the briefing, here are some other assumptions I've made for this simulation:

- The conveyor belt starts empty
- The number of workstations (pairs of workers) equals the number of slots on the conveyor belt
- The left worker gets priority for picking up and depositing items
- Workers can hold a product and a component at the same time

## Use of AI

I used an AI agent as a pairing partner for this task. I knew I wanted to approach this in a TDD manner (tests first), so I asked the agent (ChatGPT) to suggest a first test to try, plus a suggested implementation. We then iterated from there, adding more tests and growing the implementation until I was ready to run a full simulation.

A piece-meal approach like this allowed me to push back on things I didn't agree with very easily, and keep all the commits very neatly scoped. It also made sure that I understood every piece of code that was written, since I was always either writing it manually, or pasting in small functions. 
