
module Konacha
  module Chai
    module Matchers
      class Collector

        def update_libraries
          modules = collect_libraries

          modules.each(&:update)
          modules.each(&:vendor)

          File.open('VERSIONS', 'w') do |f|
            modules.each do |m|
              f.puts "#{m.name}: #{m.version}"
            end
          end
        end

        private

        def collect_libraries
          libs = []
          File.open('.gitmodules') do |f|
            contents = f.read
            contents.each_line do |line|
              if matches = /\[submodule "(.*)"\]/.match(line)
                libs << Library.new(matches[1])
              end
            end
          end
          libs
        end

      end
    end
  end
end
