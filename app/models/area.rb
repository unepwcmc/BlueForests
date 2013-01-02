class Area < ActiveRecord::Base
  attr_accessible :title, :coordinates

  has_many :validations, dependent: :destroy
  has_many :mbtiles, dependent: :destroy

  validates :title, presence: true, uniqueness: true
  validates :coordinates, presence: true

  def geo_json
    "{\"type\":\"Polygon\",\"coordinates\":#{coordinates}"
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
end
