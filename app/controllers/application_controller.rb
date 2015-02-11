class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_country

  # CanCan
  def current_ability
    @current_ability ||= Ability.new(current_admin)
  end

  def after_sign_in_path_for(resource)
    validations_path
  end

  rescue_from CanCan::AccessDenied do |exception|
    flash[:error] = "Access denied!"
    redirect_to root_url
  end

  private

  def set_country
    @current_country = Country.where(subdomain: request.subdomain).first

    if @current_country.blank?
      redirect_to(root_path) unless is_root?
    end
  end

  def is_root?
    request.path == "/"
  end
end
