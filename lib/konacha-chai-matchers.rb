require "konacha-chai-matchers/version"
require 'pathname'
require 'json'

module Konacha
  module Chai
    module Matchers
      class Engine < ::Rails::Engine
      end

      autoload :Collector, 'konacha-chai-matchers/collector'
      autoload :Library,   'konacha-chai-matchers/library'

    end
  end
end

