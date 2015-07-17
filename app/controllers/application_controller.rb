class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :current_country
  before_filter :check_country

  # CanCan
  def current_ability
    @current_ability ||= Ability.new(current_user)
  end

  def current_country
    @current_country ||= if signed_in? && current_user.super_admin?
      from_session or store_from_subdomain
    else
      from_subdomain
    end
  end

  rescue_from CanCan::AccessDenied do |exception|
    flash[:error] = 'Access denied!'

    begin
      redirect_to :back
    rescue ActionController::RedirectBackError
      redirect_to root_url
    end
  end

  private

  def from_session
    Country.find_by_id(session[:country_id])
  end

  def store_from_subdomain
    from_subdomain.tap { |country| session[:country_id] = country.id }
  end

  def from_subdomain
    Country.find_by_subdomain(subdomain)
  end

  def subdomain
    request.subdomain.split('.').first
  end

  def check_country
    if current_country.blank? && !is_root?
      redirect_to(root_url(subdomain: false))
    end
  end

  def is_root?
    request.path == "/" && subdomain.blank?
  end
end
