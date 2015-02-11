class Country < ActiveRecord::Base
  has_many :admins
  has_many :areas
end
