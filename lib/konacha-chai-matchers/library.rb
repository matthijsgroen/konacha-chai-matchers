
module Konacha
  module Chai
    module Matchers
      class Library

        attr_reader :data, :name

        def initialize(data)
          @data = data
          @name = data[:name]
          @commit = data[:commit]
        end

        def to_s
          "#{@data[:name]} => #{@data[:tag]}"
        end

        def latest_version
          `cd ./#@name && git fetch`
          @data[:tag]
        end

        def update
          puts "Updating #@name to #{latest_version}"
          `cd ./#@name && git checkout #@commit`
          if File.exist? "./#@name/build"
            system("cd ./#@name && bundle exec ./build") or raise "Building #@name failed"
          end
        end

        def vendor
          file = main_file
          unless file
            puts "Cannot determine library file for #@name"
            return false
          end

          path = "./vendor/assets/javascripts/"
          Pathname.new(path).mkpath()
          FileUtils.cp(file, "#{path}#{@name}.js")
          return true
        end

        def main_file
          return @main_file unless @main_file.nil?
          r = determine_file_from_suggestion @name
          r ||= get_main_file_from_package
          @main_file = r
        end

        def version
          get_value_from_package 'version'
        end

        private

        def determine_file_from_suggestion filename
          unless filename
            puts "unable to determine main filename for #@name"
            return
          end
          file_search = filename.downcase
          file_search << '.js' unless file_search =~ /\.js$/

          path_order = [
            "./#@name/pkg/#{file_search}",
            "./#@name/#{file_search}",
            "./#@name/lib/#{file_search}"
          ]
          path_order.map do |p|
            p if File.exist? p
          end.flatten.compact.first
        end

        def get_value_from_package key
          filename =  "./#@name/package.json"
          return unless File.exist? filename
          json_string = File.open(filename).read
          json = JSON.parse json_string
          return unless json.has_key? "main"
          json[key]
        end

        def get_main_file_from_package
          main_file = get_value_from_package 'main'
          determine_file_from_suggestion main_file
        end
      end
    end
  end
end

