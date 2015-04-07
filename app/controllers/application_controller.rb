class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :check_country

  # CanCan
  def current_ability
    @current_ability ||= Ability.new(current_user)
  end

  def current_country
    @current_country = if current_user && !current_user.super_admin?
      current_user.country
    else
      Country.where(subdomain: subdomain).first
    end
  end

  def after_sign_in_path_for(resource)
    validations_path
  end

  rescue_from CanCan::AccessDenied do |exception|
    flash[:error] = "Access denied!"

    begin
      redirect_to :back
    rescue ActionController::RedirectBackError
      redirect_to root_url
    end
  end

  private

  def subdomain
    request.subdomain.split('.').first
  end

  def check_country
    if current_country.blank?
      redirect_to(root_path) unless is_root?
    end
  end

  def is_root?
    request.path == "/"
  end
end
