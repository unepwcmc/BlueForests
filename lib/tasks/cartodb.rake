namespace :cartodb do
  def setup_carbon_view country, environment
    puts "### Setting up #{environment} carbon views for #{country.name}"
    puts CartoDb.query(render_template("carbon_view.sql.erb", with_binding: binding))
  end

  def setup_country_view country, environment
    puts "### Setting up #{environment} views for #{country.name}"

    Habitat.all.each do |habitat|
      puts CartoDb.query(render_template("country_view.sql.erb", with_binding: binding))
    end
  end

  def render_template(template_name, with_binding:)
    template_file = Rails.root.join('lib', 'tasks', 'templates', template_name)
    template = ERB.new(File.read(template_file))

    template.result(with_binding)
  end

  desc "Setup CartoDB habitat tables and views"
  task setup: :environment do
    Country.all.each do |country|
      ['development', 'production', 'staging'].each do |environment|
        setup_country_view(country, environment)
        setup_carbon_view(country, environment)
      end
    end
  end
end
