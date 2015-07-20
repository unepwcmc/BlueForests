class MbtilesController < ApplicationController
  def show
    @area = Area.find(params[:area_id])
    @mbtile = @area.mbtiles.find_by_habitat(params[:id])

    send_file @mbtile.final_path
  end
end
