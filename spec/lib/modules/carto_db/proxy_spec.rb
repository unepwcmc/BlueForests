require 'rails_helper'

RSpec.describe CartoDb::Proxy do
  let(:habitat) { 'seagrass' }
  let(:country) { FactoryGirl.create(:country, iso: 'JP') }
  let(:where) { "toggle IS TRUE" }

  describe '.new_map' do
    subject { CartoDb::Proxy.new_map(habitat, country: country, where: where) }

    context 'given habitat and where clause' do
      it {
        expect(CartoDb::Proxy::Map).to receive(:create).with(habitat, country: country, where: where)
        subject
      }

      it {
        allow(CartoDb::Proxy::Map).to receive(:create) { 'the return value' }
        is_expected.to eq('the return value')
      }
    end
  end
end
