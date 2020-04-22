namespace :cartodb do
  def setup_carbon_view environment
    puts CartoDb.query(render_template("carbon_view.sql.erb", with_binding: binding))
  end

  def render_template(template_name, with_binding:)
    template_file = Rails.root.join('lib', 'tasks', 'templates', template_name)
    template = ERB.new(File.read(template_file))

    template.result(with_binding)
  end

  desc "Setup CartoDB habitat tables and views"
  task setup: :environment do
    ['development', 'production', 'staging'].each do |environment|
      setup_carbon_view environment
    end
  end

  desc "Create field sites table"
  task import_field_sites: :environment do
    CartoDb::FieldSites.import
  end
end
