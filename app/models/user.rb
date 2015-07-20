class User < ActiveRecord::Base
  devise :token_authenticatable, :database_authenticatable,
         :recoverable, :rememberable, :trackable, authentication_keys: [:email]

  before_save :ensure_authentication_token

  has_many :users_countries
  has_many :countries, through: :users_countries

  validates :countries, presence: true

  has_many :validations
  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments

  def self.find_for_authentication(conditions)
    if conditions[:authentication_token]
      return find_by_authentication_token(conditions[:authentication_token])
    elsif conditions[:country_id]
      find_by_country(conditions)
    else
      find_by_email(conditions[:email])
    end
  end

  def super_admin?
    roles.any? { |role| role.name == 'super_admin' }
  end

  def self.find_by_country conditions
    joins(:users_countries).where(
      "email = ? AND users_countries.country_id = ?",
      conditions[:email],
      conditions[:country_id]
    ).first
  end

  def subdomain selected_country_id=nil
    if super_admin?
      Rails.application.secrets.admin_subdomain
    else
      countries.find(selected_country_id).subdomain
    end
  end
end
