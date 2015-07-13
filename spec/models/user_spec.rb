require "rails_helper"
require "cancan/matchers"

RSpec.describe User, type: :model do
  let(:mozambique) { FactoryGirl.create(:country, subdomain: 'mozambique', name: 'mozambique') }
  let(:kosovo) { FactoryGirl.create(:country, name: 'Kosovo') }

  describe "abilities" do
    subject { Ability.new(user) }

    let(:user) { nil }


    let(:kosovo_validation) { Validation.new(country: kosovo) }
    let(:mozambique_validation) { Validation.new(country: mozambique) }

    context "when is a super admin" do
      let(:user) { FactoryGirl.create(:super_admin, country: mozambique) }
      it { is_expected.to be_able_to(:manage, User.new(country: kosovo)) }
      it { is_expected.to be_able_to(:manage, kosovo_validation) }
      it { is_expected.to be_able_to(:read, Role.new(name: 'super_admin')) }
    end

    context "when is a project manager" do
      let(:user) { FactoryGirl.create(:project_manager, country: mozambique) }

      it { is_expected.to be_able_to(:manage, Area.new(country: mozambique)) }
      it { is_expected.to be_able_to(:manage, User.new(country: mozambique)) }
      it { is_expected.to_not be_able_to(:manage, User.new(country: kosovo)) }
      it { is_expected.to_not be_able_to(:manage, kosovo_validation) }
      it { is_expected.to be_able_to(:manage, mozambique_validation) }
      it { is_expected.to be_able_to(:read, Role.new(name: 'project_manager')) }
    end

    context "when is a project participant" do
      let(:user) { FactoryGirl.create(:project_participant, country: mozambique) }
      let(:user_validation) { Validation.new(user: user) }

      it { is_expected.to_not be_able_to(:manage, Area.new) }
      it { is_expected.to be_able_to(:read, Area.new(country: mozambique)) }
      it { is_expected.to_not be_able_to(:manage, User.new) }
      it { is_expected.to_not be_able_to(:manage, mozambique_validation) }
      it { is_expected.to be_able_to(:manage, user_validation) }
      it { is_expected.to be_able_to(:read, Role.new(name: 'project_participant')) }
      it { is_expected.to_not be_able_to(:read, Role.new(name: 'project_manager')) }
    end
  end

  describe '#super_admin?' do
    subject { user.super_admin? }

    context 'when is a super admin' do
      let(:user) { FactoryGirl.create(:super_admin) }
      it { is_expected.to be true }
    end

    context 'when is not a super admin' do
      let(:user) { FactoryGirl.create(:project_manager) }
      it { is_expected.to be false }
    end
  end

  describe '::find_for_authentication' do
    subject { User.find_for_authentication(conditions) }
    let(:user) { FactoryGirl.create(:user, country: mozambique) }

    context 'when a country subdomain is given' do
      let(:conditions) { {email: user.email, subdomain: 'mozambique'} }
      it { is_expected.to eq user }
    end

    context 'when a composed subdomain is given' do
      let(:conditions) { {email: user.email, subdomain: 'mozambique.some.other-stuff'} }
      it { is_expected.to eq user }
    end
  end
end
