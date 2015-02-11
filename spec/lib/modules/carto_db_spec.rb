require 'rails_helper'

RSpec.describe CartoDb do
  subject { CartoDb.new() }
  let(:username) { Rails.application.secrets.cartodb['username'] }
  let(:api_key) { Rails.application.secrets.cartodb['api_key'] }

  it "uses the application secrets API key to construct the API URL
   and query" do
    expected_url = "https://#{username}.cartodb.com/api/v2/sql"
    expect(CartoDb.base_uri).to eq(expected_url)

    actual_api_key = subject.instance_variable_get(:@options)[:query][:api_key]
    expect(actual_api_key).to eq(api_key)
  end

  describe ".query, given an SQL query" do
    let(:query) { "CREATE THING IF NOT EXISTS" }
    let(:url) { "https://#{username}.cartodb.com/api/v2/sql/" }
    let(:cartodb) { CartoDb.new() }

    subject { cartodb.query(query) }

    it "sends the sql query to cartodb and returns the object" do
      request_stub = stub_request(:get, url).
        with({query: {api_key: api_key, q: query}}).
        to_return(:status => 200, :body => '{"rows": 1}', :headers => {})

      expect(subject).to eq({"rows" => 1})
      expect(request_stub).to have_been_requested.once
    end
  end
end
