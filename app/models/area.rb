class Area < ActiveRecord::Base
  attr_accessible :coordinates, :title

  has_many :validations
  has_many :mbtiles

  before_create do
    Habitat.all.each do |habitat|
      mbtiles << Mbtile.new(habitat: habitat.name)
    end
  end
end
