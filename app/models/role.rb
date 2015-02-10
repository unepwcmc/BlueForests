class Role < ActiveRecord::Base
  has_many :assignments, dependent: :destroy
  has_many :admins, through: :assignments

  validates :name, presence: true, uniqueness: true
end
