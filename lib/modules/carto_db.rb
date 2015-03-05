module CartoDb
  include HTTParty

  USERNAME = Rails.application.secrets.cartodb['username']
  API_KEY  = Rails.application.secrets.cartodb['api_key']

  def self.proxy from, coords, opts={}
    response = self.get(url_for_proxy from, coords, opts)
    response.body
  end

  def self.query query, with_transaction=true
    query = with_transaction(query) if with_transaction

    response = self.get url_for_query(query)
    JSON.parse(response.body)
  end

  def self.table_name habitat
    prefix = Rails.application.secrets.cartodb['table_prefix']
    "#{prefix}_#{habitat}_#{Rails.env}"
  end

  def self.view_name habitat, country
    "#{table_name(habitat)}_#{country.name}"
  end

  private

  def self.with_transaction query
    "BEGIN; #{query} COMMIT;"
  end

  def self.url_for_query query, format="json"
    build_url("/api/v2/sql", q: query, format: format)
  end

  def self.url_for_proxy from, coords, opts
    coords = [:z, :x, :y].map(&coords.method(:[])).join('/')
    build_url("/tiles/#{from}/#{coords}.png", opts)
  end

  def self.build_url path, query
    URI::HTTPS.build(
      host: "#{USERNAME}.cartodb.com",
      path: path,
      query: {api_key: API_KEY}.merge(query).to_query
    ).to_s
  end
end
