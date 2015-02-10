class Country < ActiveRecord::Base
  has_many :admins
end
