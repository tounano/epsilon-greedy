# epsilon-greedy

Abstract Epsilon Greedy algorithm.

This is an abstract implementation for the [Epsilon Greedy](http://stevehanov.ca/blog/index.php?id=132)
algorithm.

It's an abstract version, so you can use this module for any kind of split-test you'd like.

## Usage:

### var epsilonGreedy = EpsilonGreedy(?opts);

First you need create an instance of the `EpsilonGreedy` object.

**options:**

*  `pathToTrials` - (Optional|default=trials). Path to your trials property inside your variant object.
*  `pathToRewards` - (Optional|default=rewards). Path to your rewards property inside your variant object.
*  `handlers` - (Optional array of handlers). Read more about handlers bellow.

### Handlers

Handlers are the functions that decide which variant will win.

Here is how you define the handlers array:

```js
var epsilonGreedy = EpsilonGreedy({
  handlers: [
    {epsilon: 0.1, handler: function someHandler (variant) {//some code}},
    {epsilon: 0.1, handler: function anotherHandler (variant) {//some code}},
    function finalHandler(variant) { //some code}
  ]
});
```

The way it works, is that it'll pick `someHandler` 10% of the tests. 90% of the tests would be handled
  by other handlers. Which means, that `anotherHandler` would be picked 10% * 90% of the tests, which
  is 9%.

`finalHandler` does not have an epsilon assigned to it. Whenever you're not specifying an `epsilon`, the
epsilon would be equal to `1`.

So eventually we could write the last line as:

```js
{epsilon: 1, handler: function finalHandler(variant) { //some code}}
```

#### Predefined Handlers

`epsilon-greedy` comes out of the box with some ready to go handlers.

##### EpsilonGreedy.handlers.randomExploration

This handler will pick a random variant.

##### EpsilonGreedy.handlers.trialsBellowAverageExploration

In the original EpsilonGreedy algorithm, it's recommended to run 1,000 tests on each variant
prior using this algorithm.

It might be a problem in 2 cases:

-  When you're constantly adding new variants.
-  When you need way more trials for a reward.

This handler will calculate the amount of trials needed for 1 reward and it'll pick the the first
variant that has no rewards and it's amount of trials is bellow the average amount. The variants
would be sorted in ascending order based on amount of trials.

In case all variants has rewards, this handler will be ignored and it's epsilon would pass to the
next handler.

##### EpsilonGreedy.handlers.bestVariantExploitation

This handler will pick the variant with the highest success rate.

##### EpsilonGreedy.handlers.numberedExploiter(index)

In some cases you may want to give some test share for the 2nd best variant or the 3rd
best variant as well.

This handler will pick a numbered variant based on success rate.

`index` is a number between 0 and `variants.length-1`.

If you specify a number that is out of the scope, the index would be `0` (aka the best variant).

#### Handler priority

If the handler can't handle the current test, `EpsilonGreedy` will skip the handler and will split
it's `epsilon` value to the rest of the handlers.

An example for a use case it might happen would be the case of `trialsBellowAverageExploration`. This
handler would be ignored in case all the variants has at least one reward or all the variants has passed
the minimum amount of trials for 1 reward.

**Usage:**

```js
{epsilon: 0.1, handler: EpsilonGreedy.handlers.numberedExploiter(1) // Would pick the 2nd best
```

#### Developing your own handlers

A handler is a basic js function that gets the variants as it's argument.

It should return a variant or `undefined`. If it returns `undefined`, this handler will be skipped and
it's epsilon will be shared by the remaining handlers in the pipeline.

**Example:**

```js
function randomExploration(variants) {
  return _.shuffle(variants)[0];
}
```

#### Default Handlers

The default handler setup is the most popular way of using this algorithm:

```js
var epsilonGreedy = EpsilonGreedy({
  handlers: [
    {epsilon: 0.1, handler: randomExploration},
    bestVariantExploitation
  ]
});
```

#### My favorite way of structuring handlers

```js
var epsilonGreedy = EpsilonGreedy({
  handlers: [
    {epsilon: 0.1, handler: randomExploration},
    {epsilon: 0.1, handler: trialsBellowAverageExploration},
    bestVariantExploitation
  ]
});
```

### var winner = epsilonGreedy(variants)

Finally, after everything is set, we wanna get our winning variant for the current test.

`variants` should be an array of `json objects`. Each variant should have a property that
contains the amount of trials and the amount of rewards.

You can specify the name of those properties in EpsilonGreedy options.

## Example

```js
var EpsilonGreedy = require('epsilon-greedy');

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
```

## install

With [npm](https://npmjs.org) do:

```
npm install epsilon-greedy
```

## license

MIT