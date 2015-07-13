require 'rails_helper'

RSpec.describe ProxyController, type: :controller do
  let(:habitat) { 'mangrove' }
  let(:where) { 'toggle IS true' }
  let(:style) { '#mangrove { fill-color: red; }' }
  let(:options) { {where: where, style: style} }

  before :each do
    FactoryGirl.create(:country, subdomain: 'mozambique')
    @request.host = "mozambique.blueforests.io"
  end

  describe 'POST #maps' do
    let(:location) { 'http://location' }
    before(:each) do
      expect(CartoDb::Proxy).to(
        receive(:new_map).with(habitat, options).and_return(location)
      )
    end

    describe 'given habitat and cartocss' do
      it 'returns http code 201' do
        post :maps, {habitat: habitat}.merge(options)
        expect(response.code).to eq('201')
      end

      it 'returns a location header to the tiles url' do
        post :maps, {habitat: habitat}.merge(options)
        expect(response.headers['Location']).to eq(location)
      end
    end
  end
end
