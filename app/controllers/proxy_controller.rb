class ProxyController < ApplicationController
  def tiles
    send_data(tile, type: 'image/png', disposition: 'inline')
  end

  def maps
    tiles_url = new_map
    head :created, location: tiles_url
  end

  private

  def new_map
    CartoDb::Proxy.new_map(params[:habitat], options)
  end

  def tile
    CartoDb::Proxy.tile(params[:habitat], coords, options)
  end

  def coords
    @coords ||= params.slice(:x, :y, :z).symbolize_keys
  end

  def options
    @query ||= params.slice(:country, :where, :style).symbolize_keys
  end
end
