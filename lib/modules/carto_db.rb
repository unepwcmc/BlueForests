class CartoDb
  include HTTParty

  base_uri "https://#{Rails.application.secrets.cartodb['username']}.cartodb.com/api/v2/sql"

  def initialize
    api_key = Rails.application.secrets.cartodb['api_key']
    @options = { query: { api_key: api_key } }
  end

  def query query
    @options[:query][:q] = query
    JSON.parse(self.class.get('/', @options).body)
  end
end
