class SessionsController < Devise::SessionsController
  skip_before_filter :check_country, only: [:new, :create, :destroy]
  layout false

  def create
    request.xhr? ? sign_in_via_xhr : super
    session[:country_id] = params[:session][:country_id]
  end

  def destroy
    request.xhr? ? sign_out_via_xhr : super
  end

  protected

  def sign_in_via_xhr
    user = User.find_for_authentication(params[:user].merge(params[:session]))

    if user.present? && user.valid_password?(params[:user][:password])
      render(
        json: { auth_token: user.authentication_token },
        success: true, status: :created,
        location: after_sign_in_path_for(user, params[:session][:country_id])
      )
    else
      invalid_login_attempt
    end
  end

  def sign_out_via_xhr
    user = User.find_by_authentication_token(params[:auth_token])

    if user
      user.reset_authentication_token!
      render json: { message: 'Session deleted' }, success: true, status: 204
    else
      render json: { message: 'Invalid token' }, status: 404
    end
  end


  def after_sign_in_path_for resource, country_id=nil
    validations_url(subdomain: Subdomainer.from_user(resource, country_id))
  end

  def invalid_login_attempt
    warden.custom_failure!
    render json: { success: false, message: 'Error with your login or password' }, status: 401
  end
end
