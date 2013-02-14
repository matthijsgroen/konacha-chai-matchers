require 'rails'
require File.join(File.expand_path(File.dirname(__FILE__)), '../lib/konacha-chai-matchers')

desc 'updates all submodules'
task :update do
  collector = Konacha::Chai::Matchers::Collector.new
  collector.update_libraries
end

