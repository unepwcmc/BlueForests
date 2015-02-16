class Mbtile::Base
  CARTODB_QUERY_PATH = 'lib/modules/mbtile/templates/cartodb_query.sql.erb'
  CARTODB_QUERY_TEMPLATE = File.read(Rails.root.join(CARTODB_QUERY_PATH))

  def self.generate *opts
    instance = new(*opts)
    instance.generate
  end

  def initialize habitat, area
    @habitat = habitat
    @area = area
  end

  private

  def cartodb_query
    template = ERB.new(CARTODB_QUERY_TEMPLATE)

    template.result(binding).squish
  end

  def habitat_model
    Habitat.find(@habitat)
  end

  def habitat_path
    tilemill_path.join('project', @habitat).tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end

  def tilemill_path
    Rails.root.join('lib', 'tilemill', @area.id.to_s).tap do |dir|
      FileUtils.mkdir_p dir unless File.directory? dir
    end
  end
end
