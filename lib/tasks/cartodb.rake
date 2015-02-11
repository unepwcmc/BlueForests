namespace :cartodb do
  desc "Setup CartoDB habitat tables and views"
  task setup: :environment do
    queries = [
      "bc_carbon_view"
    ]

    queries.each do |query_name|
      puts "### Setting up #{query_name}"

      template = Rails.root.join('lib', 'tasks', 'templates', "#{query_name}.sql")
      sql = File.read(template)

      puts CartoDb.new.query(sql)
    end
  end
end
