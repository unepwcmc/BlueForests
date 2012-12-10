class Assignment < ActiveRecord::Base
  attr_accessible :role_id, :admin_id

  belongs_to :admin
  belongs_to :role
end
