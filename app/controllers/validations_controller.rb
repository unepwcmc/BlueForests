class ValidationsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :check_country_for_restricted_pages
  before_filter :load_validations, only: :index

  load_and_authorize_resource except: [:index, :new, :create]

  def index
    @last_validation_id_by_habitat = Validation.most_recent_id_by_habitat(@validations)
    @areas = Area.all
    @photo = Photo.new

    respond_to do |format|
      format.html
      format.json { render json: @validations }
    end
  end

  def show
    @validation = Validation.find(params[:id])

    respond_to do |format|
      format.html
      format.json { render json: @validation }
    end
  end

  def new
    @validations = Validation.accessible_by(current_ability)
    @areas = Area.accessible_by(current_ability)
    @photo = Photo.new
    @validation = Validation.new

    respond_to do |format|
      format.html
      format.json { render json: @validation }
    end
  end

  def edit
    @validation = Validation.find(params[:id])
  end

  def create
    @validation = Validation.new(validation_params)
    @validation.country = @current_country
    @validation.user = current_user

    respond_to do |format|
      if can?(:create, @validation) && @validation.save
        format.html { redirect_to @validation, notice: 'Validation was successfully created.' }
        format.json { render json: @validation.to_json(include: [:user, photos: {only: :id, methods: [:attachment_url, :thumbnail_url]}]), status: :created, location: @validation }
      else
        format.html { render action: "new" }
        format.json { render json: @validation.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @validation = Validation.find(params[:id])

    respond_to do |format|
      if @validation.update_attributes(validation_params)
        format.html { redirect_to @validation, notice: 'Validation was successfully updated.' }
        format.json { render json: @validation }
      else
        format.html { render action: "edit" }
        format.json { render json: @validation.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @validation = Validation.find(params[:id])
    habitat = @validation.habitat
    Validation.undo_most_recent_by_habitat(habitat)
    @validation.destroy

    respond_to do |format|
      format.html { redirect_to validations_url }
      format.json { head :no_content }
    end
  end

  def export
    download = CartoDb::Proxy.download_shapefile(
      params[:habitat], country: export_country
    )

    send_data(
      download,
      filename: export_filename(params[:habitat], export_country)
    )
  end

  private

  def export_country
    @country ||= begin
      if params[:country_id] && current_user.super_admin?
        Country.find(params[:country_id]) rescue nil
      elsif current_user.super_admin?
        nil
      else
        current_user.countries.first
      end
    end
  end

  def export_filename habitat, country
    filename = "blueforests_#{params[:habitat]}_"
    filename << "#{country.try(:subdomain) || 'all'}_"
    filename << "download.zip"
  end

  def load_validations
    @validations = Validation.accessible_by(current_ability)

    if params[:country_id] && current_user.super_admin?
      @validations = @validations.where(country_id: params[:country_id])
    end
  end

  def validation_params
    params.require(:validation).permit(
      :coordinates,
      :action,
      :habitat,
      :area_id,
      :knowledge,
      :density,
      :condition,
      :age,
      :species,
      :recorded_at,
      :notes,
      :photo_ids
    )
  end
end
