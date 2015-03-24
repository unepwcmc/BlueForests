class ValidationsController < AdminController
  before_filter :authenticate_user!
  load_and_authorize_resource

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
    @validation.user = current_user

    respond_to do |format|
      if @validation.save
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
    url = Habitat.shapefile_export_url(params[:habitat])
    puts url
    data = open(url).read
    habitat_name = params[:habitat]
    filename = "BlueCarbon_#{habitat_name}_Download.zip"
    send_data data, :filename => filename
  end

  private

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
