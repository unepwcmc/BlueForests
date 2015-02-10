roles = {
  "admin" => 'Can edit users, edit validations and create field sites',
  "project_manager" => 'Can edit Validations and create field sites',
  "project_participant" => 'Can make validations via the web or mobile tool'
}

puts "### Creating roles"
roles.each do |name, description|
  Role.create(name: name, description: description)
end

countries = [
  {name: "Japan", subdomain: "japan", iso: "JP"}
]

puts "### Creating countries"
countries.each do |country|
  Country.create(country)
end

if Rails.env.production?
  puts "### WARNING ###"
  puts "Users are not created by the seeds in production. You will have to create default admin users manually."
else
  puts "### Creating test user"
  Admin.create(
    email: 'decio.ferreira@unep-wcmc.org',
    password: 'decioferreira',
    password_confirmation: 'decioferreira',
    country: Country.first,
    roles: [Role.where(name: "admin").first]
  )
end
