require 'rails_helper'

RSpec.describe Mbtile::Configuration do
  describe '.generate' do
    describe 'given a habitat, an area, and zoom levels' do
      subject { Mbtile::Configuration.generate(habitat, area, minzoom: 9, maxzoom: 21) }

      let(:habitat) { 'mangrove' }
      let(:area) { FactoryGirl.create(:area, id: 123) }
      let(:file_mock) { double('file') }

      it 'writes the configuration on a file' do
        expect(File).to receive(:open).and_yield(file_mock)
        expect(file_mock).to receive(:<<).with('{"source":"mangrove","destination":"mangrove_final","format":"mbtiles","minzoom":9,"maxzoom":21,"mml":{}}')

        subject
      end
    end
  end
end


