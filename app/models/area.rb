class Area < ActiveRecord::Base
  has_many :validations, dependent: :destroy
  has_many :mbtiles, dependent: :destroy

  belongs_to :country

  validates :title, presence: true, uniqueness: true
  validates :coordinates, presence: true

  after_create :upload_to_carto
  after_destroy :remove_from_carto

  def self.sync_from_carto
    query = "SELECT ST_AsGeoJSON(the_geom) geom, name, country_id FROM blueforests_field_sites_#{Rails.env}"
    results = CartoDb.query(query)["rows"]

    results.each do |row|
      area = Area.find_or_initialize_by(title: row["name"])
      area.coordinates = JSON.parse(row["geom"])["coordinates"][0]
      area.country = Country.find_by_iso(row["country_id"])
      area.save
    end
  end

  def geo_json
    %{
      {
        "type":"Polygon",
        "coordinates": [#{coordinates}],
        "crs":{
          "type":"name",
          "properties":{"name":"EPSG:4326"}
        }
      }
    }
  end

  def json_coordinates
    json_coordinates = JSON.parse(coordinates)
    json_coordinates << json_coordinates.first

    json_coordinates = json_coordinates.to_s.gsub(", ", " ")
    json_coordinates = json_coordinates.gsub("] [", ", ")
    json_coordinates = json_coordinates.gsub(/(\[)|(\])/, "")

    json_coordinates
  end

  before_create do
    Habitat.all.each do |habitat|
      mbtiles << Mbtile.new(habitat: habitat.name)
    end
  end

  CARTO_TABLE_NAME = "blueforests_field_sites_#{Rails.env}".freeze
  def upload_to_carto
    query = """
      INSERT INTO #{CARTO_TABLE_NAME} (the_geom, country_id, name)
      VALUES (
        ST_SetSRID(ST_GeomFromGeoJSON(#{ActiveRecord::Base.sanitize(geo_json)}), 4326),
        #{ActiveRecord::Base.sanitize(country.iso)},
        #{ActiveRecord::Base.sanitize(title)}
      )
    """

    CartoDb.query(query)
  end

  def remove_from_carto
    _title = ActiveRecord::Base.sanitize(title)
    _country_iso = ActiveRecord::Base.sanitize(country.iso)

    query = """
      DELETE
      FROM #{CARTO_TABLE_NAME} t
      WHERE t.name = #{_title} AND t.country_id = #{_country_iso}
    """

    CartoDb.query(query)
  end
end
