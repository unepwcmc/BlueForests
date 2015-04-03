require 'rails_helper'

RSpec.describe ProxyController, type: :controller do
  let(:habitat) { 'mangrove' }
  let(:where) { 'toggle IS true' }
  let(:style) { '#mangrove { fill-color: red; }' }
  let(:options) { {where: where, style: style} }

  before :each do
    FactoryGirl.create(:country, subdomain: 'japan')
    @request.host = "japan.blueforest.io"
  end

  describe 'GET #tiles' do
    subject { response.body }

    let(:coords) { {x: '12', y: '24', z: '8' } }
    let(:table) { 'blueforest_mangrove_test' }

    describe 'given habitat and coords' do
      it 'returns the tile from CartoDb proxy' do
        expect(CartoDb::Proxy).to(
          receive(:tile).with(habitat, coords, {}).and_return('the image')
        )

        get :tiles, {habitat: habitat}.merge(coords)
        is_expected.to eq('the image')
      end
    end

    describe 'given habitat, coords, sql conditions and style' do
      it 'returns the tile from CartoDb proxy' do
        expect(CartoDb::Proxy).to(
          receive(:tile).with(habitat, coords, options).and_return('the image')
        )

        get :tiles, {habitat: habitat}.merge(coords).merge(options)
        is_expected.to eq('the image')
      end
    end
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
