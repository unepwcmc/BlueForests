require 'rails_helper'

RSpec.describe Mbtile::Geojson do
  describe '.generate' do
    subject { Mbtile::Geojson.generate(habitat, area) }

    describe 'given a habitat and an area' do
      let(:habitat) { 'mangrove' }
      let(:area) { FactoryGirl.create(:area, id: 123) }
      let(:file_mock) { double('file') }

      it 'writes the geojson on a file' do
        expect(CartoDb).to receive(:query).and_return('the geojson')

        expect(File).to receive(:open).and_yield(file_mock)
        expect(file_mock).to receive(:<<).with('the geojson')

        subject
      end
    end
  end
end

