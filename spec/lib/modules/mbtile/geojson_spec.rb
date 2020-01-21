require 'rails_helper'

RSpec.describe Mbtile::Geojson do
  describe '.generate' do
    subject { Mbtile::Geojson.generate(habitat, area) }

    describe 'given a habitat and an area' do
      let(:habitat) { 'mangrove' }
      let(:area) { FactoryGirl.create(:area, id: 123) }
      let(:file_mock) { double('file') }

      it 'writes the geojson on a file' do
        # handle area's after_create callback
        allow(CartoDb).to receive(:query)

        # specify which CartDb query call is expected to return 'the geojson'
        # by adding with
        mbtile_query = Mbtile::Base.new(habitat, area).send(:cartodb_query)
        expect(CartoDb).to receive(:query).with(mbtile_query).and_return('the geojson')

        expect(File).to receive(:open).and_yield(file_mock)
        expect(file_mock).to receive(:<<).with('the geojson')

        subject
      end
    end
  end
end

