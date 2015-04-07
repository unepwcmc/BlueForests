module CartoDb
  TEMPLATES_PATH = Rails.root.join('lib', 'modules', 'carto_db', 'templates')
  USERNAME = Rails.application.secrets.cartodb['username']
  API_KEY  = Rails.application.secrets.cartodb['api_key']

  include HTTParty

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
    "#{table_name(habitat)}_#{country.iso}"
  end

  def self.build_url path, opts={}
    opts = {with_api_key: true}.merge opts

    URI::HTTPS.build(
      host: "#{USERNAME}.cartodb.com",
      path: path,
      query: build_querystring(opts)
    ).to_s
  end

  private

  def self.build_querystring opts
    (opts[:query] || {}).tap { |query|
      query[:api_key] = API_KEY if opts[:with_api_key]
    }.to_query
  end

  def self.with_transaction query
    "BEGIN; #{query} COMMIT;"
  end

  def self.url_for_query query, format="json"
    url = build_url("/api/v2/sql", query: {q: query, format: format})
    url
  end
end
