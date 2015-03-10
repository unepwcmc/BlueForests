ROLES = [
  {name: 'super_admin', description: 'Can edit users for all countries, edit validations and create field sites'},
  {name: 'project_manager', description: 'Can edit users, create Validations and create field sites'},
  {name: 'project_participant', description: 'Can make validations via the web or mobile tool'}
]

COUNTRIES = [
  {name: 'Japan', subdomain: 'japan', iso: 'JP'}
]

def populate
  populate_roles
  populate_countries

  if Rails.env.production?
    puts '### WARNING ###'
    puts 'Users are not created by the seeds in production. You will have to create default admin users manually.'
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
  COUNTRIES.each do |country|
    ROLES.each do |role|
      Admin.create({
        email: "#{role[:name]}@#{country[:subdomain]}.blueforest.io",
        password: "blueforest",
        password_confirmation: 'blueforest',
        country: Country.where(name: country[:name]).first,
        roles: Role.where(name: role[:name])
      })
    end
  end
end

populate
