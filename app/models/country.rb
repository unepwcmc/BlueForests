class Country < ActiveRecord::Base
  [:name, :iso, :subdomain].each do |field|
    validates field, presence: true, uniqueness: true
  end

  has_many :users
  has_many :areas
end
