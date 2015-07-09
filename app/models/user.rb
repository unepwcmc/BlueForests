class User < ActiveRecord::Base
  devise :token_authenticatable, :database_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  validates :country, presence: true, unless: :super_admin?

  before_save :ensure_authentication_token

  belongs_to :country

  has_many :validations
  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments

  def super_admin?
    roles.any? { |role| role.name == 'super_admin' }
  end
end
