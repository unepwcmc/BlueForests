class Admin < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :registerable, :lockable, :timeoutable and :omniauthable
  devise :token_authenticatable, :database_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  #validates :role_ids, presence: true

  before_save :ensure_authentication_token

  has_many :validations

  has_many :assignments, dependent: :destroy
  has_many :roles, through: :assignments
end
