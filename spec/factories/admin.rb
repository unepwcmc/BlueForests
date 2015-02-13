FactoryGirl.define do
  factory :admin do
    sequence(:email) { |n| "person#{n}@blueforest.com" }
    password "password"
    password_confirmation "password"
    country
  end
end
