class ValidationsController < AdminController
  before_filter :authenticate_user!
  load_and_authorize_resource

  # GET /validations
  # GET /validations.json
  def index
    # Admins can view all validations, users only their own
    # TODO change this to super_admin
    if current_user.roles.find_by_name("admin")
      @validations = Validation.all
    else
      @validations = current_user.validations
    end
    @areas = Area.all

    @photo = Photo.new

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @validations }
    end
  end

  # GET /validations/1
  # GET /validations/1.json
  def show
    @validation = Validation.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @validation }
    end
  end

  # GET /validations/new
  # GET /validations/new.json
  def new
    @validation = Validation.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @validation }
    end
  end

  # GET /validations/1/edit
  def edit
    @validation = Validation.find(params[:id])
  end

  # POST /validations
  # POST /validations.json
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

  # PUT /validations/1
  # PUT /validations/1.json
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

  # DELETE /validations/1
  # DELETE /validations/1.json
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
