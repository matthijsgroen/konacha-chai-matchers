/*!
 * chai-param
 * Copyright(c) 2014 The Blacksmith (a.k.a. Saulo Vallory) <jake@alogicalparadox.com>
 * MIT Licensed
 */

var path = require('path'),
    chalk = require('chalk'),
    stackTrace = require('stack-trace'),
    chai = require('chai'),
    utils = require('chai/lib/chai/utils');

var exports = module.exports = chaiParam;

chaiParam.config = require('./config');

// chalk wrapper for easy enabling and disabling colors
function c(color, text) {
  if(chaiParam.config.disableColors)
    return text;

  return chalk[color](text);
}

function chaiParam(chai, utils) {

  if(chaiParam._param)
    // already initialized
    return;

  var flag = utils.flag
    , objDisplay = utils.objDisplay;

  chaiParam._param = function param(val, paramName, functionName, topic) {
    var assertion = new chai.Assertion(val, functionName);

    utils.flag(assertion, 'paramName', paramName);

    if(functionName && functionName.trim && functionName.trim() != '')
      utils.flag(assertion, 'functionName', functionName);

    if(topic && topic.trim && topic.trim() != '')
      utils.flag(assertion, 'message', topic);

    return { should: assertion };
  }

  /**
   * ### .param(paramName, functionName)
   *
   * The `param` chain allows you provide metadata about
   * the parameter being validated.
   *
   *     // examples
   *     expect(text).param('text', 'log').to.be.a('string');
   *     expect(user).param('user', 'register').to.have.length.below(16);
   *
   * @name param
   * @param {String} paramName
   * @param {String} functionName _optional_ Adding this allows chai-param to look for the caller
   * @api public
   */
  utils.addMethod(chai.Assertion.prototype, 'param', function(paramName, functionName) {
    utils.flag(this, 'paramName', paramName);

    if(functionName && functionName.trim && functionName.trim() != '')
      utils.flag(this, 'functionName', functionName);
  });

  if(chaiParam.config.improveMessages) {

    // Overwriting getMessages
    var oldGetMessage = utils.getMessage;
    
    utils.getMessage = function getMessage (obj, args) {

      if(!chaiParam.config.improveMessages)
      {
        return oldGetMessage(obj, args);
      }

      var negate = utils.flag(obj, 'negate')
        , val = utils.flag(obj, 'object')
        , expected = args[3]
        , actual = utils.getActual(obj, args)
        , msg = negate ? args[2] : args[1]
        , flagMsg = utils.flag(obj, 'message')
        , flagParam = utils.flag(obj, 'paramName')
        , fnTarget = utils.flag(obj, 'functionName');

      msg = msg || '';

      var hasActToken = msg.indexOf('#{act}') >= 0;

      msg = msg
        .replace(/#{this}/g, flagParam ? 'parameter ' + c('yellow', flagParam) + ' ('+objDisplay(val)+')': objDisplay(val))
        .replace(/#{act}/g, c('red', objDisplay(actual)))
        .replace(/#{exp}/g, c('green', objDisplay(expected)))
        .replace(/(not) to/, c('green', 'not') + ' to').replace(/to not/, 'to ' + c('green', 'not'))
        .replace(/(length )?(below|at least|above|at most|within)(\s*)([0-9]*)/, c('green', '$1$2$3$4'))
        .replace(/(include|truthy|falsy|true|false|undefined|match|satisfy|same members as)/, c('green', '$1'))
        .replace(/(exist|empty|arguments|equal|deeply equal|instance of|be a superset)/, c('green', '$1'));

      if(flagParam && !hasActToken)
        msg += ' but got ' + c('red', objDisplay(val)) + ' instead';

      var isNode = (typeof window == 'undefined');

      if(chaiParam.config.showCaller && isNode && fnTarget) // show Caller
      {
        var trace = stackTrace.get();

        var i = 0;

        if(fnTarget) {
          while(i < trace.length && trace[i].getFunctionName() != fnTarget) {
            i++;
          }

          if(++i < trace.length) {
            var file = trace[i].getFileName();
            var filePath = path.dirname(file) + path.sep + c('blue', path.basename(file));

            var spaces = flagMsg ? flagMsg.replace(/./g, ' ') : '';

            msg += '\n' + spaces + '  - Called at: ' + filePath + ':' + c('blue', trace[i].getLineNumber());
          }
        }
      }

      return flagMsg ? flagMsg + ': ' + msg : msg;
    };
  }
}

/**
 * ### param(value, name, function)
 *
 * The `param` method allows you to use the should syntax
 * and still provide metadata about the parameter being validated.
 *
 *     // examples
 *     param(text, 'text', 'log').should.be.a('string');
 *     param(user, 'user', 'register').should.have.length.below(16);
 *
 * @name param
 * @param {Mixed} value
 * @param {String} paramName
 * @param {String} functionName _optional_ Adding this allows chai-param to look for the caller
 * @param {String} topic _optional_ A prefix for the message
 * @api public
 */
chaiParam.param = function param(val, paramName, functionName, topic) {

  if(!chaiParam._param) {
    throw new Error("You need to add chai-param to chai through `chai.use()` method before using it")
  }

  return chaiParam._param(val, paramName, functionName, topic);
};
