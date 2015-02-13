FactoryGirl.define do
  factory :validation do
    coordinates '[[1,2],[1,1],[1,2]]'
    action 'delete'
    habitat 'mangrove'
    admin
  end
end
