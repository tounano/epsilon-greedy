var _ = require('underscore');

function randomExploration(variants) {
  return _.shuffle(variants)[0];
}

function trialsBellowAverageExploration(variants) {
  if (_.chain(variants).pluck('rewards').min().value() > 0 || _.chain(variants).pluck('rewards').max().value() == 0) return;

  var hasRewards = _.filter(variants, function (variant) { return variant.rewards > 0 });
  var rewardRate = sum(_.pluck(hasRewards, 'rewards'))/sum(_.pluck(hasRewards, 'trials'));
  var bellowAverageTrials = _.filter(variants, function (variant) {
    return variant.rewards < 1 && variant.trials <= Math.ceil(1/rewardRate);
  });

  if (!bellowAverageTrials.length) return;

  return _.sortBy(bellowAverageTrials, function (variant) {return variant.trials})[0];
}

function numberedExploiter(index) {
  return function numberedExploitation(variants) {
    variants = _.chain(variants)
      .sortBy(function (variant) {return variant.trials})
      .sortBy(function (variant) {return 0 - (variant.rewards > 0 ? variant.rewards / variant.trials : 0)})
      .value();

    return (variants[index] || variants[0]);
  }
}

function bestVariantExploitation(variant) {
  return numberedExploiter(0)(variant);
}

function sum(list) {
  return _.reduce(list, function (memo, num) {return num+memo;}, 0);
}

var defaults = {
  pathToTrials: 'trials',
  pathToRewards: 'rewards',
  handlers: [
    {epsilon: 0.1, handler: randomExploration},
    bestVariantExploitation
  ]
}

function EpsilonGreedy(opts) {
  opts = _.defaults(opts || {}, defaults);

  return function epsilonGreedy(variants) {
    var handlers = _prepareHandlers(_.clone(opts.handlers));
    var _variants = _mapVariants(variants);
    var _winner;

    while (handlers.length && !_winner) {
      var handler = handlers.shift();

      if (Math.round(Math.random() * 100) <= Math.round(handler.epsilon * 100)) {
        _winner = handler.handler(_.clone(_variants));
      }
    }

    _winner = _winner || _variants[0];

    return variants[_winner.key];
  }

  function _mapVariants(variants) {
    var _variants = _.clone(variants);

    _.each(_variants, function (variant, key) {
      var _variant = _.clone(variant);
      _variant.key = key;
      _variant.trials = variant[opts.pathToTrials];
      _variant.rewards = variant[opts.pathToRewards];
      _variants[key] = _variant;
    })

    return _variants;
  }

  function _prepareHandlers(handlers) {
    return _.chain(handlers)
      .map(function _ensureJsonHandler (handler) {
        if (typeof handler == 'function') {
          var json = {};
          json.handler = handler;
          return json;
        }

        return _.clone(handler);
      })
      .map(function _ensureEpsilonExists(handler) {
        handler['epsilon'] = handler['epsilon'] || 1;
        return handler;
      })
      .value();
  }
}

module.exports = EpsilonGreedy;

_.extend(module.exports, {
  handlers: {
    trialsBellowAverageExploration: trialsBellowAverageExploration,
    randomExploration: randomExploration,
    numberedExploiter: numberedExploiter,
    bestVariantExploitation: bestVariantExploitation
  }
})
