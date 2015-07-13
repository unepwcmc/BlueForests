require 'rails_helper'

describe ApplicationController, type: :controller do
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
      subject { @controller.current_country }

      before :each do
        @request.host = "#{country.subdomain}.blueforests.io"
      end

      it 'assigns @current_country' do
        get :index
        is_expected.to eq(country)
      end
    end

    describe 'given a fancy subdomain' do
      subject { @controller.current_country }

      before :each do
        @request.host = "#{country.subdomain}.greenforest.blueforests.io"
      end

      it 'assigns @current_country' do
        get :index
        is_expected.to eq(country)
      end
    end

    describe 'given no subdomain' do
      subject { get :index }

      it 'redirects to the home page' do
        is_expected.to redirect_to("/")
      end
    end

    describe 'given an invalid subdomain' do
      subject { get :index }

      before :each do
        @request.host = "darkoakwoods.blueforests.io"
      end

      it 'redirects to the home page' do
        is_expected.to redirect_to("http://blueforests.io/")
      end
    end
  end
end
