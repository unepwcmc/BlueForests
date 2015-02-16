class Mbtile::Project < Mbtile::Base
  def generate
    create_export_path

    Mbtile::Style.generate(@habitat, @area)
    Mbtile::Geojson.generate(@habitat, @area)
    Mbtile::Mml.generate(@habitat, @area)

    clear_cache

    if run_tilemill =~ /Error/
      FileUtils.rm final_path if File.exist? final_path
      FileUtils.cp empty_mbtiles_path, final_path
    end
  end

  private

  def run_tilemill
    `#{Rails.application.secrets.projectmill_path}/index.js \
      -f --mill --render  -p #{tilemill_path}/ \
      -c #{config_file} -t #{Rails.application.secrets.tilemill_path} 2>&1`
  end

  def clear_cache
    system "rm -rf #{habitat_path}_final #{tilemill_path}/cache"
  end

  def config_file
    @config_file ||= Mbtile::Configuration.generate(@habitat, @area)
  end

  def final_path
    "#{export_path}/#{@habitat}_final.mbtiles"
  end

  def empty_mbtiles_path
    Rails.root.join('lib', 'empty.mbtiles')
  end

  def export_path
    tilemill_path.join('export')
  end

  def create_export_path
    FileUtils.mkdir_p export_path unless File.directory? export_path
  end
end
