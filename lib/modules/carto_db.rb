module CartoDb
  MAX_SQL_GET_LENGTH = 1024
  TEMPLATES_PATH = Rails.root.join('lib', 'modules', 'carto_db', 'templates')

  SQL_URL = '/api/v2/sql'
  USERNAME = Rails.application.secrets.cartodb['username']
  API_KEY  = Rails.application.secrets.cartodb['api_key']

  include HTTParty

  def self.query query, with_transaction=true
    query = with_transaction(query) if with_transaction
    needs_a_post = query.length >= MAX_SQL_GET_LENGTH

    response = if needs_a_post
      self.post(build_url(SQL_URL), body: {q: query, format: 'json'})
    else
      self.get(url_for_query(query))
    end

    JSON.parse(response.body)
  end

  def self.table_name habitat
    prefix = Rails.application.secrets.cartodb['table_prefix']
    "#{prefix}_#{habitat}_#{Rails.env}"
  end

  def self.build_url path, opts={}
    opts = {with_api_key: true}.merge opts
    uri = URI::HTTPS.build(
      host: "#{USERNAME}.cartodb.com",
      path: path,
      query: build_querystring(opts)
    )

    opts[:as_uri] ? uri : uri.to_s
  end

  private

  def self.build_querystring opts
    (opts[:query] || {}).tap { |query|
      query[:api_key] = API_KEY if opts[:with_api_key]
    }.to_query
  end

  def self.with_transaction query
    query << ';' if query.last != ';'
    "BEGIN; #{query} COMMIT;"
  end

  def self.url_for_query query, format="json"
    build_url(SQL_URL, query: {q: query, format: format})
  end
end
