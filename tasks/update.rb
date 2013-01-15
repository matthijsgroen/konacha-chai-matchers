require 'pathname'
require 'json'

desc 'updates all submodules'
task :update do
  modules = collect_modules
  #update_modules modules
  vendor_files modules
end

def collect_modules
  modules = []
  File.open('.gitmodules') do |f|
    contents = f.read
    contents.each_line do |line|
      if matches = /\[submodule "(.*)"\]/.match(line)
        modules << matches[1]
      end
    end
  end
  modules
end

def main_files folders
  folders.map do |f|
    r = determine_file_from_suggestion f
    r ||= get_main_file_from_package "./#{f}/package.json", f

    { lib: r, module: f }
  end.flatten.compact
end

def determine_file_from_suggestion filename, folder = filename
  file_search = filename.downcase
  file_search << '.js' unless file_search =~ /\.js$/

  path_order = [
    "./#{folder}/pkg/#{file_search}",
    "./#{folder}/#{file_search}",
    "./#{folder}/lib/#{file_search}"
  ]
  path_order.map do |p|
    p if File.exist? p
  end.flatten.compact.first
end

def get_main_file_from_package filename, folder
  return unless File.exist? filename
  json_string = File.open(filename).read
  json = JSON.parse json_string
  return unless json.has_key? "main"
  main_file = json["main"]
  determine_file_from_suggestion main_file, folder
end

def vendor_files modules
  files = main_files modules
  missing = files.map { |f| f[:lib].nil? ? f[:module] : nil }.compact

  puts "missing #{missing.length} lib files: #{missing.inspect}" unless missing.empty?

  path = "./vendor/assets/javascripts/"
  Pathname.new(path).mkpath()
  files.each do |info|
    FileUtils.cp(info[:lib], "#{path}#{info[:module]}.js") if info[:lib]
  end
end

def update_modules modules
  modules.each do |mod|
    `cd ./#{mod} && git pull origin master`
    `cd ./#{mod} && ./build` if File.exist? "./#{mod}/build"
  end
end
