require 'rails_helper'

RSpec.describe CartoDb::Proxy do
  let(:username) { Rails.application.secrets.cartodb['username'] }
  let(:api_key) { Rails.application.secrets.cartodb['api_key'] }

  let(:habitat) { 'seagrass' }
  let(:expected_sql) { 'SELECT * FROM blueforest_seagrass_test' }
  let(:style) { "#seagrass { line-opacity: 0; }" }
  let(:country) { FactoryGirl.create(:country, name: 'Japan') }
  let(:where) { "toggle IS TRUE" }

  describe ".tile" do
    let(:url) { "https://#{username}.cartodb.com/tiles/blueforest_#{habitat}_test/#{coords[:z]}/#{coords[:x]}/#{coords[:y]}.png" }
    let(:coords) { {x: 1, y: 21, z: 17} }

    context "given table and coordinates" do
      subject { CartoDb::Proxy.tile(habitat, coords) }

      it "returns the tiles requested from cartodb" do

        stub_request(:get, url).
          with({query: {api_key: api_key, sql: expected_sql}}).
          to_return(:status => 200, :body => 'this is the image', :headers => {})

        expect(subject).to eq('this is the image')
      end
    end

    context "given table, coordinates, where condition and style" do

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

  describe '.new_map' do
    before(:each) do
      stub_request(:post, url).to_return(
        body: '{"layergroupid":"thelayerid:0", "cdn_url": {"http": "http://cdb.com", "https": "https://cdb.com"}}'
      )
    end

    let(:url) { "https://#{username}.cartodb.com/api/v1/map?api_key=#{api_key}" }
    let(:tiles_url) { URI.escape "https://#{username}.cartodb.com/api/v1/map/thelayerid:0/{z}/{x}/{y}.png?" }

    subject { CartoDb::Proxy.new_map(habitat, country: country, where: where, style: style) }

    context 'given habitat, where clause and style' do
      it { is_expected.to eq(tiles_url) }

      it 'does a POST request to CartoDb' do
        subject
        expect(WebMock).to have_requested(:post, url).with(body: '''
          { "version": "1.0.1", "layers": [{
            "type": "cartodb", "options":
              { "cartocss_version": "2.0.1", "cartocss": #seagrass { line-opacity: 0; },
                "sql": SELECT * FROM blueforest_seagrass_test_Japan WHERE toggle IS TRUE
              }
            }]
          }'''.squish
        )
      end

    end
  end
end
