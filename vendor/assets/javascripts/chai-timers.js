!function (name, definition) {
  if (typeof define == 'function' && typeof define.amd  == 'object') define(definition);
  else this[name] = definition();
}('chai_timers', function () {
  // CommonJS require()
  function require(p){
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

  require.resolve = function (path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

  require.register = function (path, fn){
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


require.register("timers", function (module, exports, require) {

module.exports = function (chai, _) {

  chai.Timer = function (name) {
    this.name = name || 'timer';
    this.created = new Date();
    this.marks = [];
    this.started = null;
    this.stopped = null;
  };

  chai.Timer.prototype.start = function (date) {
    this.started = date || new Date();
    return this;
  };

  chai.Timer.prototype.stop = function (date) {
    this.stopped = date || new Date();
  };

  chai.Timer.prototype.mark = function (date) {
    this.marks.push(date || new Date());
  };

  Object.defineProperty(chai.Timer.prototype, 'elapsed',
    { get: function () {
        var start = this.started.getTime()
          , stop = this.stopped.getTime();
        return stop - start;
      }
    , configurable: true
  });

  Object.defineProperty(chai.Timer.prototype, 'marks',
    { get: function () {
        var marks = _.flag(this, 'marks');
        return marks;
      }
    , configurable: true
  });

  chai.Assertion.addProperty('timer', function () {
    this.assert(
        this._obj instanceof chai.Timer
      , 'expected #{this} to be a chai timer'
      , 'expected #{this} to not be a chai timer' );
  });

  [ 'started', 'stopped', 'created' ].forEach(function (when) {
    chai.Assertion.overwriteProperty(when, function (_super) {
      return function () {
        if (this._obj instanceof chai.Timer) {
          _.flag(this, 'timer_when', when);
        } else {
          _super.call(this);
        }
      }
    });
  });

  chai.Assertion.overwriteMethod('before', function (_super) {
    return function assertBefore (timer2, when2) {
      var timer1 = this._obj;
      new chai.Assertion(timer1).to.be.a.timer;
      new chai.Assertion(timer2).to.be.a.timer;

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

  chai.Assertion.overwriteMethod('after', function (_super) {
    return function assertBefore (timer2, when2) {
      var timer1 = this._obj;
      new chai.Assertion(timer1).to.be.a.timer;
      new chai.Assertion(timer2).to.be.a.timer;

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

}); // module timers
  return require('timers');
});

chai.use(chai_timers);
