require 'rails_helper'

RSpec.describe Mbtile::Style do
  describe '.generate' do
    subject { Mbtile::Style.generate(habitat, area) }

    describe 'given a habitat and an area' do
      let(:habitat) { 'mangrove' }
      let(:area) { FactoryGirl.create(:area, id: 123) }
      let(:file_mock) { double('file') }

      it 'writes the style on a file' do
        File.should_receive(:open).and_yield(file_mock)

        file_mock.should_receive(:<<).with("""
          #mangrove {
            line-color: #fff;
            line-width: 0.5;
            polygon-opacity: 0.5;
            polygon-fill: #008b00;
          }
        """.squish)

        subject
      end
    end
  end
end
