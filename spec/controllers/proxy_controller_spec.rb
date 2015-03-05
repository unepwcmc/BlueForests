require 'rails_helper'

RSpec.describe ProxyController, type: :controller do
  before :each do
    FactoryGirl.create(:country, subdomain: 'japan')
    @request.host = "japan.blueforests.com"
  end

  describe 'GET #tiles' do
    let(:table) { 'blueforest_mangrove_development' }
    let(:coords) { {x: '12', y: '24', z: '8' } }

    describe 'given table and coords' do
      it 'returns the tile from CartoDb proxy' do
        expect(CartoDb).to(
          receive(:proxy).with(table, coords, {}).and_return('the image')
        )

        get :tiles, {table: table}.merge(coords)
        expect(response.body).to eq('the image')
      end
    end

    describe 'given table, coords, sql query and style' do
      let(:sql) { 'SELECT * FROM blueforest_mangrove_development' }
      let(:style) { '#mangrove { fill-color: red; }' }
      let(:query) { {sql: sql, style: style} }

      it 'returns the tile from CartoDb proxy' do
        expect(CartoDb).to(
          receive(:proxy).with(table, coords, query).and_return('the image')
        )

        get :tiles, {table: table}.merge(coords).merge(query)
        expect(response.body).to eq('the image')
      end
    end
  end
end
