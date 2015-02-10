require 'rails_helper'

describe ApplicationController do
  controller do
    def index
      render text: ''
    end
  end

  describe 'GET :index' do
    let(:country) {
      FactoryGirl.create(:country, subdomain: 'siavash', name: 'Siavash Amini', iso: 'SI')
    }

    describe 'given a subdomain' do
      subject { assigns(:current_country) }

      before :each do
        @request.host = "#{country.subdomain}.blueforests.com"
      end

      it 'assigns @current_country' do
        get :index
        is_expected.to eq(country)
      end
    end

    describe 'given no subdomain' do
      subject { get :index }

      it 'does not redirect' do
        expect(subject).to_not redirect_to("/")
      end
    end

    describe 'given an invalid subdomain' do
      subject { get :index }

      before :each do
        @request.host = "darkoakwoods.blueforests.com"
      end

      it 'redirects to the home page' do
        expect(subject).to redirect_to("/")
      end
    end
  end
end
