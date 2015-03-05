class ProxyController < ApplicationController
  def tiles
    send_data(tile, type: 'image/png', disposition: 'inline')
  end

  private

  def tile
    CartoDb::Proxy.tile(params[:habitat], coords, query)
  end

  def coords
    @coords ||= params.slice(:x, :y, :z).symbolize_keys
  end

  def query
    @query ||= params.slice(:where, :style).symbolize_keys
  end
end
