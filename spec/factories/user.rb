FactoryGirl.define do
  factory :user do
    sequence(:email) { |n| "person#{n}@blueforests.io" }
    password "password"
    password_confirmation "password"

    before(:create) do |user|
      user.countries << create(:country) if user.countries.empty?
    end

    factory :super_admin do
      roles {[FactoryGirl.create(:role, name: 'super_admin')]}

      before(:create) do |user|
        user.countries = Country.all || [create(:country)]
      end
    end

    factory :project_manager do
      roles {[FactoryGirl.create(:role, name: 'project_manager')]}
    end

    factory :project_participant do
      roles {[FactoryGirl.create(:role, name: 'project_participant')]}
    end
  end
end
