require 'rails_helper'

RSpec.describe CartoDb do
  subject { CartoDb }
  let(:table_prefix) { Rails.application.secrets.cartodb['table_prefix'] }
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
    let(:query) { "CREATE THING IF NOT EXISTS;" }
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

    describe "given a string longer than 1024 chars" do
      subject { cartodb.query(query, false) }
      let(:query) { 1024.times.map{ "x" }.reduce(:+) }

      it "sends a POST request" do
        request_stub = stub_request(:post, url).
          with({query: {api_key: api_key}, body: {q: query, format: 'json'}}).
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

  describe '.table_name' do
    describe 'given a habitat name' do
      subject { CartoDb.table_name(habitat) }
      let(:habitat) { 'mangrove' }

      it 'returns the correct table name' do
        expect(subject).to eq("#{table_prefix}_mangrove_test")
      end
    end
  end
end
