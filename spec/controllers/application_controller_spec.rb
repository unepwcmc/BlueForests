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
        @request.host = "#{country.subdomain}.blueforests.com"
      end

      it 'assigns @current_country' do
        get :index
        is_expected.to eq(country)
      end
    end

    describe 'given a fancy subdomain' do
      subject { @controller.current_country }

      before :each do
        @request.host = "#{country.subdomain}.greenforest.blueforests.com"
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
        @request.host = "darkoakwoods.blueforests.com"
      end

      it 'redirects to the home page' do
        is_expected.to redirect_to("http://blueforests.com/")
      end
    end

    describe 'given user is signed in' do
      subject { @controller.current_country }

      let(:user_country) { FactoryGirl.create(:country) }
      let(:user) { FactoryGirl.create(:user, country: user_country) }

      before :each do
        sign_in user
        @request.host = "#{country.subdomain}.blueforests.com"
      end

      it 'sets the country to the user country' do
        is_expected.to eq(user_country)
      end
    end
  end
end
