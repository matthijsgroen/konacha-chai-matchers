require 'pathname'

desc 'updates all submodules'
task :update do
  modules = collect_modules
  update_modules modules
  vendor_files modules
end

def collect_modules
  modules = []
  File.open('.gitmodules') do |f|
    contents = f.read
    contents.each_line do |line|
      modules << $1 if line =~ /\[submodule "(.*)"\]/
    end
  end
  modules
end

def main_files folders
  folders.map do |f|
    file_search = f.downcase
    file_search << '.js' unless file_search =~ /\.js$/

    path_order = ["./#{f}/pkg/#{file_search}", "./#{f}/#{file_search}", "./#{f}/lib/#{file_search}"]

    r = path_order.map do |p|
      p if File.exist? p
    end.flatten.compact.first
  end.flatten.compact
end

def vendor_files modules
  files = main_files modules
  puts "found #{files.length} of the #{modules.length} lib files" unless files.length == modules.length
  path = "./vendor/assets/javascripts/"
  Pathname.new(path).mkpath()
  FileUtils.cp files, path
end

def update_modules modules
  modules.each do |mod|
    `cd ./#{mod} && git pull`
    `cd ./#{mod} && ./build` if File.exist? "./#{mod}/build"
  end
end
