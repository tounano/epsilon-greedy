var EpsilonGreedy = require('../');
var epsilonGreedy = EpsilonGreedy({
  handlers: [
    {epsilon: 0.1, handler: EpsilonGreedy.handlers.randomExploration},
    {epsilon: 0.1, handler: EpsilonGreedy.handlers.trialsBellowAverageExploration},
    EpsilonGreedy.handlers.bestVariantExploitation
  ]
});

console.log(epsilonGreedy([
  {trials: 100, rewards: 1},
  {trials: 70, rewards: 2},
  {trials: 80, rewards: 0},
  {trials: 32, rewards: 0},
  {trials: 20, rewards: 0}
]));