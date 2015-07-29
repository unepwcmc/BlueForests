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
    @query ||= params.slice(:country_iso, :where, :style).tap do |opts|
      opts['country'] = Country.find_by_iso(opts['country_iso']) if opts['country_iso']
    end.symbolize_keys
  end
end
