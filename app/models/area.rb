class Area < ActiveRecord::Base
  has_many :validations, dependent: :destroy
  has_many :mbtiles, dependent: :destroy

  belongs_to :country

  validates :title, presence: true, uniqueness: true
  validates :coordinates, presence: true

  after_create :upload_to_carto

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

  def upload_to_carto
    query = """
      INSERT INTO blueforests_field_sites_#{Rails.env} (the_geom, country_id, name)
      VALUES (
        ST_SetSRID(ST_GeomFromGeoJSON(#{ActiveRecord::Base.sanitize(geo_json)}), 4326),
        #{ActiveRecord::Base.sanitize(country.iso)},
        #{ActiveRecord::Base.sanitize(title)}
      )
    """

    CartoDb.query(query)
  end
end
