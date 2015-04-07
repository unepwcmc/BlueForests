class ProxyController < ApplicationController
  def maps
    tiles_url = new_map
    head :created, location: tiles_url
  end

  private

  def new_map
    CartoDb::Proxy.new_map(params[:habitat], options)
  end

  def options
    @query ||= params.slice(:country, :where, :style).tap do |opts|
      opts['country'] = Country.find_by_iso(opts['country']) if opts['country']
    end.symbolize_keys
  end
end
