require 'rails_helper'

RSpec.describe CartoDb do
  subject { CartoDb }
  let(:username) { Rails.application.secrets.cartodb['username'] }
  let(:api_key) { Rails.application.secrets.cartodb['api_key'] }

  describe ".query, given an SQL query" do
    let(:query) { "CREATE THING IF NOT EXISTS" }
    let(:url) { "https://#{username}.cartodb.com/api/v2/sql" }
    let(:cartodb) { CartoDb }

    subject { cartodb.query(query) }

    it "sends the sql query to cartodb and returns the object" do
      request_stub = stub_request(:get, url).
        with({query: {api_key: api_key, q: query, format: 'json'}}).
        to_return(:status => 200, :body => '{"rows": 1}', :headers => {})

      expect(subject).to eq({"rows" => 1})
      expect(request_stub).to have_been_requested.once
    end
  end

  describe ".url_for" do
    let(:query) { "CREATE THING IF NOT EXISTS" }
    let(:encoded_query) { "CREATE+THING+IF+NOT+EXISTS" }
    let(:cartodb) { CartoDb }

    describe "given a query and no format" do
      let(:url) { "https://#{username}.cartodb.com/api/v2/sql?api_key=#{api_key}&format=json&q=#{encoded_query}" }
      subject { cartodb.url_for(query) }

      it "returns the CartoDB API URL with the query and JSON format" do
        expect(subject).to eq(url)
      end
    end

    describe "given a query and KML format" do
      let(:url) { "https://#{username}.cartodb.com/api/v2/sql?api_key=#{api_key}&format=kml&q=#{encoded_query}" }
      subject { cartodb.url_for(query, 'kml') }

      it "returns the CartoDB API URL with the query and KML format" do
        expect(subject).to eq(url)
      end
    end
  end
end
