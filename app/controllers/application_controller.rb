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
      Subdomainer.country(request) || from_session
    else
      Subdomainer.country(request)
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

  def check_country
    unrecognised_subdomain = current_country.nil? && !is_root?
    redirect_to(root_url(subdomain: Subdomainer.root)) if unrecognised_subdomain
  end

  def check_country_for_restricted_pages
    if signed_in? && !current_user.countries.include?(current_country)
      redirect_to(root_url)
    end
  end

  def is_root?
    request.path == "/" && Subdomainer.root?(request)
  end
end
