class Area < ActiveRecord::Base
  attr_accessible :coordinates, :title

  has_many :validations

  def generate_mbtile
    # Makes sure the export path exists
    export_path

    Habitat.all.each do |habitat|
      generate_style(habitat.to_param)
      generate_geojson(habitat.to_param)
      generate_mml(habitat.to_param, 10, 11)

      config_file = generate_config(habitat.to_param, 10, 11)

      system "#{APP_CONFIG['projectmill_path']}/index.js --mill --render -p #{tilemill_path}/ -c #{config_file} -t #{APP_CONFIG['tilemill_path']}"
    end
  end

  def final_mbtile_path(habitat)
    "#{export_path}/#{habitat.to_param}_final.mbtiles"
  end

  private

  def generate_style(habitat)
    "#{habitat_path(habitat)}/style.mss".tap do |path|
      File.open(path, "w") do |f|
        f.write <<-MSS
##{habitat} {
  line-color: #594;
  line-width: 0.5;
  polygon-opacity: 1;
  polygon-fill: blue;
}
        MSS
      end
    end
  end

  def generate_geojson(habitat)
    require 'open-uri'

    "#{layers_path(habitat)}/polygons.geojson".tap do |path|
      File.open(path, "w") do |f|
        f.write(open(cartodb_query(habitat)).read)
      end
    end
  end

  def generate_mml(habitat, minzoom, maxzoom=22)
    min_y, min_x, max_y, max_x = JSON.parse(self.coordinates).flatten

    mml = {
      bounds: [min_x, min_y, max_x, max_y],
      center: [min_x + ((max_x - min_x) / 2), min_y + ((max_y - min_y) / 2), minzoom],
      format: "png8", interactivity: false, minzoom: minzoom, maxzoom: maxzoom,
      srs: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over",
      Stylesheet: ["style.mss"],
      Layer: [{
        geometry: "polygon", extent: [min_x, min_y, max_x, max_y],
        id: habitat, :'class' => "",
        Datasource: { file: cartodb_query(habitat) },
        :'srs-name' => "WGS84",
        srs: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
        advanced: {}, name: habitat
      }],
      scale: 1, metatile: 4, name: '', description: ''
    }

    "#{habitat_path(habitat)}/project.mml".tap do |path|
      File.open(path, "w") do |f|
        f.write(mml.to_json)
      end
    end
  end

  def generate_config(habitat, minzoom, maxzoom)
    config = [{
      source: habitat,
      destination: "#{habitat}_final",
      format: "mbtiles", minzoom: minzoom, maxzoom: maxzoom, mml: {}
    }]

    "#{habitat_path(habitat)}/config.json".tap do |path|
      File.open(path, "w") do |f|
        f.write(config.to_json)
      end
    end
  end

  def layers_path(habitat)
    habitat_path(habitat).join('layers').tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end

  def habitat_path(habitat)
    tilemill_path.join('project', habitat).tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end

  def export_path
    tilemill_path.join('export').tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end

  def tilemill_path
    Rails.root.join('lib', 'tilemill', self.id.to_s).tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end

  def cartodb_query(habitat)
    "http://carbon-tool.cartodb.com/api/v2/sql?format=geojson&q=SELECT%20*%20FROM%20algalmat"
  end
end
