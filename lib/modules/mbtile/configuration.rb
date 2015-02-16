class Mbtile::Configuration < Mbtile::Base
  def initialize habitat, area, opts={minzoom: 9, maxzoom: 22}
    @area = area
    @habitat = habitat

    @minzoom = opts[:minzoom]
    @maxzoom = opts[:maxzoom]
  end

  def generate
    "#{habitat_path}/config.json".tap do |config_path|
      File.open(config_path, "w") { |f| f << config.to_json }
    end
  end

  def config
    {
      source: @habitat,
      destination: "#{@habitat}_final",
      format: "mbtiles", minzoom: @minzoom, maxzoom: @maxzoom, mml: {}
    }
  end
end
