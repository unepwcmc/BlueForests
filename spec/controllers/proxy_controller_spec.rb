require 'rails_helper'

RSpec.describe ProxyController, type: :controller do
  before :each do
    FactoryGirl.create(:country, subdomain: 'japan')
    @request.host = "japan.blueforest.io"
  end

  describe 'GET #tiles' do
    let(:habitat) { 'mangrove' }
    let(:coords) { {x: '12', y: '24', z: '8' } }
    let(:table) { 'blueforest_mangrove_test' }

    describe 'given habitat and coords' do
      it 'returns the tile from CartoDb proxy' do
        expect(CartoDb::Proxy).to(
          receive(:tile).with(habitat, coords, {}).and_return('the image')
        )

        get :tiles, {habitat: habitat}.merge(coords)
        expect(response.body).to eq('the image')
      end
    end

    describe 'given habitat, coords, sql conditions and style' do
      let(:where) { 'toggle IS true' }
      let(:style) { '#mangrove { fill-color: red; }' }
      let(:query) { {where: where, style: style} }

      it 'returns the tile from CartoDb proxy' do
        expect(CartoDb::Proxy).to(
          receive(:tile).with(habitat, coords, query).and_return('the image')
        )

        get :tiles, {habitat: habitat}.merge(coords).merge(query)
        expect(response.body).to eq('the image')
      end
    end
  end
end
