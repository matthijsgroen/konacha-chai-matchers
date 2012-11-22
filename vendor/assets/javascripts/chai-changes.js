(function(chaiChanges) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    return module.exports = chaiChanges;
  } else if (typeof define === "function" && define.amd) {
    return define(function() {
      return chaiChanges;
    });
  } else {
    return chai.use(chaiChanges);
  }
})(function(chai, utils) {
  var changeBy, changeByAssert, changeFrom, changeFromAssert, changeFromBeginAssert, changeTo, changeToAssert, changeToBeginAssert, flag, formatFunction, inspect, noChangeAssert;
  inspect = utils.inspect;
  flag = utils.flag;
  /*
    #
    # Changes Matchers
    #
  */

  chai.Assertion.addMethod('when', function(val) {
    var action, definedActions, _i, _j, _len, _len1, _results;
    definedActions = flag(this, 'whenActions') || [];
    for (_i = 0, _len = definedActions.length; _i < _len; _i++) {
      action = definedActions[_i];
      if (typeof action.before === "function") {
        action.before(this);
      }
    }
    val();
    _results = [];
    for (_j = 0, _len1 = definedActions.length; _j < _len1; _j++) {
      action = definedActions[_j];
      _results.push(typeof action.after === "function" ? action.after(this) : void 0);
    }
    return _results;
  });
  noChangeAssert = function(context) {
    var endValue, negate, object, relevant, result, startValue;
    relevant = flag(context, 'no-change');
    if (!relevant) {
      return;
    }
    negate = flag(context, 'negate');
    flag(context, 'negate', this.negate);
    object = flag(context, 'object');
    startValue = flag(context, 'changeStart');
    endValue = object();
    result = !utils.eql(endValue, startValue);
    context.assert(result, "expected `" + (formatFunction(object)) + "` to change, but it stayed " + (utils.inspect(startValue)), "expected `" + (formatFunction(object)) + "` not to change, but it changed from " + (utils.inspect(startValue)) + " to " + (utils.inspect(endValue)));
    return flag(context, 'negate', negate);
  };
  changeByAssert = function(context) {
    var actualDelta, endValue, negate, object, startValue;
    negate = flag(context, 'negate');
    flag(context, 'negate', this.negate);
    object = flag(context, 'object');
    startValue = flag(context, 'changeStart');
    endValue = object();
    actualDelta = endValue - startValue;
    context.assert(this.expectedDelta === actualDelta, "expected `" + (formatFunction(object)) + "` to change by " + this.expectedDelta + ", but it changed by " + actualDelta, "expected `" + (formatFunction(object)) + "` not to change by " + this.expectedDelta + ", but it did");
    return flag(context, 'negate', negate);
  };
  changeToBeginAssert = function(context) {
    var negate, object, result, startValue;
    negate = flag(context, 'negate');
    flag(context, 'negate', this.negate);
    object = flag(context, 'object');
    startValue = object();
    result = !utils.eql(startValue, this.expectedEndValue);
    if (negate) {
      result = !result;
    }
    context.assert(result, "expected `" + (formatFunction(object)) + "` to change to " + (utils.inspect(this.expectedEndValue)) + ", but it was already " + (utils.inspect(startValue)), "not supported");
    return flag(context, 'negate', negate);
  };
  changeToAssert = function(context) {
    var endValue, negate, object, result;
    negate = flag(context, 'negate');
    flag(context, 'negate', this.negate);
    object = flag(context, 'object');
    endValue = object();
    result = utils.eql(endValue, this.expectedEndValue);
    context.assert(result, "expected `" + (formatFunction(object)) + "` to change to " + (utils.inspect(this.expectedEndValue)) + ", but it changed to " + (utils.inspect(endValue)), "expected `" + (formatFunction(object)) + "` not to change to " + (utils.inspect(this.expectedEndValue)) + ", but it did");
    return flag(context, 'negate', negate);
  };
  changeFromBeginAssert = function(context) {
    var negate, object, result, startValue;
    negate = flag(context, 'negate');
    flag(context, 'negate', this.negate);
    object = flag(context, 'object');
    startValue = object();
    result = utils.eql(startValue, this.expectedStartValue);
    context.assert(result, "expected the change of `" + (formatFunction(object)) + "` to start from " + (utils.inspect(this.expectedStartValue)) + ", but it started from " + (utils.inspect(startValue)), "expected the change of `" + (formatFunction(object)) + "` not to start from " + (utils.inspect(this.expectedStartValue)) + ", but it did");
    return flag(context, 'negate', negate);
  };
  changeFromAssert = function(context) {
    var endValue, negate, object, result, startValue;
    negate = flag(context, 'negate');
    flag(context, 'negate', this.negate);
    object = flag(context, 'object');
    startValue = flag(context, 'changeStart');
    endValue = object();
    result = !utils.eql(startValue, endValue);
    if (negate) {
      result = !result;
    }
    context.assert(result, "expected `" + (formatFunction(object)) + "` to change from " + (utils.inspect(this.expectedStartValue)) + ", but it did not change", "not supported");
    return flag(context, 'negate', negate);
  };
  chai.Assertion.addProperty('change', function() {
    var definedActions;
    flag(this, 'no-change', true);
    definedActions = flag(this, 'whenActions') || [];
    definedActions.push({
      negate: flag(this, 'negate'),
      before: function(context) {
        var startValue;
        startValue = flag(context, 'object')();
        return flag(context, 'changeStart', startValue);
      },
      after: noChangeAssert
    });
    return flag(this, 'whenActions', definedActions);
  });
  formatFunction = function(func) {
    return func.toString().replace(/^\s*function \(\) {\s*/, '').replace(/\s+}$/, '').replace(/\s*return\s*/, '');
  };
  changeBy = function(delta) {
    var definedActions;
    flag(this, 'no-change', false);
    definedActions = flag(this, 'whenActions') || [];
    definedActions.push({
      negate: flag(this, 'negate'),
      expectedDelta: delta,
      after: changeByAssert
    });
    return flag(this, 'whenActions', definedActions);
  };
  chai.Assertion.addChainableMethod('by', changeBy, function() {
    return this;
  });
  changeTo = function(endValue) {
    var definedActions;
    flag(this, 'no-change', false);
    definedActions = flag(this, 'whenActions') || [];
    definedActions.push({
      negate: flag(this, 'negate'),
      expectedEndValue: endValue,
      before: changeToBeginAssert,
      after: changeToAssert
    });
    return flag(this, 'whenActions', definedActions);
  };
  chai.Assertion.addChainableMethod('to', changeTo, function() {
    return this;
  });
  changeFrom = function(startValue) {
    var definedActions;
    flag(this, 'no-change', false);
    definedActions = flag(this, 'whenActions') || [];
    definedActions.push({
      negate: flag(this, 'negate'),
      expectedStartValue: startValue,
      before: changeFromBeginAssert,
      after: changeFromAssert
    });
    return flag(this, 'whenActions', definedActions);
  };
  return chai.Assertion.addChainableMethod('from', changeFrom, function() {
    return this;
  });
});
