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
            $stdout.puts "** #{name} **"
            `cd ./#{name} && git fetch && cd ..`
            `cd ./#{name} && git fetch --tags && cd ..`
            tags = `cd ./#{name} && git tag && cd ..`.split

            ordered_tags = tags.sort do |astr, bstr|
              a = astr.scan(/\d+/).map(&:to_i)
              b = bstr.scan(/\d+/).map(&:to_i)
              a.each_with_index do |e, c|
                next if e == b[c]
                break e <=> b[c]
              end
            end
            latest_tag = ordered_tags.last

            library_tag = latest_tag
            library_tag = locked_versions[name] if locked_versions.key? name
            latest_commit = `cd ./#{name} && git rev-parse #{library_tag || 'HEAD'} && cd ..`.split.first

            $stdout.puts "*** #{name} tag: #{latest_tag.inspect}, using: #{library_tag.inspect} commit: #{latest_commit}"

            Library.new url: url, name: name, tag: library_tag, commit: latest_commit
          end
        end
      end
    end
  end
end
