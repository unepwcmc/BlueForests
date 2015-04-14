require "rails_helper"
require "cancan/matchers"

RSpec.describe User, type: :model do
  describe "abilities" do
    subject { Ability.new(user) }

    let(:user) { nil }

    let(:japan) { FactoryGirl.create(:country, name: 'Japan') }
    let(:kosovo) { FactoryGirl.create(:country, name: 'Kosovo') }

    let(:kosovo_validation) { Validation.new(country: kosovo) }
    let(:japan_validation) { Validation.new(country: japan) }

    context "when is a super admin" do
      let(:user) { FactoryGirl.create(:super_admin, country: japan) }
      it { is_expected.to be_able_to(:manage, User.new(country: kosovo)) }
      it { is_expected.to be_able_to(:manage, kosovo_validation) }
      it { is_expected.to be_able_to(:read, Role.new(name: 'super_admin')) }
    end

    context "when is a project manager" do
      let(:user) { FactoryGirl.create(:project_manager, country: japan) }

      it { is_expected.to be_able_to(:manage, Area.new(country: japan)) }
      it { is_expected.to be_able_to(:manage, User.new(country: japan)) }
      it { is_expected.to_not be_able_to(:manage, User.new(country: kosovo)) }
      it { is_expected.to_not be_able_to(:manage, kosovo_validation) }
      it { is_expected.to be_able_to(:manage, japan_validation) }
      it { is_expected.to be_able_to(:read, Role.new(name: 'project_manager')) }
    end

    context "when is a project participant" do
      let(:user) { FactoryGirl.create(:project_participant, country: japan) }
      let(:user_validation) { Validation.new(user: user) }

      it { is_expected.to_not be_able_to(:manage, Area.new) }
      it { is_expected.to be_able_to(:read, Area.new(country: japan)) }
      it { is_expected.to_not be_able_to(:manage, User.new) }
      it { is_expected.to_not be_able_to(:manage, japan_validation) }
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
end
