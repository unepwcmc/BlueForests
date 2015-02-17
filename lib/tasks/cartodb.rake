namespace :cartodb do
  def setup_carbon_view
    puts "### Setting up bc_carbon_view"

    template = Rails.root.join('lib', 'tasks', 'templates', "bc_carbon_view.sql")
    sql = File.read(template)

    puts CartoDb.query(sql)
  end

  def setup_country_views
    template_file = Rails.root.join('lib', 'tasks', 'templates', "country_view.sql.erb")
    template = ERB.new(File.read(template_file))

    ['development', 'production', 'staging'].each do |environment|
      Country.all.each do |country|
        puts "### Setting up #{environment} views for #{country.name}"

        Habitat.all.each do |habitat|
          puts CartoDb.query(template.result(binding))
        end
      end
    end
  end

  desc "Setup CartoDB habitat tables and views"
  task setup: :environment do
    setup_carbon_view
    setup_country_views
  end
end
