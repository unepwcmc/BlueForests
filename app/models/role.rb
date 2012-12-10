class Role < ActiveRecord::Base
  attr_accessible :name

  has_many :assignments
  has_many :admins, :through => :assignments
end
