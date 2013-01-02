class Validation < ActiveRecord::Base
  attr_accessible :coordinates, :action, :habitat, :area_id, :knowledge,
    :density, :condition, :age, :species, :recorded_at, :notes

  serialize :coordinates

  belongs_to :area
  belongs_to :admin

  validates :coordinates, presence: true
  validates :action, presence: true, inclusion: { in: %w(add delete validate) }
  validates :habitat, presence: true, inclusion: { in: Habitat.all.map { |h| h.to_param } }
  validates :condition, presence: true, unless: Proc.new { |v| v.action == 'delete' || v.habitat == 'seagrass' || v.habitat == 'sabkha' || v.habitat == 'salt_marsh' }
  validates :admin, presence: true

  before_create :cartodb

  after_save do
    Mbtile.delay.generate(area_id, habitat) if area_id
  end

  def json_coordinates
    json_coordinates = JSON.parse(coordinates)  unless coordinates.kind_of?(Array)
    json_coordinates << json_coordinates.first

    json_coordinates = json_coordinates.to_s.gsub(", ", " ")
    json_coordinates = json_coordinates.gsub("] [", ", ")
    json_coordinates = json_coordinates.gsub(/(\[)|(\])/, "")

    json_coordinates
  end

  def cartodb
    # SQL CartoDB
    sql = CartodbQuery.query(Habitat.find(habitat).table_name, "ST_GeomFromText('MultiPolygon(((#{json_coordinates})))',4326)", self)

    CartoDB::Connection.query("BEGIN; #{sql} COMMIT;")
  rescue CartoDB::Client::Error => e
    errors.add :base, 'There was an error trying to render the layers.'
    logger.info "There was an error trying to execute the following query:\n#{sql}\nError details: #{e.inspect}"
  end
end
