class Admin < ActiveRecord::Base
  devise :token_authenticatable, :database_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  validates :country, presence: true

  before_save :ensure_authentication_token

  belongs_to :country

  has_many :validations
  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments
end
