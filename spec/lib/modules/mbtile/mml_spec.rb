require 'rails_helper'

RSpec.describe Mbtile::Mml do
  describe '.generate' do
    describe 'given a habitat, area and options with zoom' do
      subject { Mbtile::Mml.generate(habitat, area, minzoom: 9, maxzoom: 15) }

      let(:file_mock) { double('file') }
      let(:habitat) { 'mangrove' }
      let(:area) {
        FactoryGirl.create(:area, id: 123, coordinates: '[[0,0],[0,1],[1,1]]')
      }

      it 'writes the mml json on a file with the given zoom' do
        expect(CartoDb).to receive(:url_for_query).and_return('geojson')
        expect(File).to receive(:open).and_yield(file_mock)

        expect(file_mock).to receive(:<<).with("""
          {
            \"bounds\": [0, 0, 1, 1],
            \"center\": [0.5, 0.5, 9],
            \"format\": \"png8\",
            \"interactivity\": false,
            \"minzoom\": 9,
            \"maxzoom\": 15,
            \"srs\": \"+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over\",
            \"Stylesheet\": [\"style.mss\"],
            \"Layer\": [
              {
                \"geometry\": \"polygon\",
                \"extent\": [0, 0, 1, 1],
                \"id\": \"mangrove\",
                \"class\": \"\",
                \"Datasource\": { \"file\": \"geojson\" },
                \"srs-name\": \"WGS84\",
                \"srs\": \"+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs\",
                \"advanced\": {},
                \"name\": \"mangrove\"
              }
            ],
            \"scale\": 1,
            \"metatile\": 4,
            \"name\": \"\",
            \"description\": \"\"
          }
        """.squish)

        subject
      end
    end
  end
end
