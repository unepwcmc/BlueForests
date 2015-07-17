class SessionsController < Devise::SessionsController
  skip_before_filter :check_country, only: [:new, :create]
  layout false

  def create
    respond_to do |format|
      format.html { super }
      format.json {
        user = User.find_by_email(params[:user][:email])

        if user.valid_password?(params[:user][:password])
          render json: { auth_token: user.authentication_token }, success: true, status: :created
        else
          invalid_login_attempt
        end
      }
    end
  end

  def destroy
    respond_to do |format|
      format.html { super }
      format.json {
        user = User.find_by_authentication_token(params[:auth_token])

        if user
          user.reset_authentication_token!
          render json: { message: 'Session deleted' }, success: true, status: 204
        else
          render json: { message: 'Invalid token' }, status: 404
        end
      }
    end
  end

  protected

  def after_sign_in_path_for(resource)
    validations_url(subdomain: resource.country.subdomain)
  end

  def invalid_login_attempt
    warden.custom_failure!
    render json: { success: false, message: 'Error with your login or password' }, status: 401
  end
end
