ROLES = [
  {name: 'super_admin', description: 'Can edit users for all countries, edit validations and create field sites'},
  {name: 'project_manager', description: 'Can edit users, create Validations and create field sites'},
  {name: 'project_participant', description: 'Can make validations via the web or mobile tool'}
]

COUNTRIES = [
  {name: 'Mozambique', subdomain: 'mozambique', iso: 'MZ'},
  {name: 'Ecuador', subdomain: 'ecuador', iso: 'EC'},
  {name: 'Indonesia', subdomain: 'indonesia', iso: 'ID'},
  {name: 'Madagascar', subdomain: 'madagascar', iso: 'MD'}
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
  create_test_user(nil, Role.where(name: 'super_admin'))

  Country.all.each do |country|
    Role.where("name != 'super_admin'").each do |role|
      create_test_user(country, role)
    end
  end
end

def create_test_user country, roles
  roles = Array.wrap(roles)
  email = if country
    "#{roles.first.name}@#{country.subdomain}.blueforests.io"
  else
    "#{roles.first.name}@blueforests.io"
  end

  User.create({
    email: email,
    password: 'blueforests',
    password_confirmation: 'blueforests',
    country: country,
    roles: roles
  })
end

populate
