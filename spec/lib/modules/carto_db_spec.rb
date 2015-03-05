require 'rails_helper'

RSpec.describe CartoDb do
  subject { CartoDb }
  let(:username) { Rails.application.secrets.cartodb['username'] }
  let(:api_key) { Rails.application.secrets.cartodb['api_key'] }

  describe ".with_transaction, given a query" do
    let(:query) { "SELECT * THE THINGS;" }
    subject { CartoDb.with_transaction(query) }

    it "wraps the query string in an SQL transaction" do
      expect(subject).to eq("BEGIN; SELECT * THE THINGS; COMMIT;")
    end
  end

  describe ".query" do
    let(:cartodb) { CartoDb }
    let(:query) { "CREATE THING IF NOT EXISTS" }
    let(:url) { "https://#{username}.cartodb.com/api/v2/sql" }

    describe "given an SQL query" do
      let(:query_with_transaction) { "BEGIN; #{query} COMMIT;" }

      subject { cartodb.query(query) }

      it "sends the sql query wrapped in a transaction to cartodb and returns the object" do
        request_stub = stub_request(:get, url).
          with({query: {api_key: api_key, q: query_with_transaction, format: 'json'}}).
          to_return(:status => 200, :body => '{"rows": 1}', :headers => {})

        expect(subject).to eq({"rows" => 1})
        expect(request_stub).to have_been_requested.once
      end
    end

    describe "given an SQL query and false, as with no transaction" do
      subject { cartodb.query(query, false) }

      it "sends the sql query wrapped in a transaction to cartodb and returns the object" do
        request_stub = stub_request(:get, url).
          with({query: {api_key: api_key, q: query, format: 'json'}}).
          to_return(:status => 200, :body => '{"rows": 1}', :headers => {})

        expect(subject).to eq({"rows" => 1})
        expect(request_stub).to have_been_requested.once
      end
    end
  end

  describe ".url_for_query" do
    let(:query) { "CREATE THING IF NOT EXISTS" }
    let(:encoded_query) { "CREATE+THING+IF+NOT+EXISTS" }
    let(:cartodb) { CartoDb }

    describe "given a query and no format" do
      let(:url) { "https://#{username}.cartodb.com/api/v2/sql?api_key=#{api_key}&format=json&q=#{encoded_query}" }
      subject { cartodb.url_for_query(query) }

      it "returns the CartoDB API URL with the query and JSON format" do
        expect(subject).to eq(url)
      end
    end

    describe "given a query and KML format" do
      let(:url) { "https://#{username}.cartodb.com/api/v2/sql?api_key=#{api_key}&format=kml&q=#{encoded_query}" }
      subject { cartodb.url_for_query(query, 'kml') }

      it "returns the CartoDB API URL with the query and KML format" do
        expect(subject).to eq(url)
      end
    end
  end

  describe ".proxy" do
    let(:url) { "https://#{username}.cartodb.com/tiles/#{from}/#{coords[:z]}/#{coords[:x]}/#{coords[:y]}.png" }
    let(:from) { 'blueforest_seagrass_test' }
    let(:coords) { {x: 1, y: 21, z: 17} }

    describe "given table and coordinates" do
      subject { CartoDb.proxy(from, coords) }

      it "returns the tiles requested from cartodb" do
        stub_request(:get, url).
          with({query: {api_key: api_key}}).
          to_return(:status => 200, :body => 'this is the image', :headers => {})

        expect(subject).to eq('this is the image')
      end
    end

    describe "given table, coordinates, sql and style" do
      let(:sql) { "SELECT * FROM blueforest_seagrass_test_norway" }
      let(:style) { "#seagrass { line-opacity: 0; }" }

      subject { CartoDb.proxy(from, coords, sql: sql, style: style) }

      it "returns the tiles requested from cartodb" do
        stub_request(:get, url).
          with({query: {api_key: api_key, sql: sql, style: style}}).
          to_return(:status => 200, :body => 'this is the image', :headers => {})

        expect(subject).to eq('this is the image')
      end
    end
  end
end
