(function () {
  'use strict';
  /*jshint -W003*/

  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    // NodeJS
    module.exports = getPayload(
      require('tv4'),
      require('jsonpointer.js')
    );
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define('chai-json-schema', [
      'tv4',
      'jsonpointer'
    ], function (tv4, jsonpointer) {
      return getPayload(tv4, jsonpointer);
    });
  } else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    chai.use(getPayload(
      window.tv4,
      window.jsonpointer
    ));
  }

  function getPayload(tv4Module, jsonpointer) {
    // return the chai plugin (a function)
    return function (chai, utils) {
      var assert = chai.assert;
      var flag = utils.flag;

      // check if we have all dependencies
      assert.ok(tv4Module, 'tv4 dependency');
      assert.ok(jsonpointer, 'jsonpointer dependency');

      // export and use our own instance
      chai.tv4 = tv4Module.freshApi();
      chai.tv4.cyclicCheck = false;
      chai.tv4.banUnknown = false;
      chai.tv4.multiple = false;

      function forEachI(arr, func, scope) {
        for (var i = 0, ii = arr.length; i < ii; i++) {
          func.call(scope, arr[i], i, arr);
        }
      }

      // make a compact debug string from any object
      function valueStrim(value, cutoff) {
        var strimLimit = typeof cutoff === 'undefined' ? 60 : cutoff;

        var t = typeof value;
        if (t === 'function') {
          return '[function]';
        }
        if (t === 'object') {
          value = JSON.stringify(value);
          if (value.length > strimLimit) {
            value = value.substr(0, strimLimit) + '...';
          }
          return value;
        }
        if (t === 'string') {
          if (value.length > strimLimit) {
            return JSON.stringify(value.substr(0, strimLimit)) + '...';
          }
          return JSON.stringify(value);
        }
        return '' + value;
      }

      function extractSchemaLabel(schema, max) {
        max = typeof max === 'undefined' ? 40 : max;
        var label = '';
        if (schema.id) {
          label = schema.id;
        }
        if (schema.title) {
          label += (label ? ' (' + schema.title + ')' : schema.title);
        }
        if (!label && schema.description) {
          label = valueStrim(schema.description, max);
        }
        if (!label) {
          label = valueStrim(schema, max);
        }
        return label;
      }

      // print validation errors
      var formatResult = function (error, data, schema, indent) {
        var schemaValue;
        var dataValue;
        var schemaLabel;

        // assemble error string
        var ret = '';
        ret += '\n' + indent + error.message;

        schemaLabel = extractSchemaLabel(schema, 60);
        if (schemaLabel) {
          ret += '\n' + indent + '    schema: ' + schemaLabel;
        }
        if (error.schemaPath) {
          schemaValue = jsonpointer.get(schema, error.schemaPath);
          ret += '\n' + indent + '    rule:   ' + error.schemaPath + ' -> ' + valueStrim(schemaValue);
        }
        if (error.dataPath) {
          dataValue = jsonpointer.get(data, error.dataPath);
          ret += '\n' + indent + '    field:  ' + error.dataPath + ' -> ' + utils.type(dataValue) + ': ' + valueStrim(dataValue);
        }

        // sub errors are not implemented (yet?)
        // https://github.com/chaijs/chai-json-schema/issues/3
        /*if (error.subErrors) {
         forEachI(error.subErrors, function (error) {
         ret += formatResult(error, data, schema, indent + indent);
         });
         }*/
        return ret;
      };

      // add the method
      chai.Assertion.addMethod('jsonSchema', function (schema, msg) {
        if (msg) {
          flag(this, 'message', msg);
        }
        var obj = this._obj;

        // note: don't assert.ok(obj) -> zero or empty string is a valid and describable json-value
        assert.ok(schema, 'schema');

        // single result
        var result = null;
        if (chai.tv4.multiple) {
          result = chai.tv4.validateMultiple(obj, schema, chai.tv4.cyclicCheck, chai.tv4.banUnknown);
        } else {
          result = chai.tv4.validateResult(obj, schema, chai.tv4.cyclicCheck, chai.tv4.banUnknown);
        }
        // assertion fails on missing schemas
        var pass = result.valid && (result.missing.length === 0);

        // assemble readable message
        var label = extractSchemaLabel(schema, 30);

        // assemble error report
        var details = '';
        if (!pass) {
          var indent = '      ';
          details += ' -> \'' + valueStrim(obj, 30) + '\'';

          if (result.error) {
            details += formatResult(result.error, obj, schema, indent);
          }
          else if (result.errors) {
            forEachI(result.errors, function (error) {
              details += formatResult(error, obj, schema, indent);
            });
          }

          if (result.missing.length === 1) {
            details += '\n' + 'missing 1 schema: ' + result.missing[0];
          }
          else if (result.missing.length > 0) {
            details += '\n' + 'missing ' + result.missing.length + ' schemas:';
            forEachI(result.missing, function (missing) {
              details += '\n' + missing;
            });
          }
        }
        // pass hardcoded strings and no actual value (mocha forces nasty string diffs)
        this.assert(
          pass
          , 'expected value to match json-schema \'' + label + '\'' + details
          , 'expected value not to match json-schema \'' + label + '\'' + details
          , label
        );
      });

      // export tdd style
      assert.jsonSchema = function (val, exp, msg) {
        new chai.Assertion(val, msg).to.be.jsonSchema(exp);
      };
      assert.notJsonSchema = function (val, exp, msg) {
        new chai.Assertion(val, msg).to.not.be.jsonSchema(exp);
      };
    };
  }
}());
