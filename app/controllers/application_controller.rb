class ApplicationController < ActionController::Base
  protect_from_forgery

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
end
