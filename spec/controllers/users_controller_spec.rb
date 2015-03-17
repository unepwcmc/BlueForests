require 'rails_helper'

RSpec.describe UsersController, type: :controller do
  let(:country) { FactoryGirl.create(:country, subdomain: 'japan') }
  let(:another_country) { FactoryGirl.create(:country) }

  before :each do
    @request.host = "#{country.subdomain}.blueforest.io"
    sign_in current_user
  end

  describe 'POST #create' do
    subject { User.find_by_email('try@email.com') }
    let(:role) { FactoryGirl.create(:role) }
    let(:user_params) { {email: 'try@email.com', password: 'blueforest', password_confirmation: 'blueforest', roles_ids: [role.id]} }

    context 'current user is a project manager' do
      let(:current_user) { FactoryGirl.create(:project_manager, country: country) }

      it 'creates the user under the current country' do
        post :create, user: user_params
        expect(subject.country).to eq(country)
      end
    end

    context 'current user is a super admin' do
      let(:current_user) { FactoryGirl.create(:super_admin) }

      it 'creates the user with the chosen country' do
        post :create, user: user_params.merge({country_id: another_country.id})
        expect(subject.country).to eq(another_country)
      end
    end
  end
end

