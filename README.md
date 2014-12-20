Konacha Chai Matchers
=====================

[![Gem Version](https://fury-badge.herokuapp.com/rb/konacha-chai-matchers.png)](http://badge.fury.io/rb/konacha-chai-matchers)

This library contains all [Chai.js plugins](http://chaijs.com/plugins)
that have browser support.

Not all plugins are tested!

Installation
------------

Add in the `Gemfile`:

    gem 'konacha-chai-matchers'


Usage
-----

1. Check the vendor/assets/javascripts
2. Require the files needed

Example:

    #= require sinon
    #= require chai-changes
    #= require js-factories
    #= require chai-backbone
    #= require chai-jquery

Contribution
------------

Please submit an Github issue for libraries you want included or where the wrong file ends up in the `vendor` folder.

Updating the vendor libraries is done through `rake update`

please check `tasks/update.rb` for the code

