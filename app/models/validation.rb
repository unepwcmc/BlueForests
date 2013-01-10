class Validation < ActiveRecord::Base
  attr_accessible :coordinates, :action, :habitat, :area_id, :knowledge,
    :density, :condition, :age, :species, :recorded_at, :notes, :photo_ids
  attr_accessor :photo_ids

  serialize :coordinates

  belongs_to :area
  belongs_to :admin

  has_many :photos

  validates :coordinates, presence: true
  validates :action, presence: true, inclusion: { in: %w(add delete validate) }
  validates :habitat, presence: true, inclusion: { in: Habitat.all.map { |h| h.to_param } }
  validates :condition, presence: true, unless: Proc.new { |v| v.action == 'delete' || v.habitat == 'seagrass' || v.habitat == 'sabkha' || v.habitat == 'saltmarsh' || v.habitat == 'algal_mat' || v.habitat == 'other' }
  validates :admin, presence: true

  before_create do
    if coordinates.kind_of?(Array)
      self.coordinates = "#{coordinates}"
    end
  end

  after_create :cartodb
  after_update :cartodb_update

  after_save do
    Mbtile.delay.generate(area_id, habitat) if area_id

    # Reset associated photos
    unless photo_ids.nil?
      Photo.update_all("validation_id = NULL", ["id IN (?)", (photos.map(&:id) - photo_ids)])
    end

    # Associate uploaded photos
    Photo.update_all(["validation_id = ?", id], ["id IN (?)", photo_ids])
  end

  def json_coordinates
    if coordinates.kind_of?(Array)
      json_coordinates = coordinates
    else
      json_coordinates = JSON.parse(coordinates)
    end
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

  def cartodb_update
    # SQL CartoDB
    sql = CartodbQuery.query_update(Habitat.find(habitat).table_name, "ST_GeomFromText('MultiPolygon(((#{json_coordinates})))',4326)", self)

    CartoDB::Connection.query("BEGIN; #{sql} COMMIT;")
  rescue CartoDB::Client::Error => e
    errors.add :base, 'There was an error trying to render the layers.'
    logger.info "There was an error trying to execute the following query:\n#{sql}\nError details: #{e.inspect}"
  end
end
