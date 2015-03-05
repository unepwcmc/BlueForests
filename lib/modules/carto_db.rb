module CartoDb
  include HTTParty

  USERNAME = Rails.application.secrets.cartodb['username']
  API_KEY  = Rails.application.secrets.cartodb['api_key']

  def self.query query, with_transaction=true
    query = with_transaction(query) if with_transaction

    response = self.get url_for(query)
    JSON.parse(response.body)
  end

  def self.with_transaction query
    "BEGIN; #{query} COMMIT;"
  end

  def self.url_for query, format="json"
    URI::HTTPS.build(
      host: "#{USERNAME}.cartodb.com",
      path: "/api/v2/sql",
      query: {
        q: query,
        api_key: API_KEY,
        format: format
      }.to_query
    ).to_s
  end
end
