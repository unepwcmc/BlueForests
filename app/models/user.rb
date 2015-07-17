class User < ActiveRecord::Base
  devise :token_authenticatable, :database_authenticatable,
         :recoverable, :rememberable, :trackable, authentication_keys: [:email, :country_id]

  validates :country, presence: true, unless: :super_admin?

  before_save :ensure_authentication_token

  belongs_to :country

  has_many :validations
  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments

  delegate :subdomain, to: :country


  def self.find_for_authentication(conditions)
    if conditions[:authentication_token]
      find_by_authentication_token(conditions[:authentication_token])
    else
      where(:email => conditions[:email]).detect { |user|
        user.country_id == conditions[:country_id].to_i || user.super_admin?
      }
    end
  end

  def super_admin?
    roles.any? { |role| role.name == 'super_admin' }
  end
end
