class User < ActiveRecord::Base
  devise :token_authenticatable, :database_authenticatable,
         :recoverable, :rememberable, :trackable, request_keys: [:subdomain]

  validates :country, presence: true, unless: :super_admin?

  before_save :ensure_authentication_token

  belongs_to :country

  has_many :validations
  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments


  def self.find_for_authentication(warden_conditions)
    if warden_conditions[:authentication_token]
      where(authentication_token: warden_conditions[:authentication_token]).first
    else
      subdomain = warden_conditions[:subdomain].split('.').first
      country = Country.find_by_subdomain(subdomain)

      users_with_email = where(:email => warden_conditions[:email])
      users_with_email.detect { |user|
        user.super_admin? || user.country == country
      }
    end
  end

  def super_admin?
    roles.any? { |role| role.name == 'super_admin' }
  end
end
