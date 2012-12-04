class Area < ActiveRecord::Base
  attr_accessible :coordinates, :title

  has_many :validations
end
