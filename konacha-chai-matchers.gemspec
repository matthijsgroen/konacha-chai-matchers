# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "konacha-chai-matchers/version"

Gem::Specification.new do |s|
  s.name        = "konacha-chai-matchers"
  s.version     = Konacha::Chai::Matchers::VERSION
  s.authors     = ["Matthijs Groen"]
  s.email       = ["matthijs.groen@gmail.com"]
  s.homepage    = ""
  s.summary     = %q{TODO: Write a gem summary}
  s.description = %q{TODO: Write a gem description}

  s.rubyforge_project = "konacha-chai-matchers"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
