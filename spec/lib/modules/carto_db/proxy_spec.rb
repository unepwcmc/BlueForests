require 'rails_helper'

RSpec.describe CartoDb::Proxy do
  let(:username) { Rails.application.secrets.cartodb['username'] }
  let(:api_key) { Rails.application.secrets.cartodb['api_key'] }

  let(:habitat) { 'seagrass' }
  let(:expected_sql) { "SELECT * FROM blueforest_seagrass_test WHERE country_id = '#{country.iso}'" }
  let(:style) { "#seagrass { line-opacity: 0; }" }
  let(:country) { FactoryGirl.create(:country, iso: 'JP') }
  let(:where) { "toggle IS TRUE" }

  describe '.new_map' do
    before(:each) do
      stub_request(:post, url).to_return(
        body: '{"layergroupid":"thelayerid:0", "cdn_url": {"http": "http://cdb.com", "https": "https://cdb.com"}}',
        headers: {'Content-Type' => 'application/json'}
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
              { "cartocss_version": "2.0.1", "cartocss": "#seagrass { line-opacity: 0; }",
                "sql": "SELECT * FROM blueforest_seagrass_test WHERE country_id = \'JP\' AND toggle IS TRUE"
              }
            }]
          }'''.squish
        )
      end

    end
  end
end
