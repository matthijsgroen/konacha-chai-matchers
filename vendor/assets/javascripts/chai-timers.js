!function (context, definition) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd  === 'object') {
    define(definition);
  } else {
    if (!context.chai) throw new Error('Chai cannot be found in current scope.');
    context.chai.use(definition());
  }
}(this, function () {


  function require(p) {
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

  require.modules = {};

  require.resolve = function (path) {
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

  require.register = function (path, fn) {
    require.modules[path] = fn;
  };

  require.relative = function (parent) {
    return function(p){
      if ('.' != p[0]) return require(p);

      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();

      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };

  require.alias = function (from, to) {
    var fn = require.modules[from];
    require.modules[to] = fn;
  };


  require.register("chai-timers.js", function(module, exports, require){
    var Timer = require('./timer');

    module.exports = function (chai, _) {
      var Assertion = chai.Assertion;

      chai.Timer = Timer;

      chai.timer = function (name) {
        return new Timer(name);
      };

      Assertion.addProperty('timer', function () {
        this.assert(
            this._obj instanceof Timer
          , 'expected #{this} to be a chai timer'
          , 'expected #{this} to not be a chai timer' );
      });

      [ 'started', 'stopped', 'created' ].forEach(function (when) {
        Assertion.overwriteProperty(when, function (_super) {
          return function () {
            if (this._obj instanceof Timer) {
              _.flag(this, 'timer_when', when);
            } else {
              _super.call(this);
            }
          }
        });
      });

      Assertion.overwriteMethod('before', function (_super) {
        return function assertBefore (timer2, when2) {
          var timer1 = this._obj;
          new Assertion(timer1).to.be.a.timer;
          new Assertion(timer2).to.be.a.timer;

          var when1 = _.flag(this, 'timer_when') || 'started';
          when2 = when2 || when1;
          var time1 = timer1[when1].getTime()
            , time2 = timer2[when2].getTime();

          this.assert(
              time1 < time2
            , 'expected timer {' + timer1.name + '} to have been ' + when1 + ' before timer {' + timer2.name + '} was ' + when2
            , 'expected timer {' + timer1.name + '} to not have been ' + when1 + ' before timer {' + timer2.name + '} was ' + when2
          );
        };
      });

      Assertion.overwriteMethod('after', function (_super) {
        return function assertBefore (timer2, when2) {
          var timer1 = this._obj;
          new Assertion(timer1).to.be.a.timer;
          new Assertion(timer2).to.be.a.timer;

          var when1 = _.flag(this, 'timer_when') || 'started';
          when2 = when2 || when1;
          var time1 = timer1[when1].getTime()
            , time2 = timer2[when2].getTime();

          this.assert(
              time1 > time2
            , 'expected timer {' + timer1.name + '} to have been ' + when1 + ' after timer {' + timer2.name + '} was ' + when2
            , 'expected timer {' + timer1.name + '} to not have been ' + when1 + ' after timer {' + timer2.name + '} was' + when2
          );
        };
      });

    };

  }); // module: chai-timers.js

  require.register("timer.js", function(module, exports, require){

    module.exports = Timer;

    function Timer (name) {
      this.name = name || 'timer';
      this.created = new Date();
      this.marks = [];
      this.started = null;
      this.stopped = null;
    };

    Object.defineProperty(Timer.prototype, 'elapsed',
      { get: function () {
          var start = this.started.getTime()
            , stop = this.stopped.getTime();
          return stop - start;
        }
    });

    Timer.prototype.start = function (date) {
      this.started = date || new Date();
      return this;
    };

    Timer.prototype.stop = function (date) {
      this.stopped = date || new Date();
    };

    Timer.prototype.mark = function (date) {
      this.marks.push(date || new Date());
    };

  }); // module: timer.js

  require.alias("./chai-timers.js", "chai-timers");

  return require('chai-timers');
});
