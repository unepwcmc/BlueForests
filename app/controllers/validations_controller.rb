class ValidationsController < AdminController
  before_filter :authenticate_admin!
  load_and_authorize_resource

  # GET /validations
  # GET /validations.json
  def index
    # Admins can view all validations, users only their own
    if current_admin.roles.find_by_name("admin")
      @validations = Validation.all
    else
      @validations = current_admin.validations
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
    @validation = Validation.new(params[:validation])
    @validation.admin = current_admin

    respond_to do |format|
      if @validation.save
        format.html { redirect_to @validation, notice: 'Validation was successfully created.' }
        format.json { render json: @validation.to_json(include: [:admin, photos: {only: :id, methods: [:attachment_url, :thumbnail_url]}]), status: :created, location: @validation }
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
      if @validation.update_attributes(params[:validation])
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

    data = open(url).read

    habitat_name = params[:habitat] || 'All'
    filename = "BlueCarbon_#{habitat_name}_Download.zip"
    send_data data, :filename => filename
  end
end
