require 'rails_helper'

RSpec.describe UsersController, type: :controller do
  let(:country) { FactoryGirl.create(:country, subdomain: 'mozambique') }
  let(:another_country) { FactoryGirl.create(:country) }

  before :each do
    @request.host = "#{country.subdomain}.blueforests.io"
    sign_in current_user
  end

  describe 'POST #create' do
    subject { User.find_by_email('try@email.com') }
    let(:role) { FactoryGirl.create(:role) }
    let(:user_params) { {email: 'try@email.com', password: 'blueforests', password_confirmation: 'blueforests', role_ids: [role.id]} }

    context 'current user is a project manager' do
      let(:current_user) { FactoryGirl.create(:project_manager, countries: [country]) }

      it 'creates the user under the current country' do
        post :create, user: user_params
        expect(subject.countries).to eq([country])
      end
    end

    context 'current user is a super admin' do
      let(:current_user) { FactoryGirl.create(:super_admin) }

      it 'creates the user with the chosen country' do
        post :create, user: user_params.merge({country_ids: [another_country.id]})
        expect(subject.countries).to eq([another_country])
      end
    end
  end

  describe 'GET #me' do
    subject { JSON.parse(response.body) }
    let(:bounds) { [[-1, -1], [1, 1]] }
    let(:country) { FactoryGirl.create(:country, bounds: bounds) }
    let(:current_user) { FactoryGirl.create(:user, countries: [country]) }

    it 'returns the user details' do
      get :me
      expect(subject).to eq({
        "id" => current_user.id,
        "email" => current_user.email,
        "countries" => [{
          "name" => country.name,
          "bounds" => bounds
        }]
      })
    end
  end
end

