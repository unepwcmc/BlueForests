require 'rails_helper'

RSpec.describe AreasController, type: :controller do
  render_views

  let(:country) { FactoryGirl.create(:country, subdomain: 'mozambique') }
  let(:current_user) { FactoryGirl.create(:project_manager, country: country) }

  before :each do
    @request.host = 'mozambique.blueforests.io'
    sign_in current_user
  end

  describe 'GET #index' do
    context 'as a project manager' do
      it 'returns areas for my country' do
        area = FactoryGirl.create(:area, title: 'hey area', country: country)

        get :index
        expect(response.body).to match(/#{area.title}/)
      end

      it 'doesnt return areas from another country' do
        another_area = FactoryGirl.create(:area, title: 'some place')

        get :index
        expect(response.body).to_not match(/#{another_area.title}/)
      end
    end
  end
end

