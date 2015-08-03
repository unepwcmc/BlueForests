ROLES = [
  {name: 'super_admin', description: 'Can edit users for all countries, edit validations and create field sites'},
  {name: 'project_manager', description: 'Can edit users, create Validations and create field sites'},
  {name: 'project_participant', description: 'Can make validations via the web or mobile tool'}
]

COUNTRIES = [
  {name: 'Mozambique', subdomain: 'mozambique', iso: 'MZ', bounds: [[-26.8602715039999, 30.2138452550002], [-10.4690080709999, 40.8479923840001]]},
  {name: 'Ecuador', subdomain: 'ecuador', iso: 'EC', bounds: [[-5.01137257899988, -92.0115860669999], [1.66437409100016, -75.2272639579999]]},
  {name: 'Indonesia', subdomain: 'indonesia', iso: 'ID', bounds: [[-10.9226213519998, 95.0127059250001], [5.9101016300001, 140.977626994]]},
  {name: 'Madagascar', subdomain: 'madagascar', iso: 'MG', bounds: [[-25.5985653629998, 43.2229110040001], [-11.9436174459998, 50.5039168630001]]}
]

def populate
  populate_roles
  populate_countries

  if Rails.env.production?
    puts '### WARNING ###'
    puts 'Users are not created by the seeds in production. You will have to create default users manually.'
  else
    populate_users
  end
end

def populate_roles
  puts '### Creating roles'
  ROLES.each { |role| Role.create(role) }
end

def populate_countries
  puts '### Creating countries'
  COUNTRIES.each { |country| Country.create(country) }
end

def populate_users
  puts '### Creating test users'
  create_test_user(Country.all, Role.where(name: 'super_admin'))

  Country.all.each do |country|
    Role.where("name != 'super_admin'").each do |role|
      create_test_user(country, role)
    end
  end
end

def create_test_user countries, roles
  countries = Array.wrap(countries)
  roles = Array.wrap(roles)

  email = if countries.length == 1
    "#{roles.first.name}@#{countries.first.subdomain}.blueforests.io"
  else
    "#{roles.first.name}@blueforests.io"
  end

  User.create({
    email: email,
    password: 'blueforests',
    password_confirmation: 'blueforests',
    countries: countries,
    roles: roles
  })
end

populate
