class AdminsController < AdminController
  before_filter :authenticate_admin!, except: :me
  load_and_authorize_resource except: :me

  def me
    if admin_signed_in?
      render json: current_admin.to_json(only: [:id, :email, :login_method])
    else
      render json: { error: '401 Unauthorized' }, status: :unauthorized
    end
  end

  def index
    respond_to do |format|
      format.html
      format.json { render json: @admins }
    end
  end

  def show
    respond_to do |format|
      format.html
      format.json { render json: @admin }
    end
  end

  def new
    respond_to do |format|
      format.html
      format.json { render json: @admin }
    end
  end

  def edit
  end

  def create
    respond_to do |format|
      if @admin.save
        format.html { redirect_to @admin, notice: 'Admin was successfully created.' }
        format.json { render json: @admin, status: :created, location: @admin }
      else
        format.html { render action: "new" }
        format.json { render json: @admin.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    respond_to do |format|
      if @admin.destroy
        format.html { redirect_to admins_path, notice: 'Admin account deleted.' }
        format.json { render json: @admin, status: :deleted, location: @admin }
      else
        format.html { redirect_to admins_path, notice: 'Admin account could not be deleted.' }
        format.json { render json: @admin, status: :unprocessable_entity, location: @admin }
      end
    end
  end

  def update
    if params[:admin][:password].blank?
      params[:admin].delete(:password)
      params[:admin].delete(:password_confirmation)
    end

    # Self user cannot change its roles
    params[:admin].delete(:role_ids) if @admin == current_admin

    respond_to do |format|
      if @admin.update_attributes(admin_params)
        format.html { redirect_to @admin, notice: 'Admin was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @admin.errors, status: :unprocessable_entity }
      end
    end
  end

  def admin_params
    params.require(:admin).permit(
      :email,
      :password,
      :password_confirmation,
      :remember_me,
      :role_ids
    )
  end
end
