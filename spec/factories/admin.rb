FactoryGirl.define do
  factory :admin do
    sequence(:email) { |n| "person#{n}@blueforest.com" }
    password "password"
    password_confirmation "password"
    country

    factory :super_admin do
      roles {[FactoryGirl.create(:role, name: 'super_admin')]}
    end

    factory :project_manager do
      roles {[FactoryGirl.create(:role, name: 'project_manager')]}

    end
    factory :project_participant do
      roles {[FactoryGirl.create(:role, name: 'project_participant')]}
    end
  end
end
