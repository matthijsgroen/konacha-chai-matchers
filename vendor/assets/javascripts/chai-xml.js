/**
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 * @license MIT <https://raw.githubusercontent.com/krampstudio/chai-xml/master/LICENSE>
 */

var xml2js = require('xml2js');

/**
 * This plugin provides basic XML assertions.
 * @exports chai-xml
 */
var chaiXmlPlugin = function chaiXmlPlugin(chai, utils){
    var flag = utils.flag;
    var Assertion = chai.Assertion;

    /**
     * Add the chainable property xml.
     * It's used to flag the current chain we are in an xml chain.
     */
    Assertion.addProperty('xml', function () {

        //objects must a strings (right now)
        new Assertion(this._obj).to.be.a('string');

        //flag it as xml
        flag(this, 'xml', true);

    });

    /**
     * Add the valid method.
     * Check whether the XML is well-formed (not validated against DTD, XSD,
     * but it could be implemented in a further version).
     */
    Assertion.addMethod('valid', function (value) {
        var self = this;
        new Assertion(flag(this, 'xml')).to.be.true;

        new xml2js.Parser().parseString(this._obj, function(err, result){
            self.assert(
                err === null,
                'expected #{this} to be valid',
                'expected #{this} not be not valid',
                err
            );
        });
    });

    /**
     * Overwrite the equal/eq/equals methods to compare XML strings.
     * The strings are mapped to objects using xml2js that are deeply compared)
     */
    var compareXml = function(_super){
        var self = this;
        return function assertEqual(value){
            var negate;
            var parser;
            if(flag(this, 'xml')){
                negate = flag(this, 'negate');
                parser = new xml2js.Parser({trim: flag(this, 'deep')});
                parser.parseString(this._obj, function(err, actual){
                    new Assertion(err).to.be.null;
                    parser.parseString(value, function(err, expected){
                        new Assertion(err).to.be.null;
                        if(negate){
                            new Assertion(actual).to.not.deep.equals(expected);
                        } else {
                            new Assertion(actual).to.deep.equals(expected);
                        }
                    });
                });
            } else {
                _super.apply(this, arguments);
            }
        };
    };
   Assertion.overwriteMethod('equal', compareXml);
   Assertion.overwriteMethod('equals', compareXml);
   Assertion.overwriteMethod('eq', compareXml);

};

module.exports = chaiXmlPlugin;
