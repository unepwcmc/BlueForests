require 'rails_helper'

RSpec.describe Subdomainer do
  Request = Struct.new(:subdomain)
  let(:country) { FactoryGirl.create(:country, subdomain: 'mozambique') }

  before(:each) do
    country
  end

  describe '::country' do
    context 'given a request object' do
      subject { Subdomainer.country(request) }
      let(:request) { Request.new('mozambique') }

      it { is_expected.to eq country }
    end

    context 'given a subdomain' do
      subject { Subdomainer.country(subdomain) }
      let(:subdomain) { 'mozambique' }

      it { is_expected.to eq country }
    end
  end

  describe '::root' do
    subject { Subdomainer.root }
    let(:root) { Rails.application.secrets.base_subdomain }

    it { is_expected.to eq root }
  end

  describe '::root?' do
    subject { Subdomainer.root?(request) }
    let(:request) { Request.new("") }

    it { is_expected.to be true }
  end

  describe '::from_user' do
    subject { Subdomainer.from_user(user) }

    context 'given a project participant with one country' do
      let(:user) { FactoryGirl.build(:project_participant, countries: [country]) }
      it { is_expected.to eq 'mozambique' }
    end

    context 'given a project participant with more than a country, and a country id' do
      let(:another_country) { FactoryGirl.create(:country) }
      let(:user) { FactoryGirl.create(:project_participant, countries: [country, another_country]) }
      subject { Subdomainer.from_user(user, country.id) }

      it { is_expected.to eq 'mozambique' }
    end

    context 'given a super admin' do
      let(:user) { FactoryGirl.build(:super_admin) }
      it { is_expected.to eq 'admin' }
    end

    context 'given a user with multiple countries and a non-existing country id' do
      let(:another_country) { FactoryGirl.create(:country) }
      let(:user) { FactoryGirl.create(:user, countries: [country, another_country]) }
      subject { Subdomainer.from_user(user, 9999) }

      it { is_expected.to eq '' }
    end
  end
end
