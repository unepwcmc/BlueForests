class ProxyController < ApplicationController
  def tiles
    send_data(proxied_tile, type: 'image/png', disposition: 'inline')
  end

  private

  def proxied_tile
    CartoDb.proxy(params[:table], coords, query)
  end

  def coords
    @coords ||= params.slice(:x, :y, :z).symbolize_keys
  end

  def query
    @query ||= params.slice(:sql, :style).symbolize_keys
  end
end
