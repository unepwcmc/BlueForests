require 'rails_helper'

RSpec.describe CartoDb::Proxy do
  subject { CartoDb::Proxy }

  let(:username) { Rails.application.secrets.cartodb['username'] }
  let(:api_key) { Rails.application.secrets.cartodb['api_key'] }

  describe ".tile" do
    let(:url) { "https://#{username}.cartodb.com/tiles/blueforest_#{habitat}_test/#{coords[:z]}/#{coords[:x]}/#{coords[:y]}.png" }
    let(:habitat) { 'seagrass' }
    let(:coords) { {x: 1, y: 21, z: 17} }

    describe "given table and coordinates" do
      subject { CartoDb::Proxy.tile(habitat, coords) }

      it "returns the tiles requested from cartodb" do
        expected_sql = 'SELECT * FROM blueforest_seagrass_test'

        stub_request(:get, url).
          with({query: {api_key: api_key, sql: expected_sql}}).
          to_return(:status => 200, :body => 'this is the image', :headers => {})

        expect(subject).to eq('this is the image')
      end
    end

    describe "given table, coordinates, where condition and style" do
      let(:where) { "toggle IS TRUE" }
      let(:style) { "#seagrass { line-opacity: 0; }" }
      let(:country) { FactoryGirl.create(:country, name: 'Japan') }

      subject { CartoDb::Proxy.tile(habitat, coords, country: country, where: where, style: style) }

      it "returns the tiles requested from cartodb" do
        expected_sql = 'SELECT * FROM blueforest_seagrass_test_Japan WHERE toggle IS TRUE'

        stub_request(:get, url).
          with({query: {api_key: api_key, sql: expected_sql, style: style}}).
          to_return(:status => 200, :body => 'this is the image', :headers => {})

        expect(subject).to eq('this is the image')
      end
    end
  end
end
