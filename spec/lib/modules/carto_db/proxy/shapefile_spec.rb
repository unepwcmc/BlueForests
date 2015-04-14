require 'rails_helper'

RSpec.describe CartoDb::Proxy::Shapefile do
  let(:habitat) { 'mangrove' }

  describe '.download' do
    context 'given a habitat' do
      subject { CartoDb::Proxy::Shapefile.download(habitat) }

      it 'returns the body of the request to CartoDB' do
        response = double('response')

        allow(response).to receive(:body) { 'the shapefile' }
        allow(Net::HTTP).to receive(:get_response) { response }

        is_expected.to eq('the shapefile')
      end
    end
  end
end
