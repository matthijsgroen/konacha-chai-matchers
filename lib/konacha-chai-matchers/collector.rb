require 'yaml'

module Konacha
  module Chai
    module Matchers
      class Collector


        def update_libraries
          `git submodule init`
          `git submodule update`
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
          locked_versions = YAML.load_file 'VERSIONS.lock'

          urls = `cat .gitmodules | grep 'url =' | awk '{print $3}'`.split("\n")
          paths = `cat .gitmodules | grep 'path =' | awk '{print $3}'`.split("\n")
          @libs ||= urls.each_with_index.map do |url, i|
            name = paths[i]
            `cd ./#{name} && git fetch && cd ..`
            latest_tag = `cd ./#{name} && git describe --tags --abbrev=0 && cd ..`.split.first
            library_tag = locked_versions[name] || latest_tag

            latest_commit = `cd ./#{name} && git rev-parse #{library_tag || 'HEAD'} && cd ..`.split.first

            Library.new url: url, name: name, tag: library_tag, commit: latest_commit
          end
        end
      end
    end
  end
end
