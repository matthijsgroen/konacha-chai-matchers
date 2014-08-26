(function (chaiJsFactories) {
    // Module systems magic dance.
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // NodeJS
        module.exports = chaiJsFactories;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(['js-factories'], function ($) {
            return function (chai, utils) {
                return chaiJsFactories(chai, utils, Factory);
            };
        });
    } else {
        // Other environment (usually <script> tag): plug in to global chai instance directly.
        chai.use(function (chai, utils) {
            return chaiJsFactories(chai, utils, Factory);
        });
    }
}(function (chai, utils, jsFactories) {

    jsFactories = jsFactories || Factory;


    chai.factory = jsFactories;

}));
