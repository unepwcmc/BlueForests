class Mbtile::Geojson < Mbtile::Base
  def generate
    geojson_path = "#{layers_path}/polygons.kml"
    File.open(geojson_path, "w") {|f| f << geojson }
  end

  private

  def geojson
    CartoDb.query cartodb_query
  end

  def layers_path
    habitat_path.join('layers').tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end
end
