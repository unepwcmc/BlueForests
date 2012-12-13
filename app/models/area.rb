class Area < ActiveRecord::Base
  attr_accessible :title, :coordinates

  has_many :validations, dependent: :destroy
  has_many :mbtiles, dependent: :destroy

  validates :title, presence: true, uniqueness: true
  validates :coordinates, presence: true

  before_create do
    Habitat.all.each do |habitat|
      mbtiles << Mbtile.new(habitat: habitat.name)
    end
  end
end
