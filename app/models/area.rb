class Area < ActiveRecord::Base
  attr_accessible :title, :coordinates

  has_many :validations, dependent: :destroy
  has_many :mbtiles, dependent: :destroy

  validates :title, presence: true, uniqueness: true
  validates :coordinates, presence: true

  def geo_json
    c = JSON.parse(coordinates)
    "{\"type\":\"Polygon\",\"coordinates\":[#{[[c.first[1], c.first[0]], [c.first[1], c.last[0]], [c.last[1], c.last[0]], [c.last[1], c.first[0]], [c.first[1], c.first[0]]]}]}"
  end

  before_create do
    Habitat.all.each do |habitat|
      mbtiles << Mbtile.new(habitat: habitat.name)
    end
  end
end
