class Mbtile::Mml < Mbtile::Base
  MML_PATH = 'lib/modules/mbtile/templates/mml.json.erb'
  MML_TEMPLATE = File.read(Rails.root.join(MML_PATH))

  def initialize habitat, area, opts={minzoom: 9, maxzoom: 22}
    @minzoom = opts[:minzoom]
    @maxzoom = opts[:maxzoom]

    @habitat = habitat
    @area = area
  end

  def generate
    mml_path = "#{habitat_path}/project.mml"
    File.open(mml_path, "w") { |f| f << mml_template }
  end

  private

  def mml_template
    @mml_template ||= begin
      template = ERB.new(MML_TEMPLATE)
      template.result(binding).squish
    end
  end

  def bounds
    [min_x, min_y, max_x, max_y]
  end
  alias_method :extent, :bounds

  def center
    x = min_x + ((max_x - min_x).to_f / 2)
    y = min_y + ((max_y - min_y).to_f / 2)

    [x, y, @minzoom]
  end

  def coordinates
    @coordinates ||= begin
      initial = {min_x: 180, min_y: 90, max_x: -180, max_y: -90}

      JSON.parse(@area.coordinates).each_with_object(initial) do |coordinate, result|
        result[:min_x] = [result[:min_x], coordinate[0]].min
        result[:min_y] = [result[:min_y], coordinate[1]].min
        result[:max_x] = [result[:max_x], coordinate[0]].max
        result[:max_y] = [result[:max_y], coordinate[1]].max
      end
    end
  end

  [:min_x, :min_y, :max_x, :max_y].each do |coord|
    define_method(coord) { coordinates[coord] }
  end
end
