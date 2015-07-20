class UsersController < AdminController
  before_filter :authenticate_user!, except: :me
  before_filter :check_country_for_restricted_pages

  load_and_authorize_resource except: :me

  def me
    if user_signed_in?
      render json: current_user.to_json(
        only: [:id, :email, :login_method],
        include: {countries: {only: [:name, :bounds]}}
      )
    else
      render json: { error: '401 Unauthorized' }, status: :unauthorized
    end
  end

  def index
    respond_to do |format|
      format.html
      format.json { render json: @users }
    end
  end

  def show
    respond_to do |format|
      format.html
      format.json { render json: @user }
    end
  end

  def new
    respond_to do |format|
      format.html
      format.json { render json: @user }
    end
  end

  def edit
  end

  def create
    assign_country unless current_user.super_admin?

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, notice: 'User was successfully created.' }
        format.json { render json: @user, status: :created, location: @user }
      else
        format.html { render action: "new" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    respond_to do |format|
      if @user.destroy
        format.html { redirect_to users_path, notice: 'User account deleted.' }
        format.json { render json: @user, status: :deleted, location: @user }
      else
        format.html { redirect_to users_path, notice: 'User account could not be deleted.' }
        format.json { render json: @user, status: :unprocessable_entity, location: @user }
      end
    end
  end

  def update
    if params[:user][:password].blank?
      params[:user].delete(:password)
      params[:user].delete(:password_confirmation)
    end

    # Self user cannot change its roles
    params[:user].delete(:role_ids) if @user == current_user

    respond_to do |format|
      if @user.update_attributes(user_params)
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def user_params
    allowed = [:email, :password, :password_confirmation, {role_ids: []}, :remember_me]
    allowed << {country_ids: []} if current_user.super_admin?

    params.require(:user).permit(*allowed)
  end

  def assign_country
    @user.countries = [current_country]
  end
end
