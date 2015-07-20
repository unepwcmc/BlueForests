class AreasController < ApplicationController
  before_filter :authenticate_user!
  before_filter :check_country_for_restricted_pages
  before_filter :load_area, only: [:show, :edit, :update, :destroy]
  before_filter :load_areas, only: [:index]

  load_and_authorize_resource

  def index
    respond_to do |format|
      format.html
      format.json
    end
  end

  def show
    @mbtiles = @area.mbtiles.order(:habitat)

    respond_to do |format|
      format.html
      format.json
    end
  end

  def new
    @area = Area.new

    respond_to do |format|
      format.html
      format.json { render json: @area }
    end
  end

  def edit
  end

  def create
    @area = Area.new(area_params)

    respond_to do |format|
      if @area.save
        format.html { redirect_to @area, notice: 'Area was successfully created.' }
        format.json { render json: @area, status: :created, location: @area }
      else
        format.html { render action: "new" }
        format.json { render json: @area.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @area.update_attributes(area_params)
        format.html { redirect_to @area, notice: 'Area was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @area.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @area.destroy

    respond_to do |format|
      format.html { redirect_to areas_url }
      format.json { head :no_content }
    end
  end

  private

  def load_area
    @area = Area.find(params[:id])
  end

  def area_params
    params.require(:area).permit(:title, :coordinates, :country_id)
  end

  def load_areas
    @areas = Area.accessible_by(current_ability)

    if params[:country_id] && current_user.super_admin?
      @areas = @areas.where(country_id: params[:country_id])
    end
  end
end
