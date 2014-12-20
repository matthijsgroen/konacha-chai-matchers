var color = require('onecolor');

module.exports = function (chai, utils) {
  chai.Assertion.addMethod('colored', function (colorString) {
    var expected = color(colorString),
        actual = color(this._obj);

    this.assert(
      actual.equals(expected),
      'expected #{act} to be the same color as #{exp}',
      'expected #{act} to be a different color than #{exp}',
      expected.hex(),
      actual.hex()
    );
  });
};