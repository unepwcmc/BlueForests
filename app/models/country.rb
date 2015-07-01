class Country < ActiveRecord::Base
  [:name, :iso, :subdomain].each do |field|
    validates field, presence: true, uniqueness: true
  end

  has_many :users, dependent: :destroy
  has_many :areas, dependent: :destroy
end
