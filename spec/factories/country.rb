FactoryGirl.define do
  factory :country do
    sequence(:name) { |n| "Venezuela N. #{n}" }
    sequence(:subdomain) { |n| "venez#{n}" }
    sequence(:iso) { |n| "V#{n}" }
    bounds [[0,0], [1,1]]
  end
end
