class Validation < ActiveRecord::Base
  attr_accessible :action, :coordinates, :recorded_at, :area_id,
    :knowledge, :notes, :habitat, :density, :age

  belongs_to :area
  belongs_to :admin

  validates :action, presence: true, inclusion: { in: %w(add delete validate) }
  validates :habitat, presence: true, inclusion: { in: Habitat.all.map { |h| h.to_param } }
  validates :coordinates, presence: true
  validates :knowledge, presence: true, unless: :is_delete_action?
  validates :density, presence: true, unless: :is_delete_action?
  validates :age, presence: true, unless: :is_delete_action?
  validates :admin, presence: true

  before_create :cartodb

  def geo_json
    json_coordinates = JSON.parse(coordinates)
    json_coordinates << json_coordinates.first

    "{\"type\":\"MultiPolygon\",\"coordinates\":[[#{json_coordinates}]]}"
  end

  after_save do
    Mbtile.delay.generate(area_id, habitat) if area_id
  end

  def cartodb
    # SQL CartoDB
    sql = CartodbQuery.query(Habitat.find(validation.habitat).table_name, "ST_GeomFromText(ST_AsText(ST_GeomFromGeoJson('#{geo_json}')),4326)")

    CartoDB::Connection.query(sql)
  rescue CartoDB::Client::Error
    errors.add :base, 'There was an error trying to render the layers.'
    logger.info "There was an error trying to execute the following query:\n#{sql}"
  end

  private

  def is_delete_action?
    action == 'delete'
  end
end
